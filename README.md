# Roleta Russa — Full Stack

Jogo de **Russian Roulette** com cadastro/login, ranking de jogadores, sistema
de novidades, itens/power-ups (estilo Buckshot Roulette) e modo **multiplayer
em tempo real** (salas públicas/privadas, espectadores, chat).

Projeto de estudo, focado inteiramente em **desenvolvimento local** — sem
depender de serviços de terceiros (nuvem, Firebase, deploy hospedado, etc.).
Todo o código é comentado com a intenção de ensinar, não só de funcionar —
tanto pra mim revisitar depois quanto pra qualquer outra pessoa lendo.

| Camada            | Tecnologia                                                       |
| ----------------- | ---------------------------------------------------------------- |
| Frontend          | React 19 + Vite                                                  |
| Backend principal | Java 17 + Jakarta Servlet 5 rodando em Tomcat 10                 |
| Backend de estudo | Node.js + Express (mesmos endpoints) + Socket.IO (multiplayer)   |
| Banco             | MySQL, containerizado via Docker Compose                         |
| Laboratório (dev) | Next.js + Prisma (opcional, não faz parte da stack "de verdade") |
| Dev local         | Docker Compose (banco + 2 backends + frontend, um comando só)    |

## Estrutura

```
roleta-russa-full/
├── roleta-russa-backend/       → API Java/Tomcat — BACKEND PRINCIPAL
├── roleta-russa-backend-node/  → API Node/Express (espelho de estudo) + servidor de multiplayer (Socket.IO)
├── roleta-russa-frontend/      → SPA React/Vite
├── roleta-russa-lab-nextjs/    → Laboratório opcional (Next.js + Prisma) — só dev, não integrado
├── db/schema.sql                → Script de criação do banco MySQL (aplicado automaticamente)
├── docker-compose.yml          → Orquestra banco + backend Java + backend Node + frontend
├── .env.example                 → Modelo da senha do MySQL
├── SETUP.md                     → Guia completo (Docker, alternativa via Eclipse, troubleshooting)
└── README.md                    → Este arquivo
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
- Backend Java (principal): http://localhost:8080
- Backend Node (estudo + multiplayer): http://localhost:3001
- Checagem do banco: http://localhost:8080/Status → `"bancoConectado": true`

Deu algum erro? Vá direto para
**[SETUP.md → Troubleshooting](./SETUP.md#troubleshooting)** — cobre os
problemas mais comuns (porta 3306 ocupada, permissão do Docker, versão do
Compose, Node no container, CORS).

---

## Endpoints disponíveis (backend Java e backend Node — idênticos)

| Método | Rota                 | Descrição                                             |
| ------ | -------------------- | ----------------------------------------------------- |
| GET    | `/Status`            | Health check (backend + MySQL)                        |
| POST   | `/CadastrarServlet`  | Cadastro de usuário                                   |
| POST   | `/AutenticarServlet` | Login                                                 |
| GET    | `/ListarUsuarios`    | Ranking (top 10)                                      |
| GET    | `/BuscarUsuario?id=` | Dados atuais de um usuário                            |
| POST   | `/GanharPontos`      | Somar pontos a um usuário                             |
| GET    | `/ListarNovidades`   | Listar novidades ativas                               |
| POST   | `/CadastrarNovidade` | Criar novidade                                        |
| POST   | `/DevSql`            | Terminal SQL da Área DEV do Perfil (ver seção abaixo) |

O front-end fala com o backend Java via `VITE_API_URL` e com o servidor de
multiplayer (Node/Socket.IO) via `VITE_SOCKET_URL` — veja
`roleta-russa-frontend/.env.example`.

## Regras do jogo

- Um tiro **falso** em si mesmo mantém a vez do jogador atual.
- Um tiro **real** em si mesmo (ou qualquer tiro no oponente) passa a vez.
- A dificuldade (`facil` / `medio` / `dificil`) altera a proporção de balas
  reais no tambor a cada recarga.

### Itens / power-ups

A cada recarga do revólver, os dois lados ganham itens aleatórios (não
consomem a vez ao usar, exceto onde indicado). Veja a lógica comentada em
`roleta-russa-frontend/src/game/powerUps.js`:

| Item    | Ícone | Efeito                                                      |
| ------- | ----- | ----------------------------------------------------------- |
| Cigarro | 🚬    | Recupera 1 vida (não passa do máximo).                      |
| Algemas | 🔗    | O oponente perde a próxima vez dele.                        |
| Lupa    | 🔍    | Revela se a bala atual da câmara é real ou falsa.           |
| Cerveja | 🍺    | Ejeta a bala da câmara atual sem atirar (avança o tambor).  |
| Serrote | 🪚    | O seu próximo tiro certeiro no oponente causa dano dobrado. |

Disponível tanto no **Singleplayer** (você vs. bot) quanto no **Multiplayer**
(você vs. outra pessoa).

## Multiplayer

Acessível pelo menu principal ("Multiplayer: entrar em sala"). Funciona
assim:

- Qualquer pessoa pode **criar uma sala pública** (aparece pra todo mundo na
  lista) ou **privada** (precisa de senha e do código da sala pra entrar).
- Cada sala comporta **2 jogadores** (quem joga a partida) + **quantos
  espectadores quiserem** (assistem e conversam no chat, mas não jogam).
- Cada sala tem seu próprio **chat** em tempo real.
- Quem cria a sala vira o **anfitrião ("host")**: o jogo roda autoritativamente
  no navegador dele, e um servidor central (o backend Node) faz o papel de
  "relay" - repassando mensagens entre os participantes, do mesmo jeito que
  jogos como Among Us funcionam por trás dos panos (o "host" não abre porta
  nenhuma na internet; quem faz esse trabalho é o servidor). Veja a explicação
  completa nos comentários de
  `roleta-russa-backend-node/src/socket/lobby.js` e
  `roleta-russa-frontend/src/pages/game/MultiplayerRoom.jsx`.
- Se o anfitrião sair no meio da partida, a sala migra automaticamente o
  papel de host pra outro participante (testado — veja o backend Node).

## Área de DEV Vip (terminal SQL) e como virar DEV

A tela de **Perfil** tem uma seção "Área de DEV Vip" que só aparece pra
usuários com `cargo = 'DEV'` no banco. Nela, é possível rodar comandos SQL
diretamente contra o MySQL (útil pra depurar/estudar sem precisar abrir um
cliente de banco separado). A validação de permissão acontece **no
backend** (Java `DevSqlServlet.java` e Node `src/routes/dev.js`), não só no
front-end — então só marcar `cargo` no `localStorage` não é suficiente, e
isso é proposital (veja os avisos de segurança nos comentários desses dois
arquivos).

### Como dar cargo DEV pra um usuário

Por padrão, todo cadastro novo recebe `cargo = 'usuario'`. Pra promover
alguém a DEV, rode um `UPDATE` direto no MySQL que já está rodando no
Docker:

```bash
# 1. Abra um shell de MySQL dentro do container do banco:
docker compose exec db mysql -uroot -p"NovaSenhaForte123!" roleta_russa

