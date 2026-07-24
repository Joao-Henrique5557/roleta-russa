// src/constants/estudosData.js
//
// PAINEL DE CONTROLE E CONTEÚDO DIDÁTICO DO PROJETO ROLETA RUSSA
// Este arquivo atua como um repositório completo de conhecimento e arquitetura do projeto.

"use strict";

export const descricaoProjeto = {
  titulo:
    "🎰 A Alma do Projeto: Engenharia de Software por trás da Roleta Russa",
  paragrafos: [
    "O projeto 'Roleta Russa' (inspirado em dinâmicas de alta tensão como Buckshot Roulette) é um laboratório prático de engenharia de software full stack. Seu propósito central é simular a experiência estressante de um cassino clandestino retrô, utilizando o jogo como pano de fundo para resolver e demonstrar problemas reais de arquitetura de sistemas, concorrência, comunicação em tempo real e gerenciamento estrito de estado.",
    "Para ir além de uma aplicação web convencional, o projeto adota uma abordagem comparativa única: a mesma regra de negócio (autenticação, salas de jogo, contagem de pontos, rankings e lógica do tambor) foi implementada em duas pilhas de backend totalmente distintas — Java (Jakarta EE / Servlets) e Node.js (Express) —, ambas compartilhando o mesmo banco de dados MySQL via Docker. Adicionalmente, o ecossistema inclui um sistema multiplayer distribuído acoplado via WebSockets (Socket.IO).",
    "Abaixo, você encontra um curso/manual detalhado sobre todas as tecnologias e conceitos fundamentais aplicados na construção desta aplicação.",
  ],
};

export const linksUteis = [
  {
    titulo: "📦 Repositório Oficial do Projeto no GitHub",
    url: "https://github.com/Joao-Henrique5557/roleta-russa",
    tipo: "codigo",
  },
  {
    titulo: "📖 Documentação Oficial do React (Gerenciamento de Estado)",
    url: "https://react.dev/learn",
    tipo: "readme",
  },
  {
    titulo: "⚡ Guia de Socket.IO e Comunicação em Tempo Real",
    url: "https://socket.io/docs/v4/",
    tipo: "readme",
  },
  {
    titulo: "☕ Especificação Jakarta Servlets (Java EE)",
    url: "https://jakarta.ee/specifications/servlet/",
    tipo: "readme",
  },
];

export const materiais = [
  {
    titulo: "Diagrama de Arquitetura Multicamada",
    tipo: "imagem",
    src: "/docs/fluxoGramas/diagrama-arquitetura.png",
    descricao:
      "Mapeamento das conexões: Front-end React → Backend Java/Node → MySQL & Socket.IO.",
  },
  {
    titulo: "Fluxograma da Máquina de Estados do Jogo",
    tipo: "imagem",
    src: "/docs/fluxoGramas/fluxo-jogo.png",
    descricao:
      "Mapeamento das transições: Lobby → Aposta → Girar Tambor → Ação do Item → Disparo → Game Over.",
  },
  {
    titulo: "fluxo do modo singleplayer - versão sem power ups (codigo)",
    tipo: "imagem",
    src: "/docs/fluxoGramas/fluxoGramaModoSiglePlayer.png",
  },
];

