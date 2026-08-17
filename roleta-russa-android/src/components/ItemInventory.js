import { Pressable, StyleSheet, Text, View } from "react-native";
import { ITENS } from "../game/engine";
import { colors, radius, spacing } from "../constants/theme";

/**
 * Porta do bloco `.inventory` de SingleplayerGame.jsx / MultiplayerRoom.jsx.
 * Cada botão mostra o ícone, nome e quantidade do item; fica desabilitado
 * se a quantidade for 0 ou não for a vez de quem está jogando. Usar um
 * item não passa a vez (mesma regra do web).
 */
export default function ItemInventory({ itens, podeAgir, onUsarItem }) {
  return (
    <View style={styles.inventory}>
      {Object.values(ITENS).map((item) => {
        const quantidade = itens?.[item.id] || 0;
        const desabilitado = !podeAgir || quantidade <= 0;
        return (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.itemBtn,
              desabilitado && styles.itemBtnDisabled,
              pressed && !desabilitado && styles.itemBtnPressed,
            ]}
            disabled={desabilitado}
            onPress={() => onUsarItem(item.id)}
          >
            <Text style={styles.itemIcone}>{item.icone}</Text>
            <Text style={styles.itemNome}>{item.nome}</Text>
            <Text style={styles.itemQtd}>x{quantidade}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  inventory: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  itemBtn: {
    alignItems: "center",
    gap: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    minWidth: 68,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.3)",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  itemBtnPressed: {
    backgroundColor: "rgba(127,127,255,0.15)",
    borderColor: colors.secondaryLight,
  },
  itemBtnDisabled: {
    opacity: 0.35,
  },
  itemIcone: { fontSize: 20 },
  itemNome: { color: colors.textWhite, fontSize: 10, textAlign: "center" },
  itemQtd: { color: colors.secondaryLight, fontSize: 11, fontWeight: "700" },
});
