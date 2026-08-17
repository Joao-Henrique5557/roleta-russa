import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

// Porta de components/BTNs/botaoMenu/BotaoMenu.jsx.
// Mesmo visual: borda 2px na cor secundária, fundo escuro translúcido,
// cantos bem arredondados (pill).
export default function BotaoMenu({ texto, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.botao, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.texto}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: "rgba(40, 40, 40, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    borderColor: colors.secondaryLight,
    backgroundColor: "rgba(127, 127, 255, 0.15)",
  },
  texto: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: "500",
  },
});