export const tecnologias = [
  {
    nome: "React 19",
    categoria: "Front-end Core",
    descricao:
      "Biblioteca declarativa para construção da interface baseada em componentes reativos, hooks customizados e ciclo de vida otimizado.",
  },
  {
    nome: "JavaScript (ES6+) & Async/Await",
    categoria: "Linguagem & Motor",
    descricao:
      "Lógica de controle, execução assíncrona baseada em Event Loop, manipulação avançada de arrays e chamadas HTTP/WebSocket.",
  },
  {
    nome: "CSS Modules",
    categoria: "Estilização & UI",
    descricao:
      "Estilização escopada localmente por componente, garantindo isolamento total, prevenção de vazamento de regras e visual retrô customizado.",
  },
  {
    nome: "Vite",
    categoria: "Build Tool",
    descricao:
      "Ferramenta de empacotamento ultrarrápida com Hot Module Replacement (HMR) e servidor de desenvolvimento baseado em módulos ES nativos.",
  },
  {
    nome: "Node.js & Express",
    categoria: "Backend Assíncrono",
    descricao:
      "Servidor leve orientado a eventos e I/O não-bloqueante para processamento rápido de rotas REST e orquestração do multiplayer.",
  },
  {
    nome: "Socket.IO",
    categoria: "Multiplayer em Tempo Real",
    descricao:
      "Comunicação bidirecional full-duplex sobre WebSocket com tratamento de reconexão automática, agrupamento por salas (rooms) e eventos customizados.",
  },
  {
    nome: "Java 17 & Jakarta EE (Servlets)",
    categoria: "Backend Tradicional",
    descricao:
      "Arquitetura robusta orientada a objetos usando Servlets e HTTP puro no Tomcat para comparar desempenho, concorrência e padrões de design.",
  },
  {
    nome: "JDBC (Java Database Connectivity)",
    categoria: "Persistência Relacional",
    descricao:
      "Acesso direto ao banco de dados sem ORM no Java, manipulando transações, comandos SQL preparados (PreparedStatement) e prevenção de SQL Injection.",
  },
  {
    nome: "MySQL 8",
    categoria: "Banco de Dados Relacional",
    descricao:
      "Armazenamento estruturado e persistente de usuários, histórico de partidas, pontuação global e auditoria de transações.",
  },
  {
    nome: "Docker & Docker Compose",
    categoria: "Infraestrutura & DevOps",
    descricao:
      "Isolamento do ambiente completo em containers padronizados, permitindo subir Banco, Backends e Front-end com um único comando.",
  },
  {
    nome: "Web Audio API / HTML5 Audio",
    categoria: "Efeitos Sonoros & Imersão",
    descricao:
      "Gerenciamento de efeitos sonoros retro/arcade com pré-carregamento e disparo imediato sem latência perceptível no momento do gatilho.",
  },
];

export const playlists = [
  {
    titulo: "Comunicação de Redes e Soquetes com Java",
    playlistId: "PLXpJXj3bxppwwQPKOjDnd0rlVbjCOAfcW",
    descricao:
      "Curso de redes cobrindo arquitetura cliente-servidor, sockets TCP/IP e envio de objetos/mensagens entre processos.",
  },
  {
    titulo: "curso de java para web utilizando o modelo MVC",
    playlistId: "PLbEOwbQR9lqz9AnwhrrOLz9cz1-TxoiUg",
    descricao: "Crie servlets para tratar requisões e APIs"
  },
  {
    titulo: "curso de Typescript",
    videoId: "QoqDr4H2G8U",
    descricao: "aprenda Typescript"
  }
  
];

