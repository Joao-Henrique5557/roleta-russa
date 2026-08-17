import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

export function PrimaryButton({ title, onPress, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressedSecondary,
        style,
      ]}
    >
      <Text style={styles.secondaryText}>{title}</Text>
    </Pressable>
  );
}

export function LinkButton({ title, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={style}>
      <Text style={styles.link}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: "500",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: "500",
  },
  pressed: {
    backgroundColor: colors.primaryDark,
  },
  pressedSecondary: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  disabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  link: {
    color: colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
