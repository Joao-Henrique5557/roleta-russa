import { forwardRef } from "react";
import { StyleSheet, TextInput } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

// Espelha src/components/data/Imput/Input.jsx do frontend web.
const InputField = forwardRef(function InputField(
  { placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize = "none" },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
  );
});

export default InputField;

const styles = StyleSheet.create({
  input: {
    width: "100%",
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    fontSize: 15,
    backgroundColor: "#ffffff",
    color: colors.textPrimary,
  },
});
