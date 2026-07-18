import { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./game.module.css";
import { useSoundEffect } from "../../hooks/useSoundEffect";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/apiError";

// ---- Lógica do revólver ----

// Gera um array de balas (true = real, false = falsa) e a quantidade de balas reais
function gerarBalas(dificuldade) {
  // numero aleatório de balas entre 2 e 6
  let quantBalas = Math.floor(Math.random() * 5) + 2; // 2–6
  let quantVerdadeiras;

  if (dificuldade === "facil") {
    quantVerdadeiras = 1;

    if (quantBalas >= 3) quantBalas = 3;
  } else if (dificuldade === "medio") {
    quantVerdadeiras = 2;

    if (quantBalas <= 4 && quantBalas < 6) quantBalas += 1;
  } else {
    quantVerdadeiras = 3;

    if (quantBalas <= 3 && quantBalas < 6) quantBalas += 1;
  }

  // aray vazio de balas, preenchido com false (falsas)
  const balas = new Array(quantBalas).fill(false);

  let colocadas = 0;

  // preencher o revolver
  while (colocadas < quantVerdadeiras) {
    // enquanto não colocar todas as balas reais
    const pos = Math.floor(Math.random() * quantBalas); // posição aleatória do array

    if (!balas[pos]) {
      // se a posição estiver vazia (false), coloca uma bala real (true)
      balas[pos] = true;
      colocadas++; // aumentar o contador de balas reais colocadas
    }
  }
  // retornar o array de balas e a quantidade de balas reais
  return { balas, quantVerdadeiras };
}

// Função que retorna o estado inicial do jogo, com base na dificuldade escolhida
function estadoInicial(dificuldade) {
  const { balas, quantVerdadeiras } = gerarBalas(dificuldade);
  return {
    fase: "jogando",
    dificuldade,
    rodada: 1,
    vezDe: "jogador",
    jogador: { vidas: 3, alive: true },
    bot: { vidas: 3, alive: true },
    balas,
    posAtual: 0,
    quantVerdadeiras,
    log: [
      `🔫 Rodada 1 iniciada — ${balas.length} câmaras, ${quantVerdadeiras} bala(s) real(is).`,
    ],
    esperandoBot: false,
  };
}

// Função que recarrega o revólver, gerando novas balas e atualizando o estado do jogo
function recarregar(estado, playRecarga) {
  // som
  playRecarga();

  const { balas, quantVerdadeiras } = gerarBalas(estado.dificuldade);
  return {
    ...estado,
    balas,
    posAtual: 0,
    quantVerdadeiras,
    rodada: estado.rodada + 1,
    log: [
      ...estado.log,
      `🔁 Revólver recarregado — Rodada ${estado.rodada + 1} | ${balas.length} câmaras, ${quantVerdadeiras} bala(s) real(is).`,
    ],
  };
}

function atirar(estado, alvo, playTiro, playRecarga, playBalaFalsa) {
  const { balas, posAtual } = estado; // desconstrução do estado atual
  const isVerdadeira = balas[posAtual]; // verifica se é verdadeira
  const novoPos = posAtual + 1; // avança para a próxima posição do tambor

  let novoJogador = { ...estado.jogador }; // nova "versão" da mesma coisa
  let novoBot = { ...estado.bot }; // nova "versão" da mesma coisa
  let logEntry;
  let mudaVez;

  if (alvo === "self") {
    const quemAtira = estado.vezDe === "jogador" ? "Você" : "Bot"; // quem atira é eu?

    if (isVerdadeira) {
      // se for verdadeira
      // bala real NÃO passa mais a vez
      playTiro(); // toca o som do tiro
      logEntry = `💥 ${quemAtira} atirou em si mesmo — bala REAL! -1 vida. Mantém a vez.`;

      if (estado.vezDe === "jogador")
        novoJogador.vidas -= 1; // se a vez for minha, tiro em mim mesmo, então perco vida
      else novoBot.vidas -= 1; // se for a vez do bot, tiro nele mesmo, então ele perde vida
      mudaVez = false; // <-- não perde a vez
    } else {
      playBalaFalsa();
      logEntry = `💨 ${quemAtira} atirou em si mesmo — bala falsa. Mantém a vez.`;
      mudaVez = false; // não muda a vez
    }
  } else {
    // alvo é o outro jogador
    const quemAtira = estado.vezDe === "jogador" ? "Você" : "Bot"; // ex1. jogador
    const fraseAlvo = estado.vezDe === "jogador" ? "no Bot" : "em você"; // ex1. no bot

    if (isVerdadeira) {
      // se for verdadeira
      logEntry = `💥 ${quemAtira} atirou ${fraseAlvo} — bala REAL! -1 vida.`; // log

      playTiro(); // toca o som do tiro
      if (estado.vezDe === "jogador")
        novoBot.vidas -= 1; // se a vez for minha, tiro no bot, então ele perde vida
      else novoJogador.vidas -= 1; // se for a vez do bot, tiro em mim, então eu perco vida
    } else {
      playBalaFalsa();
      logEntry = `💨 ${quemAtira} atirou ${fraseAlvo} — bala falsa.`;
    }
    mudaVez = true; // sempre muda a vez quando atira no outro jogador, independente de ser bala real ou falsa
  }

  if (novoJogador.vidas <= 0) novoJogador.alive = false; // se eu não tiver vida: morrer
  if (novoBot.vidas <= 0) novoBot.alive = false; // se o bot não tiver vida: morrer

  // novo estado apos o tiro
  let novoEstado = {
    ...estado,
    jogador: novoJogador,
    bot: novoBot,
    posAtual: novoPos,
    log: [...estado.log, logEntry], // adiciona logEntry na lista
    vezDe: mudaVez // calcula a vez automaticamente
      ? estado.vezDe === "jogador" // se a vez for do jogador, passa para o bot, senão fica com o jogador
        ? "bot"
        : "jogador"
      : estado.vezDe, // senão for jogador, quem então? bot
  };

  if (!novoJogador.alive || !novoBot.alive) {
    // alguem morreu? se sim, vai para a fase de resultado
    return { ...novoEstado, fase: "resultado" };
  }

  if (novoPos >= balas.length) {
    // nova posição é maior que a capacidade do revolver? então o revolver precisa ser recarregado
    // [BUG FIX] recarregar() já toca playRecarga() internamente — antes o
    // caller (agir()) tocava esse mesmo som de novo comparando "rodada",
    // fazendo o efeito sonoro de recarga tocar duas vezes seguidas no
    // turno do jogador (o turno do bot não tinha essa checagem extra,
    // então o comportamento estava inconsistente entre os dois).
    novoEstado = recarregar(novoEstado, playRecarga);
  }

  return novoEstado;
}

async function ganharPontos(urlAPI, showToast) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) return;

  const dados = new URLSearchParams();
  dados.append("id", usuario.id);
  dados.append("forma", "bot");

  try {
    await axios.post(`${urlAPI}/GanharPontos`, dados, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 5000,
    });
  } catch (error) {
    // [MELHORIA] Antes o erro só ia pro console.error e o jogador nunca
    // ficava sabendo que os pontos não foram salvos. Agora usa o mesmo
    // padrão de toast + getErrorMessage já usado em Formulario/Ranking/Novidades.
    const mensagem = getErrorMessage(
      error,
      "Não foi possível salvar seus pontos.",
    );
    showToast(mensagem, "error");
  }
}

