// src/pages/game/MultiplayerRoom.jsx
//
// Tela de uma SALA de multiplayer já criada/entrada (chat + jogo + lista
// de participantes). A tela anterior (MultiplayerLobby.jsx) só lista/cria
// salas; esta aqui é onde a partida de verdade acontece.
//
// ------------------------------------------------------------------
// CONCEITO CENTRAL: "host-autoritativo com servidor relay"
// ------------------------------------------------------------------
// Explicado em detalhe em roleta-russa-backend-node/src/socket/lobby.js.
// Resumo: o jogador que criou a sala (o "host") roda, NO PRÓPRIO
// NAVEGADOR DELE, a mesma lógica de tambor/balas/itens usada no
// Singleplayer (veja SingleplayerGame.jsx e src/game/powerUps.js). Depois
// de cada jogada, o host manda o estado resultante pro servidor
// (`room:hostState`), que repassa pra todo mundo na sala (o outro
// jogador + espectadores) via `room:estadoJogo`.
//
// O outro jogador (quem não é host) NÃO calcula nada sozinho: quando é a
// vez dele, ele só manda a INTENÇÃO da jogada (`room:playerAction`, ex:
// "atirar no oponente") pro servidor, que repassa só pro host. O host
// aplica essa jogada na simulação dele e publica o novo estado, fechando
// o ciclo.
//
// Por isso, internamente, o estado do jogo usa sempre as MESMAS chaves
// do Singleplayer: `estado.jogador` (= sempre o HOST) e `estado.bot` (=
// sempre o segundo jogador humano, o "visitante"). É um reaproveitamento
// deliberado de src/game/powerUps.js, que já entende essas duas chaves -
// só traduzimos os nomes na hora de EXIBIR na tela (ver `nomeDoLado`).
// ------------------------------------------------------------------
import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "./game.module.css";
import multiplayerStyles from "./multiplayer.module.css";
import { useSoundEffect } from "../../hooks/useSoundEffect";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/apiError";
import { getSocket } from "../../services/socket";
import {
  ITENS,
  sortearItens,
  somarInventarios,
  usarItem as aplicarUsoDeItem,
  resolverPulosDeVez,
} from "../../game/powerUps";

// ---- Motor de jogo (host) ----
// Praticamente idêntico ao usado em SingleplayerGame.jsx - a diferença é
// que aqui NENHUM dos dois lados é controlado por IA, os dois são
// jogadores humanos reais (o "bot" aqui é só o apelido interno do
// segundo jogador, não uma IA).
function gerarBalas(dificuldade) {
  let quantBalas = Math.floor(Math.random() * 5) + 2;
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
  const balas = new Array(quantBalas).fill(false);
  let colocadas = 0;
  while (colocadas < quantVerdadeiras) {
    const pos = Math.floor(Math.random() * quantBalas);
    if (!balas[pos]) {
      balas[pos] = true;
      colocadas++;
    }
  }
  return { balas, quantVerdadeiras };
}

function ladoInicial() {
  return { vidas: 3, maxVidas: 3, alive: true, itens: sortearItens(1), serraAtiva: false, pulaProximaVez: false };
}

function estadoInicialMultiplayer(dificuldade) {
  const { balas, quantVerdadeiras } = gerarBalas(dificuldade);
  return {
    fase: "jogando",
    dificuldade,
    rodada: 1,
    vezDe: "jogador", // o host sempre começa
    jogador: ladoInicial(),
    bot: ladoInicial(),
    balas,
    posAtual: 0,
    quantVerdadeiras,
    balaRevelada: null,
    log: [`🔫 Partida iniciada — ${balas.length} câmaras, ${quantVerdadeiras} bala(s) real(is).`],
  };
}

function recarregarMultiplayer(estado) {
  const { balas, quantVerdadeiras } = gerarBalas(estado.dificuldade);
  const ganhosJogador = sortearItens(1 + Math.round(Math.random()));
  const ganhosBot = sortearItens(1 + Math.round(Math.random()));
  return {
    ...estado,
    balas,
    posAtual: 0,
    quantVerdadeiras,
    balaRevelada: null,
    rodada: estado.rodada + 1,
    jogador: { ...estado.jogador, itens: somarInventarios(estado.jogador.itens, ganhosJogador) },
    bot: { ...estado.bot, itens: somarInventarios(estado.bot.itens, ganhosBot) },
    log: [
      ...estado.log,
      `🔁 Revólver recarregado — Rodada ${estado.rodada + 1}.`,
      `🎁 Novos itens distribuídos.`,
    ],
  };
}

