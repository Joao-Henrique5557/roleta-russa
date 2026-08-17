import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenBackground from "../components/ScreenBackground";
import DifficultyCards from "../components/DifficultyCards";
import ItemInventory from "../components/ItemInventory";
import { PrimaryButton, SecondaryButton } from "../components/Buttons";
import { useToast } from "../context/ToastContext";
import { useGameSounds } from "../hooks/useGameSounds";
import { ganharPontos } from "../utils/pontos";
import { estadoInicial, atirar, usarItem, NOMES_SINGLEPLAYER } from "../game/engine";
import { colors, radius, spacing } from "../constants/theme";

// Porta de roleta-russa-frontend/src/pages/game/SingleplayerGame.jsx.
// A lógica do revólver/itens agora vive em src/game/engine.js e
// src/game/powerUps.js (compartilhada com o Multiplayer, igual ao web).

function Coracoes({ vidas, max = 3 }) {
  return (
    <Text style={styles.statusValor}>
      {"❤️".repeat(vidas || 0)}
      {"🖤".repeat(Math.max(0, max - (vidas || 0)))}
    </Text>
  );
}

export default function SingleplayerGameScreen({ navigation }) {
  const [estado, setEstado] = useState(null);
  const [pontosEnviados, setPontosEnviados] = useState(false);
  const { showToast } = useToast();
  const onBack = () => navigation.goBack();
  useGameSounds(estado?.log);

  const iniciar = useCallback((dificuldade) => {
    setEstado(estadoInicial(dificuldade));
  }, []);

  const agir = useCallback((alvo) => {
    setEstado((prev) => {
      if (!prev || prev.fase !== "jogando" || prev.vezDe !== "jogador") return prev;
      let novo = atirar(prev, alvo, NOMES_SINGLEPLAYER);
      if (novo.fase === "jogando" && novo.vezDe === "bot") {
        novo = { ...novo, esperandoBot: true };
      }
      return novo;
    });
  }, []);

  // Usar um item (cigarro/algemas/lupa/cerveja/serra) não passa a vez -
  // por isso não mexe em esperandoBot, diferente de agir().
  const usarItemHandler = useCallback(
    (itemId) => {
      setEstado((prev) => {
        if (!prev || prev.fase !== "jogando" || prev.vezDe !== "jogador") return prev;
        const { estado: novoEstado, sucesso, mensagem } = usarItem(prev, "jogador", itemId);
        if (!sucesso) {
          showToast(mensagem, "info");
          return prev;
        }
        return { ...novoEstado, log: [...novoEstado.log, mensagem] };
      });
    },
    [showToast],
  );

  useEffect(() => {
    if (!estado || !estado.esperandoBot || estado.fase !== "jogando") return;

    const timer = setTimeout(() => {
      setEstado((prev) => {
        if (!prev || !prev.esperandoBot || prev.fase !== "jogando") return prev;

        const verdadeirasRestantes = prev.balas.slice(prev.posAtual).filter(Boolean).length;
        const restantes = prev.balas.length - prev.posAtual;
        const probVerdadeira = restantes > 0 ? verdadeirasRestantes / restantes : 0;
        const botAlvo = probVerdadeira < 0.4 ? "self" : "opponent";

        // IA simples de uso de itens (mesmas regras do web): cura com
        // cigarro se estiver com 1 vida, e 50% de chance de usar o
        // serrote antes de atirar no oponente.
        let estadoComItens = prev;
        if (prev.bot.vidas <= 1 && (prev.bot.itens?.cigarro || 0) > 0) {
          estadoComItens = usarItem(estadoComItens, "bot", "cigarro").estado;
        }
        if (botAlvo === "opponent" && (estadoComItens.bot.itens?.serra || 0) > 0 && Math.random() < 0.5) {
          estadoComItens = usarItem(estadoComItens, "bot", "serra").estado;
        }

        const depois = atirar(estadoComItens, botAlvo, NOMES_SINGLEPLAYER);
        const botContinua = depois.fase === "jogando" && depois.vezDe === "bot";
        return { ...depois, esperandoBot: botContinua };
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [estado]);

  useEffect(() => {
    if (estado && estado.fase === "resultado" && !estado.bot.alive && !pontosEnviados) {
      ganharPontos("bot", showToast);
      setPontosEnviados(true);
    }
  }, [estado, pontosEnviados, showToast]);

  // ---- 1. TELA DE SETUP ----
  if (!estado) {
    return (
      <ScreenBackground variant="image">
        <SafeAreaView style={styles.pagePanel}>
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.h1}>Singleplayer</Text>
              <Text style={styles.subTexto}>Enfrente o bot em uma partida.</Text>
            </View>
            <View style={styles.pageActions}>
              <PrimaryButton title="← Voltar" onPress={onBack} />
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.setupArea}>
            <Text style={styles.setupTitulo}>Escolha a dificuldade</Text>
            <DifficultyCards onEscolher={iniciar} />
          </ScrollView>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const { balas, posAtual, jogador, bot, vezDe, log, rodada, fase, esperandoBot } = estado;
  const podeAgir = fase === "jogando" && vezDe === "jogador" && !esperandoBot;
  const venceu = bot ? !bot.alive : false;

  // ---- 2. TELA DE RESULTADO ----
  if (fase === "resultado") {
    return (
      <ScreenBackground variant="image">
        <SafeAreaView style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <Text style={[styles.resultTitulo, { color: venceu ? "#51cf66" : "#ff6b6b" }]}>
              {venceu ? "🏆 Você Venceu!" : "💀 Você Perdeu!"}
            </Text>
            <Text style={styles.resultPontos}>{venceu ? "+10 pts" : "+0 pts"}</Text>
            <View style={styles.resultStats}>
              <View style={styles.resultStat}>
                <Text style={styles.resultLabel}>Sua vida</Text>
                <Text style={styles.resultValor}>{jogador?.vidas}</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.resultLabel}>Rodadas</Text>
                <Text style={styles.resultValor}>{rodada}</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.resultLabel}>Bot</Text>
                <Text style={styles.resultValor}>{bot?.vidas}</Text>
              </View>
            </View>
            <PrimaryButton
              title="Jogar de novo"
              onPress={() => {
                setPontosEnviados(false);
                setEstado(null);
              }}
            />
            <SecondaryButton title="Menu" onPress={onBack} />
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  // ---- 3. TELA DE JOGO ----
  return (
    <ScreenBackground variant="image">
      <SafeAreaView style={styles.pagePanel}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.h1}>Singleplayer</Text>
            <Text style={styles.subTexto}>
              Rodada {rodada} · {estado.dificuldade}
            </Text>
          </View>
          <View style={styles.pageActions}>
            <SecondaryButton title="✕ Sair" onPress={onBack} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.gameArea}>
          <View style={styles.statusBar}>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Você</Text>
              <Coracoes vidas={jogador?.vidas} />
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Câmara</Text>
              <Text style={styles.statusValor}>
                {posAtual + 1}/{balas?.length}
              </Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Bot</Text>
              <Coracoes vidas={bot?.vidas} />
            </View>
          </View>

          <View style={styles.revolverSection}>
            <Text style={styles.revolverTitulo}>🔫 Revólver</Text>
            <View style={styles.chambers}>
              {balas?.map((_, i) => {
                let cor = "rgba(255,255,255,0.3)";
                if (i < posAtual) cor = "rgba(255,255,255,0.08)";
                else if (i === posAtual) cor = colors.secondaryLight;
                return (
                  <View
                    key={i}
                    style={[styles.chamber, { borderColor: cor }, i === posAtual && styles.chamberAtual]}
                  />
                );
              })}
            </View>
            <Text style={styles.revolverInfo}>
              {estado.quantVerdadeiras} bala(s) real(is) em {balas?.length} câmara(s)
            </Text>
          </View>

          <View style={styles.turnInfo}>
            <Text style={styles.turnTitulo}>{vezDe === "jogador" ? "🎯 Sua vez" : "🤖 Vez do Bot"}</Text>
            <Text style={styles.turnTexto}>
              {esperandoBot ? "O bot está pensando..." : vezDe === "jogador" ? "Escolha seu alvo" : ""}
            </Text>
          </View>

          <ItemInventory itens={jogador?.itens} podeAgir={podeAgir} onUsarItem={usarItemHandler} />
          {estado.balaRevelada !== null && (
            <Text style={styles.lupaAviso}>
              🔍 A bala na câmara atual é {estado.balaRevelada ? "REAL 🔴" : "FALSA ⚪"}.
            </Text>
          )}

          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, styles.actionSelf, !podeAgir && styles.actionDisabled]}
              onPress={() => agir("self")}
              disabled={!podeAgir}
            >
              <Text style={styles.actionIcon}>🎰</Text>
              <Text style={styles.actionTexto}>Atirar em mim</Text>
              <Text style={styles.actionLabel}>Bala real NÃO passa a vez</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.actionOpponent, !podeAgir && styles.actionDisabled]}
              onPress={() => agir("opponent")}
              disabled={!podeAgir}
            >
              <Text style={styles.actionIcon}>💀</Text>
              <Text style={styles.actionTexto}>Atirar no Bot</Text>
              <Text style={styles.actionLabel}>Sempre passa a vez</Text>
            </Pressable>
          </View>

          <View style={styles.log}>
            {[...log].reverse().map((entry, i) => {
              let cor = "rgba(255,255,255,0.75)";
              if (entry.includes("REAL")) cor = "#ff8080";
              else if (entry.includes("falsa")) cor = "#69db7c";
              else if (entry.includes("🔁") || entry.includes("Rodada")) cor = "rgba(160,150,255,0.9)";
              return (
                <Text key={i} style={[styles.logEntry, { color: cor }]}>
                  {entry}
                </Text>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  pagePanel: { flex: 1 },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: spacing.lg,
    gap: spacing.md,
    flexWrap: "wrap",
  },
  h1: { color: colors.textWhite, fontSize: 24, fontWeight: "bold" },
  subTexto: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 },
  pageActions: { flexDirection: "row", gap: spacing.sm },

  setupArea: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  setupTitulo: { color: colors.textWhite, fontSize: 20, fontWeight: "600", marginBottom: spacing.sm },

  gameArea: { padding: spacing.lg, gap: spacing.md },
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
  statusValor: { color: colors.secondaryLight, fontWeight: "bold", fontSize: 15 },

  revolverSection: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.2)",
  },
  revolverTitulo: { color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: "600" },
  chambers: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap", justifyContent: "center" },
  chamber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  chamberAtual: { transform: [{ scale: 1.15 }] },
  revolverInfo: { color: "rgba(255,255,255,0.6)", fontSize: 12 },

  turnInfo: {
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.bgCardLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.15)",
  },
  turnTitulo: { color: colors.textWhite, fontSize: 16, fontWeight: "600" },
  turnTexto: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },

  lupaAviso: {
    color: colors.secondaryLight,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },

  actions: { flexDirection: "row", gap: spacing.md },
  actionBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 90,
    justifyContent: "center",
  },
  actionSelf: { borderColor: "rgba(255,200,50,0.5)" },
  actionOpponent: { borderColor: "rgba(255,80,80,0.5)" },
  actionDisabled: { opacity: 0.35 },
  actionIcon: { fontSize: 26 },
  actionTexto: { color: colors.textWhite, fontWeight: "600", fontSize: 13 },
  actionLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, textAlign: "center" },

  log: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.15)",
    padding: spacing.sm,
    gap: 2,
  },
  logEntry: { fontSize: 12, paddingVertical: 3 },

  resultOverlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  resultCard: {
    backgroundColor: "rgba(15,15,35,0.97)",
    borderWidth: 2,
    borderColor: "rgba(127,127,255,0.4)",
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    gap: spacing.lg,
  },
  resultTitulo: { fontSize: 26, fontWeight: "bold" },
  resultPontos: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: -spacing.md },
  resultStats: { flexDirection: "row", gap: spacing.lg, justifyContent: "center" },
  resultStat: { alignItems: "center", gap: 4 },
  resultLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  resultValor: { color: colors.secondaryLight, fontSize: 22, fontWeight: "bold" },
});
