# roleta-russa-android

App React Native (Expo) que consome as mesmas APIs do
`roleta-russa-backend` (Java/Jakarta EE - login, cadastro, ranking,
pontos, perfil) **e** do `roleta-russa-backend-node` (Node.js + Socket.IO

- multiplayer em tempo real) já usadas pelo `roleta-russa-frontend` (React
  web). Telas, regras do jogo, multiplayer **e visual** são portados do
  frontend web; a navegação usa `@react-navigation/native-stack`.

## Estrutura

```
roleta-russa-android/
├── App.js                        → NavigationContainer + Stack Navigator
├── assets/
│   ├── imagens/
│   │   ├── fundo.png               → mesma foto de fundo do web (public/imagens/fundo.png)
│   │   └── fotoPadrao.jpg          → mesmo avatar padrão do Perfil
│   └── audio/                     → efeitos sonoros do revólver (mesmos .mp3 do web)
│       ├── tiro.mp3, tiro_falso.mp3, arma_recarregando.mp3, error.mp3
├── src/
│   ├── config/api.js              → resolve EXPO_PUBLIC_API_URL e EXPO_PUBLIC_SOCKET_URL
│   ├── constants/theme.js         → cores/spacing, espelha variables.css
│   ├── context/ToastContext.js    → toasts globais (porta do ToastContext.jsx)
│   ├── game/
│   │   ├── powerUps.js             → itens/power-ups (cópia de src/game/powerUps.js, JS puro)
│   │   └── engine.js               → motor do revólver (gerarBalas/atirar/recarregar),
│   │                                  compartilhado entre Singleplayer e Multiplayer
│   ├── hooks/useGameSounds.js     → toca tiro/recarga/bala falsa observando o log do jogo
│   ├── services/socket.js         → singleton do cliente Socket.IO (porta de services/socket.js)
│   ├── utils/pontos.js            → POST /GanharPontos (compartilhado)
│   ├── components/
│   │   ├── Toast.js, Buttons.js, InputField.js
│   │   ├── ScreenBackground.js     → fundo gradiente OU foto+overlay (ver abaixo)
│   │   ├── BotaoMenu.js            → botão pill do menu (porta de BotaoMenu.jsx)
│   │   ├── DifficultyCards.js      → seletor Fácil/Médio/Difícil (Singleplayer + host do Multiplayer)
│   │   ├── ItemInventory.js        → barra de itens (cigarro/algemas/lupa/cerveja/serra)
│   │   ├── Formulario.js           → login/cadastro (porta de Formulario.jsx)
│   │   ├── Ranking.js              → porta de Ranking.jsx
│   │   ├── Feedbacks.js            → porta de Feedbacks.jsx (mural de comentários/sugestões/denúncias)
│   │   ├── FeedbackCard.js         → porta de FeedbackCard.jsx
│   │   └── TerminalSql.js          → porta de TerminalSql.jsx (executa SQL de verdade via /DevSql)
│   └── screens/
│       ├── LoginScreen.js, CadastroScreen.js
│       ├── HomeScreen.js
│       ├── SingleplayerGameScreen.js  → revólver + itens + pontos + sons, igual à web
│       ├── MultiplayerLobbyScreen.js  → lobby REAL via Socket.IO (lista/cria/entra em salas)
│       ├── MultiplayerRoomScreen.js   → sala REAL (chat + partida sincronizada em tempo real)
│       └── PerfilScreen.js            → dados do usuário + Área de DEV Vip (TerminalSql)
```

Sem tela de Configurações (nem a antiga tela de Intro) - foram removidas
de propósito e não fazem mais parte do escopo deste app.

## Multiplayer - como funciona

Implementado com o **mesmo protocolo** do web: `socket.io-client` falando
com o backend Node (`roleta-russa-backend-node`), usando exatamente os
mesmos eventos que `MultiplayerLobby.jsx` e `MultiplayerRoom.jsx` usam -
nenhuma rota nova foi criada no backend.

- **Lobby** (`lobby:listar`, `lobby:criar`, `lobby:entrar`,
  `lobby:atualizada`): lista salas públicas em tempo real, cria sala
  (pública ou privada com senha) e entra direto com um código.
- **Sala** (`room:atualizada`, `room:chat`, `room:hostState`,
  `room:estadoJogo`, `room:playerAction`, `room:sair`): chat ao vivo,
  lista de quem está jogando/assistindo, e a partida em si.