function atirarMultiplayer(estado, alvo) {
  const { balas, posAtual } = estado;
  const isVerdadeira = balas[posAtual];
  const novoPos = posAtual + 1;
  let novoJogador = { ...estado.jogador };
  let novoBot = { ...estado.bot };
  let logEntry;
  let mudaVez;
  const atirador = estado.vezDe === "jogador" ? novoJogador : novoBot;
  const nome = (lado) => (lado === "jogador" ? "Anfitrião" : "Visitante");

  if (alvo === "self") {
    if (isVerdadeira) {
      logEntry = `💥 ${nome(estado.vezDe)} atirou em si mesmo — bala REAL! -1 vida. Mantém a vez.`;
      if (estado.vezDe === "jogador") novoJogador.vidas -= 1;
      else novoBot.vidas -= 1;
    } else {
      logEntry = `💨 ${nome(estado.vezDe)} atirou em si mesmo — bala falsa. Mantém a vez.`;
    }
    mudaVez = false;
  } else {
    const alvoNome = estado.vezDe === "jogador" ? "no Visitante" : "no Anfitrião";
    if (isVerdadeira) {
      const dano = atirador.serraAtiva ? 2 : 1;
      logEntry = `💥 ${nome(estado.vezDe)} atirou ${alvoNome} — bala REAL! -${dano} vida.${atirador.serraAtiva ? " (🪚 dano dobrado!)" : ""}`;
      if (estado.vezDe === "jogador") {
        novoBot.vidas -= dano;
        novoJogador = { ...novoJogador, serraAtiva: false };
      } else {
        novoJogador.vidas -= dano;
        novoBot = { ...novoBot, serraAtiva: false };
      }
    } else {
      logEntry = `💨 ${nome(estado.vezDe)} atirou ${alvoNome} — bala falsa.`;
    }
    mudaVez = true;
  }

  if (novoJogador.vidas <= 0) novoJogador.alive = false;
  if (novoBot.vidas <= 0) novoBot.alive = false;

  const candidato = mudaVez ? (estado.vezDe === "jogador" ? "bot" : "jogador") : estado.vezDe;
  const { vezDe: vezDeFinal, jogador: j2, bot: b2, logExtra } = resolverPulosDeVez(
    { jogador: novoJogador, bot: novoBot },
    estado.vezDe,
    candidato,
  );
  if (j2) novoJogador = j2;
  if (b2) novoBot = b2;

  let novoEstado = {
    ...estado,
    jogador: novoJogador,
    bot: novoBot,
    posAtual: novoPos,
    balaRevelada: null,
    log: logExtra ? [...estado.log, logEntry, logExtra] : [...estado.log, logEntry],
    vezDe: vezDeFinal,
  };

  if (!novoJogador.alive || !novoBot.alive) return { ...novoEstado, fase: "resultado" };
  if (novoPos >= balas.length) novoEstado = recarregarMultiplayer(novoEstado);
  return novoEstado;
}

async function ganharPontosMultiplayer(urlAPI, showToast) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  if (!usuario) return;
  const dados = new URLSearchParams();
  dados.append("id", usuario.id);
  dados.append("forma", "player"); // vitória contra outro jogador vale mais pontos que contra o bot
  try {
    await axios.post(`${urlAPI}/GanharPontos`, dados, { timeout: 5000 });
  } catch (error) {
    showToast(getErrorMessage(error, "Não foi possível salvar seus pontos."), "error");
  }
}

