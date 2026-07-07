# roleta-russa-backend v1.2 — migração do Firestore para MySQL local

O backend deixou de depender do Firebase/Firestore (serviço de terceiros na
nuvem) e passou a usar **MySQL rodando localmente**, acessado via JDBC puro
através de uma `ConnectionFactory` (`util/ConnectionFactory.java`). O
objetivo é focar 100% em desenvolvimento local, sem credenciais de serviços
externos para configurar.

## O que mudou

- Removido: `firebase-admin`, `FirebaseConfig.java`, toda a API do
  Cloud Firestore.
- Adicionado: driver `mysql-connector-j`, `util/ConnectionFactory.java`
  (abre conexões JDBC via `DriverManager`, configurável por variáveis de
  ambiente), e `db/schema.sql` na raiz do projeto com as tabelas
  `usuarios` e `novidades`.
- `UsuarioDAO` e `NovidadeDAO` reescritos para usar `PreparedStatement` /
  `ResultSet` em vez de `Firestore`/`DocumentSnapshot`.
- IDs agora são inteiros auto-incrementados pelo MySQL (antes eram IDs de
  documento do Firestore). O bean `Usuario`/`Novidade` continua expondo o
  `id` como `String` para não quebrar o front-end, só convertendo
  internamente no DAO.
- Duplicidade de e-mail agora é garantida por uma constraint `UNIQUE` no
  schema, capturada como `SQLIntegrityConstraintViolationException` — mais
  simples e sem condição de corrida, comparado ao SELECT manual que era
  necessário no Firestore.
- `GET /Status` agora testa a conexão com o MySQL (`bancoConectado`) em vez
  do Firestore.

## Configuração (variáveis de ambiente, todas opcionais)

| Variável      | Padrão                                                                                   |
|---------------|-------------------------------------------------------------------------------------------|
| `DB_URL`      | `jdbc:mysql://localhost:3306/roleta_russa?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `DB_USER`     | `root`                                                                                     |
| `DB_PASSWORD` | *(vazio)*                                                                                  |

Se seu MySQL local usa usuário/senha diferentes do padrão, defina essas
variáveis (no seu IDE, no `.env` da raiz para Docker Compose, ou direto no
shell antes de rodar `mvn`).

## Rodando localmente (sem Docker)

```bash
# 1. Tenha o MySQL instalado e rodando (porta 3306 padrão)
# 2. Crie o schema (uma vez só)
mysql -u root -p < ../db/schema.sql

# 3. Build do .war
mvn clean package

# 4. Rode com qualquer servidor Jakarta EE 9 (ex: Tomcat 10.0.x local),
#    ou use o Docker (veja SETUP.md na raiz do projeto).
```

## Endpoints

| Método | Caminho              | Descrição                                   |
|--------|-----------------------|----------------------------------------------|
| GET    | `/Status`              | Health check (backend + MySQL)                |
| POST   | `/CadastrarServlet`    | Cadastra usuário (`nome`, `email`, `senha`)   |
| POST   | `/AutenticarServlet`   | Login (`usuario`/`email`, `senha`)            |
| GET    | `/ListarUsuarios`      | Ranking (top 10 por pontos)                   |
| GET    | `/BuscarUsuario?id=`   | Dados atuais de um usuário                    |
| POST   | `/GanharPontos`        | Soma pontos (`id`, `forma`=bot\|player)       |
| GET    | `/ListarNovidades`     | Lista novidades ativas                        |
| POST   | `/CadastrarNovidade`   | Cria novidade                                 |

Todos os parâmetros são enviados como `application/x-www-form-urlencoded`
(compatível com o front-end em `roleta-russa-frontend`).

## Segurança

- Senhas nunca são armazenadas em texto puro — usamos hash SHA-256
  (`util/PasswordUtil.java`) antes de gravar no MySQL.
- O `CorsFilter` só libera `http://localhost:5173` por padrão (mais
  qualquer origem extra que você configurar via `ALLOWED_ORIGINS`).
