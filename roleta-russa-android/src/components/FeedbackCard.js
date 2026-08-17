import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

const TIPO_INFO = {
  COMENTARIO: { label: "Comentário", icon: "💬", cor: colors.secondary },
  SUGESTAO: { label: "Sugestão", icon: "💡", cor: "#ffc832" },
  DENUNCIA: { label: "Denúncia", icon: "🚩", cor: "#ff5050" },
};

const STATUS_LABEL = {
  ABERTO: "Aberto",
  EM_ANALISE: "Em análise",
  RESOLVIDO: "Resolvido",
  ARQUIVADO: "Arquivado",
};

function formatarData(dataString) {
  if (!dataString) return "Data não informada";
  try {
    const data = new Date(dataString);
    if (Number.isNaN(data.getTime())) return dataString;
    return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return dataString;
  }
}

// Porta de show-to-public/FeedbackCard/FeedbackCard.jsx.
export default function FeedbackCard({ tipo, mensagem, autor, status, dataCriacao }) {
  const info = TIPO_INFO[tipo] ?? { label: tipo, icon: "📝", cor: colors.secondary };

  return (
    <View style={[styles.card, { borderColor: info.cor }]}>
      <View style={styles.header}>
        <Text style={[styles.badge, { color: info.cor }]}>
          {info.icon} {info.label}
        </Text>
        {/* Status só é relevante mostrar publicamente pra denúncias -
            comentários/sugestões não têm um fluxo de "resolução". */}
        {tipo === "DENUNCIA" && status && (
          <Text style={styles.status}>{STATUS_LABEL[status] ?? status}</Text>
        )}
      </View>
      <Text style={styles.mensagem}>{mensagem}</Text>
      <View style={styles.footer}>
        <Text style={styles.autor}>{autor || "Anônimo"}</Text>
        <Text style={styles.data}>{formatarData(dataCriacao)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    gap: spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: { fontSize: 12, fontWeight: "700" },
  status: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  mensagem: { color: colors.textWhite, fontSize: 13, lineHeight: 18 },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  autor: { color: colors.secondaryLight, fontSize: 11, fontWeight: "600" },
  data: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
});