O modelo é o mesmo **"host-autoritativo com servidor relay"** explicado em
`roleta-russa-backend-node/src/socket/lobby.js`: quem cria a sala roda o
motor do jogo (`src/game/engine.js`) no próprio aparelho e publica o
estado resultante; o servidor Node só repassa mensagens, nunca entende as
regras do jogo. Por isso `src/game/engine.js` e `src/game/powerUps.js`
(cigarro/algemas/lupa/cerveja/serrote) são os MESMOS usados tanto no
Singleplayer quanto no Multiplayer - se um dia vocês mudarem uma regra do
jogo, muda num lugar só.

Pontos (`POST /GanharPontos`, no backend **Java**) são creditados nas duas
telas: 10 pts vencendo o bot, e o valor definido pelo backend pra vencer
outro jogador via multiplayer - mesma regra do web.

> Sem o `roleta-russa-backend-node` rodando, a tela de Multiplayer conecta
> mas a lista de salas nunca chega (fica em "Carregando salas..." /
> lista vazia). Suba-o com `docker compose up --build` (se ele estiver no
> `docker-compose.yml` da raiz) ou `npm start` dentro de
> `roleta-russa-backend-node/`.

## Feedbacks, Terminal SQL e efeitos sonoros

As três últimas peças que faltavam pra fechar a paridade com o web:

- **Feedbacks** (`Feedbacks.js` + `FeedbackCard.js`) substituiu de vez o
  antigo widget de Novidades na Home, igual ao web: formulário pra postar
  Comentário/Sugestão/Denúncia, filtro por tipo, e lista alimentada pelos
  próprios jogadores. Mesmos endpoints: `GET/POST /ListarFeedbacks` e
  `POST /CriarFeedback`.
- **Terminal SQL** (`TerminalSql.js`, usado por `PerfilScreen.js` quando
  `cargo === "DEV"`) executa SQL de verdade contra `POST /DevSql` no
  backend **Java** - o mesmo endpoint sensível do web, com a mesma
  validação no servidor (cargo `DEV` conferido no banco, nunca só no
  app). **Esse endpoint só responde se o backend Java estiver rodando com
  a variável `ENABLE_DEV_SQL=true`** - sem ela, o servidor devolve 404 de
  propósito (nem revela que a rota existe). Veja o aviso de segurança
  completo nos comentários de `DevSqlServlet.java`.
  - Não portamos o miniformulário de "Cadastrar novidade" que ainda existe
    dentro do `TerminalSql.jsx` do web - ele fala com `CadastrarNovidade`,
    do sistema antigo de Novidades que a própria Home web já não usa mais
    (trocou pra Feedbacks). Manter essa forma legada aqui só adicionaria
    uma tela morta.
- **Efeitos sonoros** do revólver (`useGameSounds.js`) - tiro, bala falsa
  e recarga, usando os mesmos `.mp3` de
  `public/audio/efeitos_sonoros/`. Como `src/game/engine.js` é uma função
  **pura** (sem tocar som sozinha, de propósito, pra poder ser reusada
  tanto no host quanto no visitante do Multiplayer), o hook decide o que
  tocar observando as novas linhas do log a cada jogada - a mesma técnica
  que `MultiplayerRoom.jsx` já usa no web pro lado de quem não é host. O
  arquivo `error.mp3` foi copiado junto (mesma pasta do web) mas não está
  conectado a nada - o próprio web também não usa esse arquivo em lugar
  nenhum do código atual.

## Paridade visual com o frontend web

`ScreenBackground` reproduz os dois padrões de fundo do CSS:

- **`variant="gradient"`** (padrão) - gradiente diagonal escuro
  (navy → roxo), usado em Login/Cadastro. É o que `login.module.css`
  realmente renderiza: o `background-image: url(fundo.png)` daquele
  arquivo é sobrescrito por um `background: linear-gradient(...)` logo
  abaixo no CSS (cascata) - a foto nunca aparece nessas duas telas, nem
  aqui.
- **`variant="image"`** - a foto `fundo.png` com overlay preto a 75% de
  opacidade por cima, usado em Home, Singleplayer, Multiplayer e Perfil
  (mesmo padrão de `.home` / `.pagePanel` / `.perfilPage`).

Outros pontos replicados do web:

- Botão de logout flutuante no canto superior esquerdo da Home, com ícone
  Material (`@expo/vector-icons`) em vez de emoji, igual ao
  `material-symbols-outlined` do CSS.
- Menu da Home em botões "pill" translúcidos com borda (`BotaoMenu.js`),
  igual ao `botaoMenu` do web, em vez dos botões retangulares usados antes.
- Rodapé com as mesmas duas colunas (Redes sociais / Tecnologias) e os
  mesmos links (Instagram, YouTube, Chess.com, GitHub).
