import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/apiError";
import { colors, radius, spacing } from "../constants/theme";

// Porta de show-to-public/Ranking/Ranking.jsx
export default function Ranking({ urlAPI }) {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    let ativo = true;

    async function listarUsuarios() {
      try {
        setLoading(true);
        setErro(null);
        const response = await axios.get(`${urlAPI}/ListarUsuarios`, { timeout: 5000 });
        if (ativo) setJogadores(response.data);
      } catch (error) {
        if (!ativo) return;
        const mensagem = getErrorMessage(error, "Erro ao buscar dados do ranking.");
        setErro(mensagem);
        showToast(mensagem, "error");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    if (urlAPI) listarUsuarios();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlAPI]);

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Ranking Global</Text>
      {loading && <ActivityIndicator color={colors.secondaryLight} />}
      {!loading && erro && <Text style={styles.erro}>{erro}</Text>}
      {!loading && !erro && jogadores.length === 0 && (
        <Text style={styles.vazio}>Nenhum jogador encontrado.</Text>
      )}
      {!loading &&
        !erro &&
        jogadores.map((jogador, index) => (
          <View key={jogador.id ?? index} style={styles.item}>
            <View style={styles.posicaoCirculo}>
              <Text style={styles.posicaoTexto}>{index + 1}</Text>
            </View>
            <Text style={styles.nome} numberOfLines={1}>
              {jogador.nome}
            </Text>
            <Text style={styles.pontos}>{jogador.pontos} pt</Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCardLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  titulo: {
    color: colors.textWhite,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  erro: { color: "#ff8080", textAlign: "center" },
  vazio: { color: "rgba(255,255,255,0.7)", textAlign: "center" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(127, 127, 255, 0.2)",
  },
  posicaoCirculo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  posicaoTexto: {
    color: colors.textWhite,
    fontWeight: "bold",
    fontSize: 13,
  },
  nome: {
    flex: 1,
    color: colors.textWhite,
  },
  pontos: {
    color: colors.secondaryLight,
    fontWeight: "600",
  },
});
