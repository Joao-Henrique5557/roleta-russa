# Roleta Russa — Full Stack

Jogo de **Russian Roulette** com cadastro/login, ranking de jogadores, sistema
de novidades e modo multiplayer (lobby criado; partida remota ainda em
desenvolvimento).

Projeto de estudo, focado inteiramente em **desenvolvimento local** — sem
depender de serviços de terceiros (nuvem, Firebase, deploy hospedado, etc.).

| Camada    | Tecnologia                                           |
| --------- | ---------------------------------------------------- |
| Frontend  | React 19 + Vite                                      |
| Backend   | Java 17 + Jakarta Servlet 5 rodando em Tomcat 10     |
| Banco     | MySQL local, acessado via JDBC (`ConnectionFactory`) |
| Dev local | Docker Compose (backend + frontend em containers)    |

## Estrutura

```
roleta-russa-full/
├── roleta-russa-backend/     → API Java/Tomcat
├── roleta-russa-frontend/    → SPA React/Vite
├── db/schema.sql              → Script de criação do banco MySQL
├── docker-compose.yml        → Orquestra os dois serviços para desenvolvimento
├── .env.example               → Modelo das variáveis de conexão com o MySQL
├── SETUP.md                   → Guia completo (MySQL, Docker, troubleshooting)
└── README.md                  → Este arquivo
```

## Início rápido

### 1. Pré-requisitos

- [MySQL](https://dev.mysql.com/downloads/) instalado e rodando na sua
  máquina (porta 3306 padrão).
- [Docker Engine](https://docs.docker.com/engine/install/) e o plugin
  **Docker Compose v2** (comando `docker compose`, sem hífen) — só se for
  usar Docker. Confirme com:
  ```bash
  docker compose version
  ```
  Se der erro `unknown command: docker compose`, veja
  **[SETUP.md → Instalando o Docker Compose v2](./SETUP.md#instalando-o-docker-compose-v2)**.
  (Também é possível rodar tudo sem Docker — veja
  **[SETUP.md → Opção B](./SETUP.md#opção-b-sem-docker-java--nodejs-locais)**.)

### 2. Crie o banco (uma vez só)

```bash
mysql -u root -p < db/schema.sql
```

Isso cria o database `roleta_russa` com as tabelas `usuarios` e
`novidades`. Veja **[SETUP.md → Seção 1](./SETUP.md#1-configurar-o-mysql-local)**
se precisar instalar o MySQL do zero.

Se seu MySQL não usar `root` sem senha, copie `.env.example` para `.env` na
raiz do projeto e ajuste `DB_USER`/`DB_PASSWORD`.

### 3. Suba o projeto

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080

Deu algum erro? Vá direto para
**[SETUP.md → Troubleshooting](./SETUP.md#6-troubleshooting)** — a seção cobre
os problemas mais comuns (permissão do Docker, versão do Compose, Node no
container, conexão com o MySQL, CORS).

---

## Endpoints disponíveis

| Método | Rota                 | Descrição                      |
| ------ | -------------------- | ------------------------------ |
| GET    | `/Status`            | Health check (backend + MySQL) |
| POST   | `/CadastrarServlet`  | Cadastro de usuário            |
| POST   | `/AutenticarServlet` | Login                          |
| GET    | `/ListarUsuarios`    | Ranking (top 10)               |
| GET    | `/BuscarUsuario?id=` | Dados atuais de um usuário     |
| POST   | `/GanharPontos`      | Somar pontos a um usuário      |
| GET    | `/ListarNovidades`   | Listar novidades ativas        |
| POST   | `/CadastrarNovidade` | Criar novidade                 |

## Regras do jogo

- Um tiro **falso** em si mesmo mantém a vez do jogador atual.
- Um tiro **real** em si mesmo (ou qualquer tiro no oponente) passa a vez.
- A dificuldade (`facil` / `medio` / `dificil`) altera a proporção de balas
  reais no tambor a cada recarga.

## Roadmap

- [ ] Multiplayer remoto de verdade (serializar o estado do jogo por turno via
      socket/WebSocket) — o lobby já existe, falta a partida em si.
- [ ] Testes automatizados (JUnit no backend, Vitest no frontend)

## Documentação relacionada

- Backend: [`roleta-russa-backend/README.md`](./roleta-russa-backend/README.md)
- Frontend: [`roleta-russa-frontend/README.md`](./roleta-russa-frontend/README.md)
- Guia completo: [`SETUP.md`](./SETUP.md)
