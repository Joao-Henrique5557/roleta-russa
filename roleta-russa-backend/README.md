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

## Configuração (banco de dados)

O jeito recomendado é rodar tudo via `docker compose up --build` na raiz do
projeto — o MySQL sobe containerizado e o backend já vem configurado para
achá-lo automaticamente (veja `docker-compose.yml`: `DB_URL=jdbc:mysql://db:3306/...`).

Se você for rodar o backend fora do Docker (Eclipse, por exemplo), primeiro
suba só o banco (`docker compose up -d db` na raiz), e o backend vai achar
ele em `localhost:3306` usando o `.env` já presente em
`src/main/resources/.env`:

```
DB_URL=jdbc:mysql://localhost:3306/roleta_russa?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USER=root
DB_PASSWORD=NovaSenhaForte123!
```

A senha precisa bater com a definida em `DB_PASSWORD` no `.env` da raiz do
projeto (usado pelo `docker-compose.yml` pra configurar o container do
MySQL). Depois de editar esse `.env`, é preciso um **Maven → Update
Project** (ou `mvn clean package`) no Eclipse para o arquivo entrar no
build — só salvar não é suficiente se o WAR já tinha sido gerado antes.

A ordem de resolução em `ConnectionFactory` é: variável de ambiente real do
sistema (usada pelo Docker Compose) → arquivo `.env` do classpath (usado
pelo Eclipse) → valor padrão hardcoded como último recurso.

Veja **[SETUP.md](../SETUP.md)** na raiz do projeto para o guia completo.

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
