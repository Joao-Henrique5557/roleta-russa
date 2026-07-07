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

CREATE TABLE IF NOT EXISTS novidades (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    titulo           VARCHAR(120) NOT NULL,
    descricao        TEXT         NOT NULL,
    tipo             VARCHAR(40)  NOT NULL,
    autor            VARCHAR(60)  NOT NULL DEFAULT 'Anônimo',
    versao           VARCHAR(20)  NOT NULL DEFAULT '1.0.0',
    data_publicacao  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo            BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Opcional: uma novidade de exemplo para o front-end não começar vazio.
INSERT INTO novidades (titulo, descricao, tipo, autor, versao, ativo)
SELECT 'Migração para MySQL local', 'O backend agora usa MySQL local (ConnectionFactory/JDBC) no lugar do Firestore.', 'MELHORIA', 'João Henrique', '2.0.0', TRUE
WHERE NOT EXISTS (SELECT 1 FROM novidades);