// ---- Componente ----
export default function SingleplayerGame({ onBack, onConfig, urlAPI }) {
  const [estado, setEstado] = useState(null); // estado global do jogo, inicialmente null (tela de setup)
  const [pontosEnviados, setPontosEnviados] = useState(false);

  const { showToast } = useToast();

  const playTiro = useSoundEffect("/audio/efeitos_sonoros/tiro.mp3");
  const playRecarga = useSoundEffect(
    "/audio/efeitos_sonoros/arma_recarregando.mp3",
  );
  const playBalaFalsa = useSoundEffect("/audio/efeitos_sonoros/tiro_falso.mp3");

  // função para colocar a dificuldade escolhida e iniciar o jogo, chamando estadoInicial() e setEstado()
  const iniciar = useCallback((dificuldade) => {
    setEstado(estadoInicial(dificuldade)); // inicia o estado do jogo com a dificuldade escolhida
  }, []);

  // Atirar
  const agir = useCallback(
    (alvo) => {
      // alvo = "self" ou "opponent"
      setEstado((prev) => {
        // atualiza o estado do jogo com base no estado anterior
        if (!prev || prev.fase !== "jogando" || prev.vezDe !== "jogador")
          return prev; // se não tiver estado, ou se a fase não for "jogando", ou se não for a vez do jogador, retorna o estado anterior sem alterações
        // se não precisa atualizar, continue

        let novo = atirar(prev, alvo, playTiro, playRecarga, playBalaFalsa); // realizar o tiro, retorna o estado da partida a cada tiro

        // [BUG FIX] Removida a checagem `if (novo.rodada !== prev.rodada) playRecarga();`
        // que existia aqui. atirar() já chama recarregar() internamente
        // quando o tambor esvazia, e recarregar() já toca o som de recarga
        // sozinho — essa segunda chamada duplicava o efeito sonoro.

        if (novo.fase === "jogando" && novo.vezDe === "bot") {
          novo = { ...novo, esperandoBot: true };
        }
        return novo;
      });
    },
    [playTiro, playRecarga, playBalaFalsa],
  );

  // roda toda rederização [estado, playTiro, playRecarga], para verificar se o bot está jogando.
  useEffect(() => {
    // se o estado não existir, ou o bot não estiver esperando ou a fase é diferente de "jogando", então não faz nada
    if (!estado || !estado.esperandoBot || estado.fase !== "jogando") return;

    // de primeira, !estado = true e !estado.esperandoBot = true e estado.fase !== "jogando" true
    // isso acontece para a tela setup, então o bot não pensa

    // de segunda(minha vez),
    // !estado = false e !estado.esperandoBot = true e estado.fase !== "jogando" false
    // o bot não está pensando, estão passa

    // de terceira(vez dele),
    // !estado = false e !estado.esperandoBot = false e estado.fase !== "jogando" false

    // então o return do if da linha # 206 não roda, p bot pensa, e atualiza o estado global

    // timer
    const timer = setTimeout(() => {
      // novo estado é
      setEstado((prev) => {
        if (!prev || !prev.esperandoBot || prev.fase !== "jogando") return prev;

        const verdadeirasRestantes = prev.balas
          .slice(prev.posAtual) // começa o array "balas" do indice "posAtual" a diante
          .filter(Boolean).length; // seleciona apenas os indices verdadeiros e conta no total

        // total menos o inicial = restante
        const restantes = prev.balas.length - prev.posAtual;

        // se restantes > 0, posibilidades desejadas / posibilidades totais = probabilidade, senão 0% pq não tem mais balas
        const probVerdadeira =
          restantes > 0 ? verdadeirasRestantes / restantes : 0;

        // se probalidade baixa, atirar em vc mesmo, senão no oponente
        const botAlvo = probVerdadeira < 0.4 ? "self" : "opponent";

        // depois = atirar no alvo
        const depois = atirar(
          prev,
          botAlvo,
          playTiro,
          playRecarga,
          playBalaFalsa,
        );

        // Se o bot ainda tiver a vez, mantém esperandoBot = true
        const botContinua = depois.fase === "jogando" && depois.vezDe === "bot";

        // retorna o estado global, e o esperando bot True caso verdadeiro
        return { ...depois, esperandoBot: botContinua };
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [estado, playTiro, playRecarga, playBalaFalsa]);

  useEffect(() => {
    if (
      estado &&
      estado.fase === "resultado" &&
      !estado.bot.alive &&
      !pontosEnviados
    ) {
      ganharPontos(urlAPI, showToast);
      setPontosEnviados(true);
    }
  }, [estado, pontosEnviados, urlAPI, showToast]);

  // ---- 1. TELA DE SETUP ----
  if (!estado) {
    // se não tiver estado, então estamos na tela de setup
    return (
      <div className={styles.pagePanel}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Singleplayer</h1>
            <p>Enfrente o bot em uma partida.</p>
          </div>
          <div className={styles.pageActions}>
            <button className={styles.secondaryButton} onClick={onConfig}>
              ⚙️ Config
            </button>
            <button className={styles.primaryButton} onClick={onBack}>
              ← Voltar
            </button>
          </div>
        </div>
        <div className={styles.gameArea}>
          <div className={styles.setupArea}>
            <p className={styles.setupTitle}>Escolha a dificuldade</p>
            <div className={styles.difficultyCards}>
              <button
                className={`${styles.diffCard} ${styles.diffFacil}`}
                onClick={() => iniciar("facil")}
              >
                <span className={styles.diffLabel}>🟢 Fácil</span>
                <span className={styles.diffDesc}>
                  1 bala real · até 3 câmaras
                </span>
              </button>{" "}
              <button
                className={`${styles.diffCard} ${styles.diffMedio}`}
                onClick={() => iniciar("medio")}
              >
                <span className={styles.diffLabel}>🟡 Médio</span>
                <span className={styles.diffDesc}>
                  2 balas reais · 5+ câmaras
                </span>
              </button>{" "}
              <button
                className={`${styles.diffCard} ${styles.diffDificil}`}
                onClick={() => iniciar("dificil")}
              >
                <span className={styles.diffLabel}>🔴 Difícil</span>
                <span className={styles.diffDesc}>
                  3 balas reais · 6+ câmaras
                </span>
              </button>{" "}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // temos um estado, então estamos na tela de jogo ou resultado.
  // iniciar(dificuldade) foi chamado, e o estado foi definido com estadoInicial(dificuldade).
  // essa foi a primeira parte do fluxograma.
  // iniciar define a quantidade de camaras e balas reais atraves do gerarBalas(dificuldade)
  // Exemplo do que foi retornado:
  // {
  //   fase: "jogando",
  //   dificuldade,
  //   rodada: 1,
  //   vezDe: "jogador",
  //   jogador: { vidas: 3, alive: true },
  //   bot: { vidas: 3, alive: true },
  //   balas,
  //   posAtual: 0,
  //   quantVerdadeiras,
  //   log: [
  //     `🔫 Rodada 1 iniciada — ${balas.length} câmaras, ${quantVerdadeiras} bala(s) real(is).`,
  //   ],
  //   esperandoBot: false,
  // };

  // isso foi armazenado no estado global do jogo, atraves da linha # 171

  // destruturação do estado para facilitar o acesso às variáveis.
  // para verificações

  // variaveis que são recriadas a cada rederização do componente, mas que são baseadas no estado global do jogo.
  // nem todas estão aqui, só as necessarias para a pre-redenrização do componente e verificações de fluxo de jogo.

  const {
    balas,
    posAtual,
    jogador,
    bot,
    vezDe,
    log,
    rodada,
    fase,
    esperandoBot,
  } = estado;

  const podeAgir = fase === "jogando" && vezDe === "jogador" && !esperandoBot; // se fase for "jogando" e for minha vez e o bot não estiver esperando, então posso agir
  // sempre True se for a primeira rodada

  const venceu = bot ? !bot.alive : false; // se bot existe e não estiver vivo, então eu venci

  const maxVidas = 3; // max vidas

  // ---- 2. TELA DE RESULTADO ----
  // ingressamos aqui quando a fase do jogo é "resultado", ou seja, quando alguém morreu.
  // não agora para nosso fluxo de leitura, pode clicar na seta para fechar (>)

  // alguem está sem vida? a tela jogo tira as vidas e controla a interface. se efetua um tiro, a função atirar faz a verificação de vidas, e em dado momento, retorna o estado global e a fase como resultado
  //linha # 154
  if (fase === "resultado") {
    return (
      <div className={styles.pagePanel}>
        <div className={styles.resultOverlay}>
          <div className={styles.resultCard}>
            <p
              className={`${styles.resultTitle} ${venceu ? styles.resultWin : styles.resultLose}`}
            >
              {venceu ? "🏆 Você Venceu!" : "💀 Você Perdeu!"}
            </p>
            <small>{venceu ? "+10 pts" : "+0 pts"}</small>
            <div className={styles.resultStats}>
              <div className={styles.resultStat}>
                <span>Sua vida</span>
                <strong>{jogador?.vidas}</strong>
              </div>
              <div className={styles.resultStat}>
                <span>Rodadas</span>
                <strong>{rodada}</strong>
              </div>
              <div className={styles.resultStat}>
                <span>Bot</span>
                <strong>{bot?.vidas}</strong>
              </div>
            </div>
            <div className={styles.resultButtons}>
              <button
                className={styles.primaryButton}
                onClick={() => {
                  setPontosEnviados(false);
                  setEstado(null);
                }}
              >
                Jogar de novo
              </button>
              <button className={styles.secondaryButton} onClick={onBack}>
                Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // continua nossa logica.
  // temos estado armazenado e não é a tela de resultado.
  // se temos estado de um jogo, então há um jogo em andamento, e estamos na tela de jogo.

  // ---- 3. TELA DE JOGO ----
  return (
    <div className={styles.pagePanel}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Singleplayer</h1>
          <p>
            Rodada {rodada} · {estado.dificuldade}
          </p>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.secondaryButton} onClick={onConfig}>
            ⚙️
          </button>
          <button className={styles.secondaryButton} onClick={onBack}>
            ✕ Sair
          </button>
        </div>
      </div>

      <div className={styles.gameArea}>
        <div className={styles.statusBar}>
          <div
            className={`${styles.statusCard} ${jogador?.vidas <= 1 ? styles.statusCardDanger : ""}`}
          >
            <span>Você</span>
            <strong>
              {"❤️".repeat(jogador?.vidas || 0)}
              {"🖤".repeat(Math.max(0, maxVidas - (jogador?.vidas || 0)))}
            </strong>
          </div>
          <div className={styles.statusCard}>
            <span>Câmara</span>
            <strong>
              {posAtual + 1}/{balas?.length}
            </strong>
          </div>
          <div
            className={`${styles.statusCard} ${bot?.vidas <= 1 ? styles.statusCardSuccess : ""}`}
          >
            <span>Bot</span>
            <strong>
              {"❤️".repeat(bot?.vidas || 0)}
              {"🖤".repeat(Math.max(0, maxVidas - (bot?.vidas || 0)))}
            </strong>
          </div>
        </div>

        <div className={styles.revolverSection}>
          <p className={styles.revolverTitle}>🔫 Revólver</p>
          <div className={styles.chambers}>
            {balas?.map((_, i) => {
              let cls = styles.chamber;
              if (i < posAtual) cls += " " + styles.chamberFired;
              else if (i === posAtual) cls += " " + styles.chamberCurrent;
              return <div key={i} className={cls} title={`Câmara ${i + 1}`} />;
            })}
          </div>
          <p className={styles.revolverInfo}>
            {estado.quantVerdadeiras} bala(s) real(is) em {balas?.length}{" "}
            câmara(s)
          </p>
        </div>

        <div className={styles.turnInfo}>
          <h2>{vezDe === "jogador" ? "🎯 Sua vez" : "🤖 Vez do Bot"}</h2>
          <p>
            {esperandoBot
              ? "O bot está pensando..."
              : vezDe === "jogador"
                ? "Escolha seu alvo"
                : ""}
          </p>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.actionSelf}`}
            onClick={() => agir("self")}
            disabled={!podeAgir}
          >
            <span className={styles.actionIcon}>🎰</span>
            <span>Atirar em mim</span>
            <span className={styles.actionLabel}>
              Agora bala real NÃO passa a vez
            </span>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionOpponent}`}
            onClick={() => agir("opponent")}
            disabled={!podeAgir}
          >
            <span className={styles.actionIcon}>💀</span>
            <span>Atirar no Bot</span>
            <span className={styles.actionLabel}>Sempre passa a vez</span>
          </button>
        </div>

        <div className={styles.log}>
          {[...log].reverse().map((entry, i) => {
            let cls = styles.logEntry;
            if (entry.includes("REAL")) cls += " " + styles.logEntryHit;
            else if (entry.includes("falsa")) cls += " " + styles.logEntryMiss;
            else if (entry.includes("🔁") || entry.includes("Rodada"))
              cls += " " + styles.logEntrySystem;
            return (
              <p key={i} className={cls}>
                {entry}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

SingleplayerGame.propTypes = {
  onBack: PropTypes.func.isRequired,
  onConfig: PropTypes.func.isRequired,
  urlAPI: PropTypes.string.isRequired,
};