# (troque a senha acima se você alterou DB_PASSWORD no seu .env)
```

Já dentro do prompt do MySQL (`mysql>`):

```sql
-- Promove pelo e-mail (mais confiável que nome, já que é único):
UPDATE usuarios SET cargo = 'DEV' WHERE email = 'seu-email@exemplo.com';

-- Conferir se funcionou:
SELECT id, nome, email, cargo FROM usuarios WHERE email = 'seu-email@exemplo.com';

-- Pra sair do prompt do MySQL:
exit
```

Também dá pra fazer tudo numa linha só, sem entrar no prompt interativo:

```bash
docker compose exec db mysql -uroot -p"NovaSenhaForte123!" roleta_russa \
  -e "UPDATE usuarios SET cargo='DEV' WHERE email='seu-email@exemplo.com';"
```

Depois de rodar o `UPDATE`, faça logout e login de novo no jogo (ou clique em
"🔄 Atualizar do servidor" na tela de Perfil) — o front-end guarda os dados
do usuário no `localStorage` no momento do login, então ele não percebe a
mudança de cargo sozinho até recarregar essa informação.

> Alternativa sem terminal: se você preferir uma interface gráfica, pode
> rodar um [Adminer](https://www.adminer.org/) apontando pro mesmo banco, ou
> usar o próprio laboratório `roleta-russa-lab-nextjs` (`npx prisma studio`)
> pra editar a tabela `usuarios` visualmente.

## 📚 Tela de Estudos

O menu principal tem um botão **"📚 Sobre o projeto / Estudos"**, com:

- Descrição do projeto e das tecnologias usadas;
- Links pros READMEs e repositórios;
- Materiais de estudo (fotos/arquivos, pensados pra ficar em
  `roleta-russa-frontend/public/docs/`);
- **Playlists de cursos** (embeds do YouTube, uma seção com várias
  playlists empilhadas);
- **Conceitos principais** de React, JavaScript, TypeScript, Node.js e Java
  usados pra construir o projeto, com explicações expansíveis.

Toda essa tela é **dirigida por dados**: o conteúdo mora inteiro em
`roleta-russa-frontend/src/constants/estudosData.js` (um arquivo `.js`
comum, comentado, com instruções de como editar). O componente
(`EstudosPage.jsx`) só sabe desenhar o que tiver nesse arquivo — pra
atualizar a tela (nova playlist, novo material, nova tecnologia) basta
editar esse arquivo de dados, sem tocar em JSX.

## Backends: por que dois?

- **Java** (`roleta-russa-backend`) é o **backend principal** deste
  projeto.
- **Node.js** (`roleta-russa-backend-node`) reimplementa os MESMOS
  endpoints, como exercício de comparação entre stacks, e hospeda o
  servidor de multiplayer (Socket.IO), que é mais direto de fazer em
  Node. Veja `roleta-russa-backend-node/README.md` para a comparação
  detalhada entre os dois.

## Laboratório opcional: Next.js + Prisma

`roleta-russa-lab-nextjs/` é um **laboratório separado, só para
desenvolvimento**, sem relação com o `docker-compose.yml` principal - serve
pra estudar Next.js (SSR) e Prisma (ORM) do zero, lendo do mesmo banco
MySQL. Veja `roleta-russa-lab-nextjs/README.md`. Não é (e não deve virar)
parte da stack de produção deste projeto.

## Roadmap

- [x] Backend Node.js equivalente ao Java
- [x] Multiplayer com salas públicas/privadas, espectadores e chat
- [x] Itens/power-ups no singleplayer e multiplayer
- [x] Terminal SQL na Área de DEV do Perfil
- [x] Tela de Estudos orientada a dados
- [ ] Testes automatizados (JUnit no backend, Vitest no frontend)
- [ ] Migração completa do front-end pra TypeScript

## Documentação relacionada

- Backend Java (principal): [`roleta-russa-backend/README.md`](./roleta-russa-backend/README.md)
- Backend Node (estudo + multiplayer): [`roleta-russa-backend-node/README.md`](./roleta-russa-backend-node/README.md)
- Frontend: [`roleta-russa-frontend/README.md`](./roleta-russa-frontend/README.md)
- Laboratório Next.js + Prisma: [`roleta-russa-lab-nextjs/README.md`](./roleta-russa-lab-nextjs/README.md)
- Guia completo: [`SETUP.md`](./SETUP.md)
