import PropTypes from "prop-types";
import styles from "./Toast.module.css";

function Toast({ tipo = "error", children, onClose }) {
  const classeTipo =
    tipo === "success" ? styles.success : tipo === "info" ? styles.info : styles.error;

  return (
    <div className={`${styles.toast} ${classeTipo}`} role="alert">
      <span>{children}</span>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar aviso">
        ×
      </button>
    </div>
  );
}

Toast.propTypes = {
  tipo: PropTypes.oneOf(["error", "success", "info"]),
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Toast;
