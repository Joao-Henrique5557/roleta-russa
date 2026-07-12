import { createContext, useCallback, useContext, useState } from "react";
import PropTypes from "prop-types";
import Toast from "../components/Feedback/Toast/Toast";
import styles from "./ToastContext.module.css";

const ToastContext = createContext(null);

let proximoId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removerToast = useCallback((id) => {
    setToasts((atual) => atual.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Mostra uma notificação não-bloqueante no canto da tela.
   * @param {string} mensagem
   * @param {"error"|"success"|"info"} tipo
   * @param {number} duracaoMs tempo até sumir sozinho (0 = não some sozinho)
   */
  const showToast = useCallback(
    (mensagem, tipo = "error", duracaoMs = 5000) => {
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
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            tipo={toast.tipo}
            onClose={() => removerToast(toast.id)}
          >
            {toast.mensagem}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

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