- Perfil: mesma foto de avatar, e agora busca os dados atualizados do
  usuário em `GET /BuscarUsuario` (com botão "🔄 Atualizar do servidor"),
  igual ao `PerfilPage.jsx` atual.

### O que ainda ficou de fora

- Tela de **Estudos/Sobre o projeto** não foi portada.
- O rodapé lista a stack real do Android (React Native/Expo/Jakarta
  EE/MySQL) em vez de copiar literalmente "React/HTML/CSS/JSX" do web, já
  que essas tecnologias não se aplicam ao app nativo.
- Música de fundo (a tela de Configurações que a controlava foi removida
  de propósito e não está no escopo deste app).

## Navegação

Usa `@react-navigation/native` + `@react-navigation/native-stack` (que por
sua vez depende de `react-native-screens` e `react-native-safe-area-context`,
já no `package.json`). Cada tela recebe `navigation`/`route` automaticamente
do React Navigation.

Rotas registradas em `App.js`: `Login` (inicial), `Cadastro`, `Home`,
`Singleplayer`, `Multiplayer`, `MultiplayerRoom`, `Perfil`.

## Rodando em desenvolvimento

```bash
cd roleta-russa-android
npm install
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL - veja os comentários no arquivo
npm start
```

Depois, no terminal do Expo: `a` para abrir no emulador Android, ou escaneie
o QR code com o app **Expo Go** no celular físico (celular e computador
precisam estar na mesma rede Wi-Fi).

### Backends

Este projeto usa **dois** backends, exatamente como o web:

1. **`roleta-russa-backend`** (Java) - login, cadastro, ranking, pontos,
   perfil. Suba com `docker compose up --build` na raiz do projeto (veja
   `SETUP.md`).
2. **`roleta-russa-backend-node`** (Node.js + Socket.IO) - multiplayer.
   Rode com `npm start` dentro de `roleta-russa-backend-node/` (ou via
   Docker, se estiver no `docker-compose.yml`).

O app aponta pra eles via duas variáveis de ambiente:

| Variável                 | Backend                | Emulador Android       | Celular físico (Expo Go)   |
| ------------------------ | ---------------------- | ---------------------- | -------------------------- |
| `EXPO_PUBLIC_API_URL`    | Java (porta 8080)      | `http://10.0.2.2:8080` | `http://SEU_IP_LOCAL:8080` |
| `EXPO_PUBLIC_SOCKET_URL` | Node (porta 3000/3001) | `http://10.0.2.2:3001` | `http://SEU_IP_LOCAL:3001` |

Em produção, use as URLs públicas de cada serviço (Render, etc.).

> Terminal SQL da Área de DEV Vip: só funciona se o backend Java estiver
> rodando com `ENABLE_DEV_SQL=true` (veja `roleta-russa-backend/README.md`
> / `DevSqlServlet.java`). Sem essa variável, o endpoint fica desativado
> de propósito (404), mesmo pra quem tem cargo `DEV`.

---

## Como gerar um APK

Duas formas de gerar um instalável Android real (fora do Expo Go): **EAS
Build** (nuvem da Expo, não precisa instalar Android Studio) ou **build
local** (precisa do Android SDK instalado). Ambas partem do mesmo comando
`npm install` já feito.

### Opção A — EAS Build (recomendado, mais simples)

