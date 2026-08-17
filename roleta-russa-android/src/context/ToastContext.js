import { createContext, useCallback, useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "../components/Toast";
import { spacing } from "../constants/theme";

const ToastContext = createContext(null);

let proximoId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removerToast = useCallback((id) => {
    setToasts((atual) => atual.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Mostra uma notificação não-bloqueante no topo da tela.
   * @param {string} mensagem
   * @param {"error"|"success"|"info"} tipo
   * @param {number} duracaoMs tempo até sumir sozinha (0 = não some sozinha)
   */
  const showToast = useCallback(
    (mensagem, tipo = "error", duracaoMs = 4000) => {
      const id = proximoId++;
      setToasts((atual) => [...atual, { id, mensagem, tipo }]);

      if (duracaoMs > 0) {
        setTimeout(() => removerToast(id), duracaoMs);
      }
    },
    [removerToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.container} pointerEvents="box-none">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              tipo={toast.tipo}
              mensagem={toast.mensagem}
              onClose={() => removerToast(toast.id)}
            />
          ))}
        </View>
      </SafeAreaView>
    </ToastContext.Provider>
  );
}

/**
 * Hook pra disparar toasts de qualquer componente dentro do <ToastProvider>.
 * Uso: const { showToast } = useToast(); showToast("Deu ruim", "error");
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast precisa ser usado dentro de um <ToastProvider>.");
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  container: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
