# roleta-russa-backend-node

Backend em **Node.js + Express**, criado como exercício de estudo:
implementa **os mesmos endpoints** do backend principal em Java
(`roleta-russa-backend`), lendo e escrevendo nas **mesmas tabelas MySQL**
(`db/schema.sql`, na raiz do projeto) - dá pra trocar de um pro outro só
mudando `VITE_API_URL` no front-end, sem tocar em nada mais.

> **O backend "de verdade" deste projeto continua sendo o Java**
> (`roleta-russa-backend`). Este backend em Node existe para: (1) comparar
> como a mesma regra de negócio fica em duas linguagens/stacks diferentes e
> (2) hospedar o **servidor de multiplayer** (salas, chat, lobby), que usa
> WebSocket (Socket.IO) - algo que dá pra fazer em Java/Jakarta também, mas
> que é bem mais direto em Node.

## Por que os dois backends existem juntos

|                          | Java (`roleta-russa-backend`) | Node (`roleta-russa-backend-node`) |
| ------------------------ | ----------------------------- | ---------------------------------- |
| Papel                    | **Backend principal**         | Backend de estudo + multiplayer    |
| Framework                | Jakarta Servlets + Tomcat     | Express                            |
| Porta padrão             | 8080                          | 3000                               |
| Rotas REST               | ✅ (idênticas)                | ✅ (idênticas)                     |
| WebSocket / multiplayer  | não implementado              | ✅ Socket.IO                       |
| Terminal SQL (`/DevSql`) | ✅ (`DevSqlServlet.java`)     | ✅ (`src/routes/dev.js`)           |

O front-end usa o Java (`VITE_API_URL`) pra login/cadastro/ranking/perfil, e
usa o Node (`VITE_SOCKET_URL`) só pra multiplayer (Socket.IO). Veja o
`.env.example` do front-end.

## Rodando

### Via Docker Compose (recomendado)

Já vem configurado no `docker-compose.yml` da raiz, como o serviço
`backend-node`, escutando em `http://localhost:3001` (mapeado da porta 3000
do container, pra não colidir com o Java em 8080). Basta:

```bash
docker compose up --build
```

### Local (fora do Docker)

```bash
cd roleta-russa-backend-node
cp .env.example .env      # ajuste DB_HOST=localhost se o MySQL estiver em docker compose up -d db
npm install
npm run dev                # ou "npm start"
```

## Endpoints REST (iguais ao backend Java)

| Método | Rota                 | Descrição                                                   |
| ------ | -------------------- | ----------------------------------------------------------- |
| GET    | `/Status`            | Health check (backend + MySQL)                              |
| POST   | `/CadastrarServlet`  | Cadastro de usuário                                         |
| POST   | `/AutenticarServlet` | Login                                                       |
| GET    | `/ListarUsuarios`    | Ranking (top 10)                                            |
| GET    | `/BuscarUsuario?id=` | Dados de um usuário                                         |
| POST   | `/GanharPontos`      | Soma pontos                                                 |
| GET    | `/ListarNovidades`   | Lista novidades ativas                                      |
| POST   | `/CadastrarNovidade` | Cria novidade                                               |
| POST   | `/DevSql`            | Terminal SQL da Área DEV (ver aviso de segurança no código) |

## Multiplayer (Socket.IO)

Veja os comentários em `src/socket/lobby.js` - lá está explicado, em
detalhe, o **modelo "host-autoritativo com servidor relay"** usado (o
mesmo princípio usado por jogos como Among Us: o "host" nunca abre porta
nenhuma, quem faz o trabalho de repassar mensagens é este servidor Node).

Principais eventos:

- `lobby:criar` / `lobby:entrar` / `lobby:listar`
- `room:chat`
- `room:hostState` (só o host publica) / `room:playerAction` (o outro
  jogador manda intenção de jogada)
- `room:sair`

## Conceitos de Node.js/JavaScript que este backend exercita

- **Event loop assíncrono**: toda a I/O (banco, sockets) é `async/await`
  sobre Promises, sem bloquear a thread principal - bem diferente do
  modelo de threads do Tomcat/Java.
- **Middlewares Express**: `cors`, `express.json`, `express.urlencoded`
  formam uma "esteira" pela qual toda requisição passa, igual a um
  `Filter` (`CorsFilter.java`) no mundo Jakarta.
- **Pool de conexões** (`mysql2/promise`): evita abrir/fechar uma conexão
  TCP nova a cada requisição.
- **WebSocket / Socket.IO**: comunicação bidirecional e em tempo real,
  algo que HTTP tradicional (request/response) não faz sozinho.
