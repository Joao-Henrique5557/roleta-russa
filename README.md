# Roleta Russa — Full Stack

Jogo de **Russian Roulette** com cadastro/login, ranking de jogadores, sistema
de novidades e modo multiplayer (lobby criado; partida remota ainda em
desenvolvimento).

Projeto de estudo, focado inteiramente em **desenvolvimento local** — sem
depender de serviços de terceiros (nuvem, Firebase, deploy hospedado, etc.).

| Camada    | Tecnologia                                                 |
| --------- | ---------------------------------------------------------- |
| Frontend  | React 19 + Vite                                            |
| Backend   | Java 17 + Jakarta Servlet 5 rodando em Tomcat 10           |
| Banco     | MySQL, containerizado via Docker Compose                   |
| Dev local | Docker Compose (banco + backend + frontend, um comando só) |

## Estrutura

```
roleta-russa-full/
├── roleta-russa-backend/     → API Java/Tomcat
├── roleta-russa-frontend/    → SPA React/Vite
├── db/schema.sql              → Script de criação do banco MySQL (aplicado automaticamente)
├── docker-compose.yml        → Orquestra banco + backend + frontend
├── .env.example               → Modelo da senha do MySQL
├── SETUP.md                   → Guia completo (Docker, alternativa via Eclipse, troubleshooting)
└── README.md                  → Este arquivo
```

## Início rápido

### 1. Pré-requisito único: Docker

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac)
  ou Docker Engine + **Compose v2** (Linux). Confirme com:
  ```bash
  docker compose version
  ```
  Se der erro `unknown command: docker compose`, veja
  **[SETUP.md → Instalando o Docker Compose v2](./SETUP.md#instalando-o-docker-compose-v2)**.

Não precisa instalar MySQL, Java ou Node na sua máquina — tudo roda
containerizado. (Se preferir debugar o backend direto no Eclipse, isso
também é possível — veja
**[SETUP.md → Alternativa](./SETUP.md#alternativa-rodando-o-backend-fora-do-docker-eclipse)**.)

### 2. Suba o projeto

```bash
docker compose up --build
```

Na primeira vez, o container do MySQL já cria o banco `roleta_russa` e as
tabelas sozinho (usando `db/schema.sql`) — nenhum passo manual de banco de
dados é necessário.

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Checagem do banco: http://localhost:8080/Status → `"bancoConectado": true`

Deu algum erro? Vá direto para
**[SETUP.md → Troubleshooting](./SETUP.md#troubleshooting)** — cobre os
problemas mais comuns (porta 3306 ocupada, permissão do Docker, versão do
Compose, Node no container, CORS).

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