O [EAS Build](https://docs.expo.dev/build/introduction/) é o serviço da
própria Expo que compila o app na nuvem deles e devolve um link pra baixar
o `.apk`/`.aab` pronto. Não precisa de Android Studio nem de JDK
instalados na sua máquina.

1. **Crie uma conta grátis** em [expo.dev](https://expo.dev) (se ainda não
   tiver).

2. **Instale a CLI do EAS** (globalmente, uma vez só):

   ```bash
   npm install -g eas-cli
   ```

3. **Faça login**:

   ```bash
   eas login
   ```

4. **Configure o projeto** (gera o `eas.json` com os perfis de build):

   ```bash
   cd roleta-russa-android
   eas build:configure
   ```

   Escolha **Android** quando perguntado. Isso cria um `eas.json` na raiz
   do projeto com perfis `development`, `preview` e `production`.

5. **Ajuste o perfil `preview` para gerar um `.apk`** (por padrão o EAS
   gera `.aab`, o formato exigido pela Play Store, mas um `.aab` não
   instala direto num celular - pra instalar manualmente você quer um
   `.apk`). Edite `eas.json`:

   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         }
       },
       "production": {}
     }
   }
   ```

6. **Rode o build**:

   ```bash
   eas build --platform android --profile preview
   ```

   A primeira vez, o EAS pergunta se quer que ele gere e gerencie a
   **keystore** (chave de assinatura do app) automaticamente - responda
   que sim, é o caminho mais simples pra um projeto de estudo. O comando
   vai enfileirar o build na nuvem da Expo; acompanhe o progresso pelo link
   impresso no terminal (ou em expo.dev → seu projeto → Builds).

7. **Baixe o APK**: quando o build terminar (alguns minutos), o terminal
   mostra um link de download - ou baixe pela página do build em
   expo.dev. Transfira o `.apk` pro celular (cabo USB, link direto, Google
   Drive, etc.) e instale (é preciso permitir "instalar apps de fontes
   desconhecidas" nas configurações do Android, já que o app não vem da
   Play Store).

> `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_SOCKET_URL`: como esses valores são
> embutidos no app **no momento do build**, garanta que o `.env` aponta
> pras URLs públicas dos dois backends (Render, etc.) antes de rodar
> `eas build` - `10.0.2.2` só funciona em emulador, não em um APK
> instalado num celular de verdade.

### Opção B — Build local (precisa de Android Studio/SDK)

Use esse caminho se preferir não depender do serviço em nuvem da Expo, ou
quiser gerar o APK totalmente offline.

**Pré-requisitos:**

- [Android Studio](https://developer.android.com/studio) instalado, com o
  **Android SDK** e pelo menos uma versão de **Build-Tools** baixados
  (Android Studio → More Actions → SDK Manager).
- Variável de ambiente `ANDROID_HOME` (ou `ANDROID_SDK_ROOT`) apontando pro
  SDK - o instalador do Android Studio geralmente já configura isso.
- JDK 17 (o mesmo já usado pelo `roleta-russa-backend`).

**Passos:**

1. **Gere os projetos nativos** (pasta `android/`) a partir do projeto
   Expo gerenciado:

   ```bash
   cd roleta-russa-android
   npx expo prebuild --platform android
   ```

   Isso cria a pasta `android/` com um projeto Gradle completo. Não
   precisa commitar essa pasta - ela é regenerada a partir do `app.json` e
   das dependências sempre que necessário (já está no `.gitignore` padrão
   do Expo).

2. **Gere o APK de debug** (mais rápido, assinado com uma chave de debug
   automática - serve pra testar no seu próprio celular, mas não pra
   distribuir):

   ```bash
   cd android
   ./gradlew assembleDebug
   ```

   O APK sai em:
   `android/app/build/outputs/apk/debug/app-debug.apk`

3. **Ou gere o APK de release** (otimizado, mas exige uma keystore de
   assinatura - veja abaixo):
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   O APK sai em:
   `android/app/build/outputs/apk/release/app-release.apk`

**Assinando o build de release:** por padrão, `assembleRelease` falha (ou
gera um APK não instalável em outros aparelhos) sem uma keystore própria.
Pra criar uma:

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore roleta-russa-release.keystore \
  -alias roleta-russa -keyalg RSA -keysize 2048 -validity 10000
```

Guarde o arquivo `.keystore` gerado **fora do controle de versão** (mesma
regra do `.env` - nunca commitar) e configure
`android/gradle.properties` + `android/app/build.gradle` com o caminho e
as senhas, conforme a
[documentação oficial do React Native sobre geração de APK assinado](https://reactnative.dev/docs/signed-apk-android).
Se você só quer testar no seu próprio aparelho, o `assembleDebug` (passo 2)
já resolve sem precisar de nada disso.

**Instalando direto num celular conectado via USB** (com depuração USB
ativada nas opções de desenvolvedor do Android):

```bash
npx expo run:android --variant release
```

Esse comando faz o build e já instala no dispositivo/emulador conectado
automaticamente, sem precisar copiar o `.apk` manualmente.

---

## O que já foi portado da web

- Login / Cadastro (mesmos endpoints `CadastrarServlet` / `AutenticarServlet`)
- Home com Ranking e Feedbacks (`ListarUsuarios` / `ListarFeedbacks` /
  `CriarFeedback`)
- Singleplayer contra bot - motor do jogo, itens/power-ups, pontos
  (`GanharPontos`) e efeitos sonoros idênticos à web
- **Multiplayer funcional de verdade**: lobby em tempo real, salas
  públicas/privadas, chat, e partida sincronizada via Socket.IO (mesmos
  eventos e mesmo backend Node do web), com os mesmos efeitos sonoros
- Tela de Perfil (via `AsyncStorage` + `GET /BuscarUsuario`), com a Área
  de DEV Vip usando o Terminal SQL de verdade (`POST /DevSql`)
- Fundo, cores, ícones e formato dos botões espelhando o CSS do web (veja
  "Paridade visual" acima)

## O que falta / próximos passos

- Tela de Estudos/Sobre o projeto
