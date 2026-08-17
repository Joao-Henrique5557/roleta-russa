import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FeedbackCard from "./FeedbackCard";
import { PrimaryButton } from "./Buttons";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/apiError";
import { colors, radius, spacing } from "../constants/theme";

// Porta de show-to-public/Feedbacks/Feedbacks.jsx. Substitui o antigo
// mural de "Novidades" (só o dono do projeto postava) - agora é
// alimentado pelos próprios jogadores: comentários, sugestões e
// denúncias. Mesmos endpoints: GET/POST /ListarFeedbacks e /CriarFeedback.
const TIPOS = [
  { valor: "COMENTARIO", label: "💬 Comentário" },
  { valor: "SUGESTAO", label: "💡 Sugestão" },
  { valor: "DENUNCIA", label: "🚩 Denúncia" },
];

const TAMANHO_MAXIMO_MENSAGEM = 2000;

export default function Feedbacks({ urlAPI }) {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filtro, setFiltro] = useState(""); // "" = todos
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const { showToast } = useToast();

  const [tipoNovo, setTipoNovo] = useState("COMENTARIO");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("usuario").then((valor) => {
      if (!valor) return;
      try {
        setUsuarioLogado(JSON.parse(valor));
      } catch {
        // segue sem usuário logado - o feedback vai como "Anônimo"
      }
    });
  }, []);

  const listarFeedbacks = useCallback(
    async (tipoFiltro) => {
      try {
        setLoading(true);
        setErro(null);
        const response = await axios.get(`${urlAPI}/ListarFeedbacks`, {
          params: tipoFiltro ? { tipo: tipoFiltro } : undefined,
          timeout: 5000,
        });
        setFeedbacks(response.data);
      } catch (error) {
        const mensagemErro = getErrorMessage(error, "Erro ao buscar comentários.");
        setErro(mensagemErro);
        showToast(mensagemErro, "error");
      } finally {
        setLoading(false);
      }
    },
    [urlAPI, showToast],
  );

  useEffect(() => {
    if (urlAPI) listarFeedbacks(filtro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlAPI, filtro]);

  async function handleEnviar() {
    const texto = mensagem.trim();
    if (!texto) {
      showToast("Escreva algo antes de enviar.", "error");
      return;
    }
    if (texto.length > TAMANHO_MAXIMO_MENSAGEM) {
      showToast(`Mensagem muito longa (máximo ${TAMANHO_MAXIMO_MENSAGEM} caracteres).`, "error");
      return;
    }

    setEnviando(true);
    try {
      const params = new URLSearchParams();
      params.append("tipo", tipoNovo);
      params.append("mensagem", texto);
      params.append("autor", usuarioLogado?.nome || "Anônimo");
      if (usuarioLogado?.id) params.append("usuarioId", usuarioLogado.id);

      const { data } = await axios.post(`${urlAPI}/CriarFeedback`, params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 5000,
      });

      showToast(data?.message || "Enviado com sucesso!", "success");
      setMensagem("");
      // Só recarrega a lista se o feedback novo entrar no filtro atual.
      if (!filtro || filtro === tipoNovo) listarFeedbacks(filtro);
    } catch (error) {
      showToast(getErrorMessage(error, "Erro ao enviar. Tente novamente."), "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Comentários &amp; Sugestões</Text>

      <View style={styles.form}>
        <View style={styles.tipoSelector}>
          {TIPOS.map((t) => (
            <Pressable
              key={t.valor}
              style={[styles.tipoBtn, tipoNovo === t.valor && styles.tipoBtnAtivo]}
              onPress={() => setTipoNovo(t.valor)}
            >
              <Text style={styles.tipoBtnTexto}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.textarea}
          placeholder={
            tipoNovo === "DENUNCIA"
              ? "Descreva o que aconteceu (comportamento, bug, etc.)..."
              : "Escreva aqui..."
          }
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={mensagem}
          maxLength={TAMANHO_MAXIMO_MENSAGEM}
          onChangeText={setMensagem}
          multiline
          numberOfLines={3}
        />
        <View style={styles.formFooter}>
          <Text style={styles.contador}>
            {mensagem.length}/{TAMANHO_MAXIMO_MENSAGEM}
          </Text>
          <PrimaryButton
            title={enviando ? "Enviando..." : "Enviar"}
            onPress={handleEnviar}
            disabled={enviando}
          />
        </View>
      </View>

      <View style={styles.filtros}>
        <Pressable style={[styles.filtroBtn, !filtro && styles.filtroBtnAtivo]} onPress={() => setFiltro("")}>
          <Text style={styles.filtroTexto}>Todos</Text>
        </Pressable>
        {TIPOS.map((t) => (
          <Pressable
            key={t.valor}
            style={[styles.filtroBtn, filtro === t.valor && styles.filtroBtnAtivo]}
            onPress={() => setFiltro(t.valor)}
          >
            <Text style={styles.filtroTexto}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.lista}>
        {loading && <ActivityIndicator color={colors.secondaryLight} />}
        {!loading && erro && <Text style={styles.erro}>{erro}</Text>}
        {!loading && !erro && feedbacks.length === 0 && (
          <Text style={styles.vazio}>Nenhum registro encontrado ainda.</Text>
        )}
        {!loading &&
          !erro &&
          feedbacks.map((feedback) => <FeedbackCard key={feedback.id} {...feedback} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  titulo: { color: colors.textWhite, fontSize: 20, fontWeight: "bold", textAlign: "center" },
  form: {
    backgroundColor: colors.bgCardLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.15)",
    padding: spacing.md,
    gap: spacing.sm,
  },
  tipoSelector: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  tipoBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  tipoBtnAtivo: { backgroundColor: colors.secondary, borderColor: colors.secondaryLight },
  tipoBtnTexto: { color: colors.textWhite, fontSize: 12 },
  textarea: {
    minHeight: 70,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(0,0,0,0.3)",
    color: colors.textWhite,
    padding: spacing.sm,
    textAlignVertical: "top",
    fontSize: 13,
  },
  formFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  contador: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  filtros: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  filtroBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  filtroBtnAtivo: { backgroundColor: "rgba(127,127,255,0.25)", borderColor: colors.secondaryLight },
  filtroTexto: { color: colors.textWhite, fontSize: 12 },
  lista: { gap: spacing.sm },
  erro: { color: "#ff8080", textAlign: "center" },
  vazio: { color: "rgba(255,255,255,0.7)", textAlign: "center" },
});