export default function MultiplayerRoom({ onBack, onConfig, urlAPI, salaInicial }) {
  const socket = getSocket();
  const { showToast } = useToast();

  const [sala, setSala] = useState(salaInicial); // { id, nome, jogadores, espectadores, hostSocketId, ultimoEstadoJogo }
  const [chat, setChat] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [estadoJogo, setEstadoJogo] = useState(salaInicial?.ultimoEstadoJogo || null);
  const [pontosEnviados, setPontosEnviados] = useState(false);
  const chatFimRef = useRef(null);

  const playTiro = useSoundEffect("/audio/efeitos_sonoros/tiro.mp3");
  const playRecarga = useSoundEffect("/audio/efeitos_sonoros/arma_recarregando.mp3");
  const playBalaFalsa = useSoundEffect("/audio/efeitos_sonoros/tiro_falso.mp3");

  const souHost = socket.id === sala?.hostSocketId;
  const souJogador = sala?.jogadores?.some((p) => p.socketId === socket.id);
  const meuLado = souHost ? "jogador" : "bot"; // ver comentário no topo do arquivo
  const outroLado = souHost ? "bot" : "jogador";

  // ---- Listeners de socket - montados uma única vez ----
  useEffect(() => {
    function aoAtualizarSala(novaSala) {
      setSala(novaSala);
    }
    function aoReceberChat(msg) {
      setChat((atual) => [...atual, msg]);
    }
    function aoReceberEstado(novoEstado) {
      // Toca sons localmente quando o estado muda "de fora" (eu não sou o
      // host, então nunca chamo atirarMultiplayer() na minha própria
      // máquina - preciso reagir ao que chegou do servidor).
      setEstadoJogo((anterior) => {
        if (anterior && novoEstado && novoEstado.log?.length > anterior.log?.length) {
          const ultimaLinha = novoEstado.log[novoEstado.log.length - 1] || "";
          if (ultimaLinha.includes("🔁")) playRecarga();
          else if (ultimaLinha.includes("REAL")) playTiro();
          else if (ultimaLinha.includes("falsa")) playBalaFalsa();
        }
        return novoEstado;
      });
    }
    // Só o HOST escuta as ações do outro jogador (o servidor já filtra
    // isso, mas escutar dos dois lados não faria mal nenhum de qualquer forma).
    function aoReceberAcaoDoJogador({ acao, dados }) {
      setEstadoJogo((prev) => {
        if (!prev || prev.fase !== "jogando" || prev.vezDe !== "bot") return prev;
        let novo = prev;
        if (acao === "item") {
          const r = aplicarUsoDeItem(prev, "bot", dados?.itemId);
          novo = r.sucesso ? { ...r.estado, log: [...r.estado.log, r.mensagem] } : prev;
        } else if (acao === "self" || acao === "opponent") {
          novo = atirarMultiplayer(prev, acao === "self" ? "self" : "opponent");
        }
        socket.emit("room:hostState", { estado: novo });
        return novo;
      });
    }

    socket.on("room:atualizada", aoAtualizarSala);
    socket.on("room:chat", aoReceberChat);
    socket.on("room:estadoJogo", aoReceberEstado);
    socket.on("room:playerAction", aoReceberAcaoDoJogador);

    return () => {
      socket.off("room:atualizada", aoAtualizarSala);
      socket.off("room:chat", aoReceberChat);
      socket.off("room:estadoJogo", aoReceberEstado);
      socket.off("room:playerAction", aoReceberAcaoDoJogador);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    chatFimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Envia pontos quando EU (independente de ser host ou não) venço.
  useEffect(() => {
    if (!estadoJogo || estadoJogo.fase !== "resultado" || pontosEnviados) return;
    const meuEstado = estadoJogo[meuLado];
    const doOutro = estadoJogo[outroLado];
    if (meuEstado?.alive && !doOutro?.alive) {
      ganharPontosMultiplayer(urlAPI, showToast);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- flag de "já enviei os pontos desta partida", não sincroniza UI com sistema externo
    setPontosEnviados(true);
  }, [estadoJogo, pontosEnviados, meuLado, outroLado, urlAPI, showToast]);

  const enviarChat = useCallback(
    (e) => {
      e.preventDefault();
      const texto = mensagem.trim();
      if (!texto) return;
      socket.emit("room:chat", { texto });
      setMensagem("");
    },
    [mensagem, socket],
  );

  const sair = useCallback(() => {
    socket.emit("room:sair");
    onBack();
  }, [socket, onBack]);

  const iniciarPartida = useCallback(
    (dificuldade) => {
      const novo = estadoInicialMultiplayer(dificuldade);
      setEstadoJogo(novo);
      setPontosEnviados(false);
      socket.emit("room:hostState", { estado: novo });
    },
    [socket],
  );

  // Atirar: se eu sou host, calculo localmente; senão, só mando a intenção.
  const agir = useCallback(
    (alvo) => {
      if (!estadoJogo || estadoJogo.fase !== "jogando" || estadoJogo.vezDe !== meuLado) return;
      if (souHost) {
        const novo = atirarMultiplayer(estadoJogo, alvo);
        // O host toca o som direto (já sabe se a bala era real ou falsa
        // antes de disparar o evento); os demais participantes tocam o
        // som deles ao RECEBER o novo estado (ver aoReceberEstado acima).
        if (estadoJogo.balas[estadoJogo.posAtual]) playTiro();
        else playBalaFalsa();
        setEstadoJogo(novo);
        socket.emit("room:hostState", { estado: novo });
      } else {
        socket.emit("room:playerAction", { acao: alvo });
      }
    },
    [estadoJogo, meuLado, souHost, socket, playTiro, playBalaFalsa],
  );

  const usarItem = useCallback(
    (itemId) => {
      if (!estadoJogo || estadoJogo.fase !== "jogando" || estadoJogo.vezDe !== meuLado) return;
      if (souHost) {
        const { estado: novo, sucesso, mensagem: msg } = aplicarUsoDeItem(estadoJogo, "jogador", itemId);
        if (!sucesso) return showToast(msg, "info");
        const comLog = { ...novo, log: [...novo.log, msg] };
        setEstadoJogo(comLog);
        socket.emit("room:hostState", { estado: comLog });
      } else {
        socket.emit("room:playerAction", { acao: "item", dados: { itemId } });
      }
    },
    [estadoJogo, meuLado, souHost, socket, showToast],
  );

  if (!sala) return null;

  const nomeDoLado = (lado) => (lado === "jogador" ? "Anfitrião" : "Visitante");
  const podeAgir = estadoJogo?.fase === "jogando" && estadoJogo?.vezDe === meuLado;
  const meuEstadoJogo = estadoJogo?.[meuLado];

  return (
    <div className={styles.pagePanel}>
      <div className={styles.pageHeader}>
        <div>
          <h1>{sala.nome}</h1>
          <p>
            {sala.privada ? "🔒 Sala privada" : "🌐 Sala pública"} ·{" "}
            {sala.jogadores?.length || 0}/2 jogando · {sala.espectadores?.length || 0} assistindo
          </p>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.secondaryButton} onClick={onConfig}>⚙️</button>
          <button className={styles.primaryButton} onClick={sair}>✕ Sair da sala</button>
        </div>
      </div>

      <div className={multiplayerStyles.layout}>
        {/* ---- COLUNA DO JOGO ---- */}
        <div className={multiplayerStyles.gameColumn}>
          {!souJogador && (
            <p className={multiplayerStyles.aviso}>👀 Você está assistindo esta partida como espectador.</p>
          )}

          {!estadoJogo && (
            <div className={styles.setupArea}>
              {souHost ? (
                <>
                  <p className={styles.setupTitle}>Você é o anfitrião — escolha a dificuldade para começar</p>
                  <div className={styles.difficultyCards}>
                    <button className={`${styles.diffCard} ${styles.diffFacil}`} onClick={() => iniciarPartida("facil")}>
                      <span className={styles.diffLabel}>🟢 Fácil</span>
                    </button>
                    <button className={`${styles.diffCard} ${styles.diffMedio}`} onClick={() => iniciarPartida("medio")}>
                      <span className={styles.diffLabel}>🟡 Médio</span>
                    </button>
                    <button className={`${styles.diffCard} ${styles.diffDificil}`} onClick={() => iniciarPartida("dificil")}>
                      <span className={styles.diffLabel}>🔴 Difícil</span>
                    </button>
                  </div>
                </>
              ) : (
                <p className={styles.setupTitle}>Aguardando o anfitrião escolher a dificuldade e iniciar a partida...</p>
              )}
            </div>
          )}

          {estadoJogo && estadoJogo.fase === "jogando" && (
            <div className={styles.gameArea}>
              <div className={styles.statusBar}>
                <div className={styles.statusCard}>
                  <span>Anfitrião</span>
                  <strong>{"❤️".repeat(estadoJogo.jogador.vidas)}{"🖤".repeat(Math.max(0, 3 - estadoJogo.jogador.vidas))}</strong>
                </div>
                <div className={styles.statusCard}>
                  <span>Câmara</span>
                  <strong>{estadoJogo.posAtual + 1}/{estadoJogo.balas.length}</strong>
                </div>
                <div className={styles.statusCard}>
                  <span>Visitante</span>
                  <strong>{"❤️".repeat(estadoJogo.bot.vidas)}{"🖤".repeat(Math.max(0, 3 - estadoJogo.bot.vidas))}</strong>
                </div>
              </div>

              <div className={styles.turnInfo}>
                <h2>{estadoJogo.vezDe === meuLado ? "🎯 Sua vez" : `⏳ Vez de ${nomeDoLado(estadoJogo.vezDe)}`}</h2>
              </div>

              {souJogador && (
                <>
                  <div className={styles.inventory}>
                    {Object.values(ITENS).map((item) => {
                      const qtd = meuEstadoJogo?.itens?.[item.id] || 0;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={styles.itemBtn}
                          title={item.descricao}
                          disabled={!podeAgir || qtd <= 0}
                          onClick={() => usarItem(item.id)}
                        >
                          <span className={styles.itemIcone}>{item.icone}</span>
                          <span className={styles.itemNome}>{item.nome}</span>
                          <span className={styles.itemQtd}>x{qtd}</span>
                        </button>
                      );
                    })}
                  </div>
                  {estadoJogo.balaRevelada !== null && (
                    <p className={styles.lupaAviso}>
                      🔍 A bala na câmara atual é {estadoJogo.balaRevelada ? "REAL 🔴" : "FALSA ⚪"}.
                    </p>
                  )}
                  <div className={styles.actions}>
                    <button className={`${styles.actionBtn} ${styles.actionSelf}`} disabled={!podeAgir} onClick={() => agir("self")}>
                      <span className={styles.actionIcon}>🎰</span>
                      <span>Atirar em mim</span>
                    </button>
                    <button className={`${styles.actionBtn} ${styles.actionOpponent}`} disabled={!podeAgir} onClick={() => agir("opponent")}>
                      <span className={styles.actionIcon}>💀</span>
                      <span>Atirar no oponente</span>
                    </button>
                  </div>
                </>
              )}

              <div className={styles.log}>
                {[...estadoJogo.log].reverse().slice(0, 12).map((entry, i) => (
                  <p key={i} className={styles.logEntry}>{entry}</p>
                ))}
              </div>
            </div>
          )}

          {estadoJogo && estadoJogo.fase === "resultado" && (
            <div className={styles.resultCard}>
              <p className={styles.resultTitle}>
                {estadoJogo[meuLado]?.alive ? "🏆 Você venceu!" : "💀 Você perdeu!"}
              </p>
              {souHost && (
                <button className={styles.primaryButton} onClick={() => setEstadoJogo(null)}>
                  Jogar de novo
                </button>
              )}
            </div>
          )}
        </div>

        {/* ---- COLUNA LATERAL: PARTICIPANTES + CHAT ---- */}
        <div className={multiplayerStyles.sideColumn}>
          <div className={multiplayerStyles.participantes}>
            <h3>Jogando</h3>
            <ul>
              {sala.jogadores?.map((p) => (
                <li key={p.socketId}>
                  {p.nome} {p.socketId === sala.hostSocketId ? "👑" : ""}
                </li>
              ))}
            </ul>
            <h3>Assistindo ({sala.espectadores?.length || 0})</h3>
            <ul>
              {sala.espectadores?.map((p) => (
                <li key={p.socketId}>{p.nome}</li>
              ))}
            </ul>
          </div>

          <div className={multiplayerStyles.chat}>
            <h3>Chat da sala</h3>
            <div className={multiplayerStyles.chatMensagens}>
              {chat.map((msg, i) => (
                <p key={i} className={multiplayerStyles.chatMsg}>
                  <strong>{msg.autor}:</strong> {msg.texto}
                </p>
              ))}
              <div ref={chatFimRef} />
            </div>
            <form className={multiplayerStyles.chatForm} onSubmit={enviarChat}>
              <input
                type="text"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite uma mensagem..."
                maxLength={300}
              />
              <button type="submit">Enviar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

MultiplayerRoom.propTypes = {
  onBack: PropTypes.func.isRequired,
  onConfig: PropTypes.func.isRequired,
  urlAPI: PropTypes.string.isRequired,
  salaInicial: PropTypes.object.isRequired,
};
