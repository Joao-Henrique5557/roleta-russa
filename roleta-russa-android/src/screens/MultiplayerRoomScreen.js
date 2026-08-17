import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import ScreenBackground from "../components/ScreenBackground";
import InputField from "../components/InputField";
import DifficultyCards from "../components/DifficultyCards";
import ItemInventory from "../components/ItemInventory";
import { PrimaryButton, SecondaryButton } from "../components/Buttons";
import { useToast } from "../context/ToastContext";
import { useGameSounds } from "../hooks/useGameSounds";
import { getSocket, desconectarSocket } from "../services/socket";
import { ganharPontos } from "../utils/pontos";
import { estadoInicial, atirar, usarItem, NOMES_MULTIPLAYER } from "../game/engine";
import { colors, radius, spacing } from "../constants/theme";

// Porta de roleta-russa-frontend/src/pages/game/MultiplayerRoom.jsx.
//
// MESMO modelo "host-autoritativo com servidor relay" do web (explicado
// em detalhe em roleta-russa-backend-node/src/socket/lobby.js): quem
// criou a sala (o host) roda o motor do jogo (src/game/engine.js) NO
// PRÓPRIO APARELHO e publica o estado resultante (`room:hostState`) pro
// servidor, que repassa pra sala inteira (`room:estadoJogo`). Quem não é
// host só manda a INTENÇÃO da jogada (`room:playerAction`) - o host
// aplica e publica o novo estado.
//
// `estado.jogador` = sempre o HOST; `estado.bot` = sempre o segundo
// jogador humano (nome interno reaproveitado do engine compartilhado com
// o Singleplayer - só a exibição troca para "Anfitrião"/"Visitante", via
// NOMES_MULTIPLAYER).
export default function MultiplayerRoomScreen({ navigation, route }) {
  const socket = getSocket();
  const { showToast } = useToast();

  const [sala, setSala] = useState(route.params.salaInicial);
  const [chat, setChat] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [estadoJogo, setEstadoJogo] = useState(route.params.salaInicial?.ultimoEstadoJogo || null);
  const [pontosEnviados, setPontosEnviados] = useState(false);
  const chatScrollRef = useRef(null);
  useGameSounds(estadoJogo?.log);

  const souHost = socket.id === sala?.hostSocketId;
  const souJogador = sala?.jogadores?.some((p) => p.socketId === socket.id);
  const meuLado = souHost ? "jogador" : "bot";
  const outroLado = souHost ? "bot" : "jogador";

  const copiarCodigoDaSala = useCallback(async () => {
    if (!sala?.id) return;
    await Clipboard.setStringAsync(sala.id);
    showToast("Código da sala copiado!", "success", 3000);
  }, [sala, showToast]);

  // ---- Listeners de socket ----
  useEffect(() => {
    function aoAtualizarSala(novaSala) {
      setSala(novaSala);
    }
    function aoReceberChat(msg) {
      setChat((atual) => [...atual, msg]);
    }
    function aoReceberEstado(novoEstado) {
      setEstadoJogo(novoEstado);
    }
    // Só o HOST realmente processa isso (o servidor já filtra, mas não
    // custa nada os outros ignorarem também).
    function aoReceberAcaoDoJogador({ acao, dados }) {
      setEstadoJogo((prev) => {
        if (!prev || prev.fase !== "jogando" || prev.vezDe !== "bot") return prev;
        let novo = prev;
        if (acao === "item") {
          const r = usarItem(prev, "bot", dados?.itemId);
          novo = r.sucesso ? { ...r.estado, log: [...r.estado.log, r.mensagem] } : prev;
        } else if (acao === "self" || acao === "opponent") {
          novo = atirar(prev, acao, NOMES_MULTIPLAYER);
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
    chatScrollRef.current?.scrollToEnd({ animated: true });
  }, [chat]);

  // Envia pontos quando EU venço (host ou não).
  useEffect(() => {
    if (!estadoJogo || estadoJogo.fase !== "resultado" || pontosEnviados) return;
    const meuEstado = estadoJogo[meuLado];
    const doOutro = estadoJogo[outroLado];
    if (meuEstado?.alive && !doOutro?.alive) {
      ganharPontos("player", showToast);
    }
    setPontosEnviados(true);
  }, [estadoJogo, pontosEnviados, meuLado, outroLado, showToast]);

  const enviarChat = useCallback(() => {
    const texto = mensagem.trim();
    if (!texto) return;
    socket.emit("room:chat", { texto });
    setMensagem("");
  }, [mensagem, socket]);

  const sair = useCallback(() => {
    socket.emit("room:sair");
    desconectarSocket();
    navigation.navigate("Home");
  }, [socket, navigation]);

  const iniciarPartida = useCallback(
    (dificuldade) => {
      const novo = estadoInicial(dificuldade);
      setEstadoJogo(novo);
      setPontosEnviados(false);
      socket.emit("room:hostState", { estado: novo });
    },
    [socket],
  );

  const agir = useCallback(
    (alvo) => {
      if (!estadoJogo || estadoJogo.fase !== "jogando" || estadoJogo.vezDe !== meuLado) return;
      if (souHost) {
        const novo = atirar(estadoJogo, alvo, NOMES_MULTIPLAYER);
        setEstadoJogo(novo);
        socket.emit("room:hostState", { estado: novo });
      } else {
        socket.emit("room:playerAction", { acao: alvo });
      }
    },
    [estadoJogo, meuLado, souHost, socket],
  );

  const usarItemHandler = useCallback(
    (itemId) => {
      if (!estadoJogo || estadoJogo.fase !== "jogando" || estadoJogo.vezDe !== meuLado) return;
      if (souHost) {
        const { estado: novo, sucesso, mensagem: msg } = usarItem(estadoJogo, "jogador", itemId);
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
    <ScreenBackground variant="image" scroll>
      <SafeAreaView style={styles.container}>
        <View style={styles.pageHeader}>
          <View style={styles.flexShrink}>
            <Text style={styles.h1}>{sala.nome}</Text>
            <Text style={styles.subTexto}>
              {sala.privada ? "🔒 Sala privada" : "🌐 Sala pública"} · {sala.jogadores?.length || 0}/2
              jogando · {sala.espectadores?.length || 0} assistindo
            </Text>
            <View style={styles.codigoSala}>
              <Text style={styles.codigoTexto}>
                Código da sala: <Text style={styles.codigoValor}>{sala.id}</Text>
              </Text>
              <SecondaryButton title="📋 Copiar" onPress={copiarCodigoDaSala} />
            </View>
          </View>
          <PrimaryButton title="✕ Sair da sala" onPress={sair} />
        </View>

        {!souJogador && (
          <Text style={styles.aviso}>👀 Você está assistindo esta partida como espectador.</Text>
        )}

        {/* ---- ÁREA DO JOGO ---- */}
        {!estadoJogo && (
          <View style={styles.setupArea}>
            {souHost ? (
              <>
                <Text style={styles.setupTitulo}>
                  Você é o anfitrião — escolha a dificuldade para começar
                </Text>
                <DifficultyCards onEscolher={iniciarPartida} />
              </>
            ) : (
              <Text style={styles.setupTitulo}>
                Aguardando o anfitrião escolher a dificuldade e iniciar a partida...
              </Text>
            )}
          </View>
        )}

        {estadoJogo && estadoJogo.fase === "jogando" && (
          <View style={styles.gameArea}>
            <View style={styles.statusBar}>
              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Anfitrião</Text>
                <Text style={styles.statusValor}>
                  {"❤️".repeat(estadoJogo.jogador.vidas)}
                  {"🖤".repeat(Math.max(0, 3 - estadoJogo.jogador.vidas))}
                </Text>
              </View>
              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Câmara</Text>
                <Text style={styles.statusValor}>
                  {estadoJogo.posAtual + 1}/{estadoJogo.balas.length}
                </Text>
              </View>
              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Visitante</Text>
                <Text style={styles.statusValor}>
                  {"❤️".repeat(estadoJogo.bot.vidas)}
                  {"🖤".repeat(Math.max(0, 3 - estadoJogo.bot.vidas))}
                </Text>
              </View>
            </View>

            <View style={styles.turnInfo}>
              <Text style={styles.turnTitulo}>
                {estadoJogo.vezDe === meuLado ? "🎯 Sua vez" : `⏳ Vez de ${nomeDoLado(estadoJogo.vezDe)}`}
              </Text>
            </View>

            {souJogador && (
              <>
                <ItemInventory
                  itens={meuEstadoJogo?.itens}
                  podeAgir={podeAgir}
                  onUsarItem={usarItemHandler}
                />
                {estadoJogo.balaRevelada !== null && (
                  <Text style={styles.lupaAviso}>
                    🔍 A bala na câmara atual é {estadoJogo.balaRevelada ? "REAL 🔴" : "FALSA ⚪"}.
                  </Text>
                )}
                <View style={styles.actions}>
                  <Pressable
                    style={[styles.actionBtn, styles.actionSelf, !podeAgir && styles.actionDisabled]}
                    disabled={!podeAgir}
                    onPress={() => agir("self")}
                  >
                    <Text style={styles.actionIcon}>🎰</Text>
                    <Text style={styles.actionTexto}>Atirar em mim</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.actionOpponent, !podeAgir && styles.actionDisabled]}
                    disabled={!podeAgir}
                    onPress={() => agir("opponent")}
                  >
                    <Text style={styles.actionIcon}>💀</Text>
                    <Text style={styles.actionTexto}>Atirar no oponente</Text>
                  </Pressable>
                </View>
              </>
            )}

            <View style={styles.log}>
              {[...estadoJogo.log]
                .reverse()
                .slice(0, 12)
                .map((entry, i) => (
                  <Text key={i} style={styles.logEntry}>
                    {entry}
                  </Text>
                ))}
            </View>
          </View>
        )}

        {estadoJogo && estadoJogo.fase === "resultado" && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitulo}>
              {estadoJogo[meuLado]?.alive ? "🏆 Você venceu!" : "💀 Você perdeu!"}
            </Text>
            {souHost && <PrimaryButton title="Jogar de novo" onPress={() => setEstadoJogo(null)} />}
          </View>
        )}

        {/* ---- PARTICIPANTES ---- */}
        <View style={styles.participantes}>
          <Text style={styles.sideTitulo}>Jogando</Text>
          {sala.jogadores?.map((p) => (
            <Text key={p.socketId} style={styles.participanteItem}>
              {p.nome} {p.socketId === sala.hostSocketId ? "👑" : ""}
            </Text>
          ))}
          <Text style={styles.sideTitulo}>Assistindo ({sala.espectadores?.length || 0})</Text>
          {sala.espectadores?.map((p) => (
            <Text key={p.socketId} style={styles.participanteItem}>
              {p.nome}
            </Text>
          ))}
        </View>

        {/* ---- CHAT ---- */}
        <View style={styles.chatBox}>
          <Text style={styles.sideTitulo}>Chat da sala</Text>
          <ScrollView ref={chatScrollRef} style={styles.chatMensagens}>
            {chat.map((msg, i) => (
              <Text key={i} style={styles.chatMsg}>
                <Text style={styles.chatAutor}>{msg.autor}: </Text>
                {msg.texto}
              </Text>
            ))}
          </ScrollView>
          <View style={styles.chatForm}>
            <InputField
              placeholder="Digite uma mensagem..."
              value={mensagem}
              onChangeText={setMensagem}
            />
            <PrimaryButton title="Enviar" onPress={enviarChat} disabled={!mensagem.trim()} />
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, gap: spacing.md },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  flexShrink: { flexShrink: 1, gap: 2 },
  h1: { color: colors.textWhite, fontSize: 22, fontWeight: "bold" },
  subTexto: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  codigoSala: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
    padding: spacing.xs,
    backgroundColor: "rgba(127,127,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.25)",
    borderRadius: radius.md,
    alignSelf: "flex-start",
  },
  codigoTexto: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  codigoValor: { color: colors.secondaryLight, fontFamily: "monospace", letterSpacing: 0.5 },
  aviso: {
    textAlign: "center",
    padding: spacing.sm,
    backgroundColor: "rgba(255,200,50,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,200,50,0.3)",
    borderRadius: radius.md,
    color: colors.textWhite,
  },

  setupArea: { alignItems: "center", gap: spacing.lg, paddingVertical: spacing.lg },
  setupTitulo: { color: colors.textWhite, fontSize: 16, fontWeight: "600", textAlign: "center" },

  gameArea: { gap: spacing.md },
  statusBar: { flexDirection: "row", gap: spacing.sm },
  statusCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.bgCardLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.15)",
    gap: 4,
  },
  statusLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, textTransform: "uppercase" },
  statusValor: { color: colors.secondaryLight, fontWeight: "bold", fontSize: 14 },

  turnInfo: {
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.bgCardLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.15)",
  },
  turnTitulo: { color: colors.textWhite, fontSize: 16, fontWeight: "600" },

  lupaAviso: { color: colors.secondaryLight, textAlign: "center", fontSize: 13, fontWeight: "600" },

  actions: { flexDirection: "row", gap: spacing.md },
  actionBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 80,
    justifyContent: "center",
  },
  actionSelf: { borderColor: "rgba(255,200,50,0.5)" },
  actionOpponent: { borderColor: "rgba(255,80,80,0.5)" },
  actionDisabled: { opacity: 0.35 },
  actionIcon: { fontSize: 24 },
  actionTexto: { color: colors.textWhite, fontWeight: "600", fontSize: 12, textAlign: "center" },

  log: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.15)",
    padding: spacing.sm,
    gap: 2,
  },
  logEntry: { color: "rgba(255,255,255,0.75)", fontSize: 12, paddingVertical: 3 },

  resultCard: {
    backgroundColor: "rgba(15,15,35,0.97)",
    borderWidth: 2,
    borderColor: "rgba(127,127,255,0.4)",
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.lg,
  },
  resultTitulo: { color: colors.textWhite, fontSize: 22, fontWeight: "bold" },

  participantes: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.2)",
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  sideTitulo: { color: colors.textWhite, fontSize: 15, fontWeight: "600", marginTop: spacing.sm },
  participanteItem: { color: "rgba(255,255,255,0.85)", fontSize: 13 },

  chatBox: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.2)",
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  chatMensagens: { maxHeight: 220 },
  chatMsg: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginBottom: 4 },
  chatAutor: { fontWeight: "700", color: colors.secondaryLight },
  chatForm: { gap: spacing.sm },
});