export const conceitos = {
  mecanicasJogo: [
    {
      titulo:
        "1. O Tambor Revolver como Array Circular & Algoritmo de Embaralhamento",
      texto:
        "O coração mecânico da Roleta Russa é a simulação física do tambor de um revólver. Estruturalmente, o tambor é tratado como uma lista ou array contendo diferentes tipos de cargas (munições reais, de festim ou câmaras vazias). Para garantir que a distribuição das balas seja genuinamente imprevisível, o jogo implementa o algoritmo de embaralhamento Fisher-Yates (Knuth Shuffle). A cada rodada, o array de munições é embaralhado com complexidade de tempo O(n). A avanço da câmara a cada tiro é gerido através do operador resto da divisão (índice = (índiceAtual + 1) % tamanhoDoTambor), criando um ciclo contínuo sobre a estrutura circular de dados.",
    },
    {
      titulo: "2. Cálculo Dinâmico de Probabilidades e Gestão de Risco",
      texto:
        "Diferente de um jogo de azar puramente aleatório, o projeto introduz decisões estratégicas (como em Buckshot Roulette). O jogador tem visibilidade de quantas munições totais existem e quantas já foram disparadas. A interface calcula dinamicamente a probabilidade percentual de o próximo gatilho resultar em disparo real: P(Disparo) = (Balas Reais Restantes) / (Câmaras Não Disparadas Restantes). Essa métrica altera o valor das apostas e influencia o comportamento da IA no modo singleplayer ou o tempo de tomada de decisão do oponente no modo multiplayer.",
    },
    {
      titulo: "3. O Delay Assíncrono Dramático (Engenharia de Suspense)",
      texto:
        "O ato de puxar o gatilho não é uma atualização de tela instantânea. Para simular a tensão psicológica do cassino, a ação dispara uma cadeia assíncrona controlada: 1) Trava imediata da interface para evitar cliques duplos (debounce/lock state); 2) Execução do som do mecanismo do cão da arma batendo (Web Audio API); 3) Criação de uma Promise com retardo proposital (`setTimeout` encapsulado de 1.5 a 3 segundos); 4) Avaliação da condição de disparo; 5) Execução do som de estopim ou clique seco; 6) Atualização da vida/pontuação do jogador e transição da máquina de estados.",
    },
    {
      titulo:
        "4. Sistema de Itens Modificadores (Power-Ups) e Inversão de Regras",
      texto:
        "Assim como no Buckshot Roulette, os jogadores recebem itens com efeitos especiais na mesa (ex: Lupa para ver a bala atual, Serrote para dobrar o dano, Algemas para pular o turno do oponente, Cerveja para ejetar a munição atual). A implementação desses itens no backend/frontend exige o uso do padrão de projeto Command e Strategy: cada item é uma classe/função que recebe o estado atual do jogo, valida se ele pode ser usado, aplica uma mutação pontual no tambor ou no jogador, e registra o efeito no log global de eventos.",
    },
  ],

  react: [
    {
      titulo: "1. Renderização Declarativa, Virtual DOM e Algoritmo de Diffing",
      texto:
        "O React abstrai o manuseio direto do DOM do navegador (que é extremamente lento). Em vez disso, mantém em memória uma estrutura de dados leve chamada Virtual DOM. Quando o estado da partida muda (ex: vida do jogador diminui de 100 para 50), o React gera uma nova árvore de Virtual DOM e executa o algoritmo de comparação (Reconciliation/Diffing). Ele descobre exatamente qual nó de texto foi alterado e aplica a alteração mínima necessária no DOM real. No nosso jogo, isso garante que a animação da mesa não sofra queda de quadros por segundo (FPS) durante atualizações intensas.",
    },
    {
      titulo: "2. Gestão Estrita de Estado: useState vs useRef vs useReducer",
      texto:
        "Entender quando usar cada hook é vital para o projeto: O `useState` guarda dados que alteram o visual da tela ao mudarem (ex: pontos, vida, lista de itens no inventário), forçando uma nova renderização. O `useRef` é usado para valores mutáveis que precisam persistir durante todo o ciclo de vida da tela MAS NÃO devem provocar re-renderizações (ex: referências a instâncias de áudio `<audio>`, timers de intervalo do contador de tempo ou conexões do socket). Por fim, o `useReducer` centraliza a lógica complexa de estado do jogo (uma máquina de estados finita com ações como 'DISPARAR', 'USAR_ITEM', 'TROCAR_TURNO'), evitando múltiplos `useState` desordenados.",
    },
    {
      titulo:
        "3. Ciclo de Vida e Efeitos Colaterais Controlados (useEffect e Cleanup)",
      texto:
        "O `useEffect` é o canal de comunicação entre o mundo puramente declarativo do React e os efeitos colaterais imperativos (I/O, ouvintes de WebSocket, timers e áudio). Uma parte crítica ensinada no projeto é a **função de limpeza (cleanup function)**. Quando um componente de partida desmonta ou quando o jogador sai da sala, o `useEffect` executa `socket.off()` e `clearTimeout()`. Sem esse cuidado, a aplicação sofreria de Memory Leaks (vazamentos de memória) e eventos duplicados sendo ouvidos em segundo plano.",
    },
    {
      titulo:
        "4. Injeção de Dependências com Context API e Evitando Prop Drilling",
      texto:
        "Em uma aplicação complexa, repassar propriedades por 5 ou 6 níveis de componentes filhos (Prop Drilling) torna o código frágil e difícil de manter. O projeto utiliza o `React Context` para criar provadores globais (como `ToastContext` para notificações de erro/vitória, `AuthContext` para dados do usuário logado e `SocketContext` para a conexão ativa do multiplayer). Qualquer componente na árvore pode consumir esses contextos diretamente através do hook `useContext` sem intermediários.",
    },
  ],

  javascript: [
    {
      titulo: "1. Imutabilidade Prática e Copiabilidade na Memória",
      texto:
        "Em JavaScript, objetos e arrays são passados por referência. Modificar uma propriedade diretamente (ex: `estadoJogo.jogadores[0].vida = 80`) viola o princípio de imutabilidade do React, fazendo com que a biblioteca não detecte que o objeto mudou. O projeto utiliza intensamente o operador de espalhamento (Spread Operator `...`) e métodos imutáveis de array (`.map()`, `.filter()`, `.slice()`) para criar novas instâncias de objetos a cada modificação, permitindo comparações de referência ultrarrápidas (`estadoAntigo !== estadoNovo`).",
    },
    {
      titulo:
        "2. Assincronismo Profundo: Event Loop, Callbacks, Promises e Async/Await",
      texto:
        "O motor do JavaScript é *single-threaded* (executa em uma única thread principal). Para não travar a interface do usuário durante chamadas de rede ou esperas de tempo, ele utiliza o Event Loop com uma fila de tarefas (Task Queue) e microtarefas (Microtask Queue). As `Promises` e a sintaxe `async/await` no projeto são usadas para estruturar o fluxo assíncrono como se fosse síncrono. Isso é aplicado ao esperar a resposta do backend, sincronizar os efeitos sonoros de gatilho e pausar a IA antes de sua jogada.",
    },
    {
      titulo: "3. Closures e o Escopo de Variáveis no Tempo",
      texto:
        "Uma Closure ocorre quando uma função interna 'lembra' e mantém acesso às variáveis do seu escopo pai, mesmo após essa função pai ter terminado sua execução. No contexto do jogo, Closures são fundamentais em manipuladores de eventos (`event handlers`) e timers (`setTimeout`), garantindo que quando a animação de tiro terminar, a função ainda tenha acesso aos dados corretos de qual jogador efetuou o disparo.",
    },
  ],

  nodejs: [
    {
      titulo: "1. Modelo I/O Não-Bloqueante Baseado em Eventos (Event Loop)",
      texto:
        "Diferente dos servidores web tradicionais que criam uma nova thread pesada no sistema operacional para cada requisição recebida, o Node.js utiliza a biblioteca `libuv` para gerenciar I/O assíncrono. Uma única thread atende milhares de conexões simultâneas. Quando o servidor Node precisa consultar o banco MySQL ou enviar um pacote de rede, ele delega a operação para o sistema operacional e continua livre para processar outras requisições. Quando a resposta do banco chega, uma função de callback é disparada.",
    },
    {
      titulo: "2. Arquitetura de Middlewares no Express.js",
      texto:
        "O Express estrutura o processamento de requisições HTTP como uma cadeia de funções conhecidas como Middlewares. Cada requisição passa sequencialmente por um 'pipeline': 1) Middleware de CORS (liberação de origens); 2) Middleware de parsing (`express.json()` para ler o corpo da requisição); 3) Middleware de Autenticação JWT (validação do token nos cabeçalhos); 4) Rota de destino. Se um middleware encontrar uma falha (ex: token inválido), ele interrompe o fluxo imediatamente respondendo com status 401.",
    },
    {
      titulo:
        "3. WebSockets Bidirecionais e Arquitetura de Salas com Socket.IO",
      texto:
        "Enquanto o HTTP tradicional funciona no modelo Pergunta-Resposta (o cliente obrigatoriamente precisa iniciar a conversa), o protocolo WebSocket estabelece um canal TCP permanente e bidirecional (*Full-Duplex*). O servidor Socket.IO no Node.js permite que o backend envie dados proativamente para o navegador (Push Notification). O projeto utiliza o conceito de 'Rooms' (Salas) do Socket.IO: quando dois jogadores entram em uma partida, eles são colocados na sala `sala_123`. Quando um jogador atira, o evento `jogador_atirou` é transmitido instantaneamente apenas para os integrantes daquela sala específica.",
    },
  ],

  java: [
    {
      titulo: "1. Arquitetura Jakarta EE (Servlets) e Ciclo de Vida no Tomcat",
      texto:
        "No backend Java, a aplicação utiliza a API padronizada de Jakarta Servlets rodando dentro do container de servlets Apache Tomcat. Cada endpoint (ex: `/api/login`) é mapeado para uma classe Java decorada com `@WebServlet`. Quando o servidor recebe uma requisição HTTP, o Tomcat gerencia uma Thread do seu Thread Pool e chama os métodos `doGet()` ou `doPost()` da instância do Servlet. Diferente do Node, o Java lida com concorrência criando múltiplas threads paralelas que executam simultaneamente em múltiplos núcleos do processador.",
    },
    {
      titulo: "2. Persistência de Dados Direta com JDBC e PreparedStatements",
      texto:
        "Sem o uso de abstrações pesadas (como ORMs/Hibernate), o projeto utiliza JDBC puro para entender a fundo a camada de dados. O manuseio de dados utiliza `PreparedStatement`, uma técnica onde o comando SQL é pré-compilado pelo MySQL e os parâmetros do usuário são injetados separadamente. Isso garante dois grandes benefícios: 1) Desempenho otimizado no reuso de queries; 2) Proteção absoluta contra ataques de SQL Injection, pois os dados digitados pelo usuário jamais são interpretados como comandos executáveis.",
    },
    {
      titulo: "3. Gestão Segura de Recursos com try-with-resources",
      texto:
        "Conexões com bancos de dados, objetos `Statement` e `ResultSet` consomem recursos finitos do sistema (sockets de rede e memória). Se não forem fechados adequadamente após o uso, provocam o esgotamento do banco de dados (Connection Leak). O Java 7+ introduziu a estrutura `try-with-resources` (`try (Connection conn = dataSource.getConnection()) { ... }`). Qualquer objeto que implemente a interface `AutoCloseable` declarado dentro dos parênteses do `try` é automaticamente fechado ao final do bloco, ocorrendo erro ou não.",
    },
    {
      titulo: "4. Comparativo de Comparação de Strings: == vs .equals()",
      texto:
        "Um conceito clássico de orientação a objetos Java que foi enfrentado na construção do motor do jogo: O operador `==` em Java compara se duas variáveis de referência apontam para o MESMO ENDEREÇO na memória Heap. O método `.equals()` compara o CONTEÚDO das strings. Durante a validação das regras da rodada (verificar se o nome do jogador atual é igual ao dono do turno), o uso de `.equals()` é indispensável, pois duas Strings criadas em momentos diferentes da execução possuem endereços de memória distintos, mesmo contendo os mesmos caracteres.",
    },
  ],

  infraBD: [
    {
      titulo: "1. Modelagem Relacional e Normalização no MySQL",
      texto:
        "O banco de dados relacional armazena a estrutura persistente da aplicação em tabelas normalizadas (Usuários, Partidas, Pontuações e Logs de Aposta). Chaves primárias (`PRIMARY KEY`) garantem a unicidade das entidades, enquanto chaves estrangeiras (`FOREIGN KEY`) com restrições de integridade referencial impedem a criação de registros órfãos (ex: uma pontuação atrelada a um usuário inexistente). Índices B-Tree são criados em colunas de busca frequente (como `email` e `pontos`) para acelerar a execução das consultas de Ranking.",
    },
    {
      titulo: "2. Conteinerização Multisserviços com Docker e Docker Compose",
      texto:
        "Para eliminar o problema do 'na minha máquina funciona', toda a infraestrutura do projeto é empacotada em containers isolados via Docker. O arquivo `docker-compose.yml` orquestra três serviços independentes: 1) O container do banco MySQL com volumes persistentes para que os dados não sumam ao desligar; 2) O container do backend (Java/Tomcat ou Node.js); 3) O container do front-end rodando em ambiente de produção. O Compose cria uma rede virtual privada (`bridge network`) onde os containers se comunicam pelos seus nomes de serviço em vez de IPs estáticos.",
    },
  ],
};
