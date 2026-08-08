CREATE DATABASE IF NOT EXISTS roleta_russa
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE roleta_russa;

CREATE TABLE IF NOT EXISTS usuarios (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nome           VARCHAR(60)  NOT NULL,
    email          VARCHAR(120) NOT NULL UNIQUE,
    senha          VARCHAR(64)  NOT NULL,              -- hash SHA-256 (hex), nunca texto puro
    pontos         INT          NOT NULL DEFAULT 0,
    cargo          VARCHAR(30)  NOT NULL DEFAULT 'usuario',
    data_cadastro  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comentários, sugestões e denúncias enviados pelos jogadores.
-- Ver db/migration_002_feedbacks.sql para o histórico/detalhes desta tabela
-- e como aplicá-la num banco de produção já existente.
CREATE TABLE IF NOT EXISTS feedbacks (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    tipo           ENUM('COMENTARIO', 'SUGESTAO', 'DENUNCIA') NOT NULL,
    mensagem       TEXT         NOT NULL,
    autor          VARCHAR(60)  NOT NULL DEFAULT 'Anônimo',
    usuario_id     INT          NULL,
    status         ENUM('ABERTO', 'EM_ANALISE', 'RESOLVIDO', 'ARQUIVADO') NOT NULL DEFAULT 'ABERTO',
    data_criacao   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo          BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_feedbacks_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL,
    INDEX idx_feedbacks_tipo (tipo),
    INDEX idx_feedbacks_status (status)
);
