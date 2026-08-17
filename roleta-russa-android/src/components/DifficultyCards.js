import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing } from "../constants/theme";

const OPCOES = [
  { id: "facil", cor: "#50c878", label: "🟢 Fácil", desc: "1 bala real · até 3 câmaras" },
  { id: "medio", cor: "#ffc832", label: "🟡 Médio", desc: "2 balas reais · 5+ câmaras" },
  { id: "dificil", cor: "#ff5050", label: "🔴 Difícil", desc: "3 balas reais · 6+ câmaras" },
];

export default function DifficultyCards({ onEscolher }) {
  return (
    <View style={styles.container}>
      {OPCOES.map((opcao) => (
        <Pressable key={opcao.id} style={styles.card} onPress={() => onEscolher(opcao.id)}>
          <Text style={[styles.label, { color: opcao.cor }]}>{opcao.label}</Text>
          <Text style={styles.desc}>{opcao.desc}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", gap: spacing.md },
  card: {
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(0,0,0,0.3)",
    gap: spacing.xs,
  },
  label: { fontSize: 16, fontWeight: "bold" },
  desc: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
});
