import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

const CORES_POR_TIPO = {
  error: { start: "#c0392b", end: "#e74c3c" },
  success: { start: "#1e8449", end: colors.success },
  info: { start: colors.primaryDark, end: colors.primary },
};

export default function Toast({ tipo = "error", mensagem, onClose }) {
  const opacidade = useRef(new Animated.Value(0)).current;
  const cores = CORES_POR_TIPO[tipo] ?? CORES_POR_TIPO.error;

  useEffect(() => {
    Animated.timing(opacidade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [opacidade]);

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor: cores.end, opacity: opacidade }]}
    >
      <Text style={styles.texto}>{mensagem}</Text>
      <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Fechar aviso">
        <Text style={styles.fechar}>×</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    minWidth: 240,
    maxWidth: "92%",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  texto: {
    color: colors.textWhite,
    fontSize: 14,
    flex: 1,
  },
  fechar: {
    color: colors.textWhite,
    fontSize: 20,
    lineHeight: 20,
    opacity: 0.85,
    paddingHorizontal: spacing.xs,
  },
});
