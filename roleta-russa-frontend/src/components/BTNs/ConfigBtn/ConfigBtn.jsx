import styles from "./ConfigBtn.module.css";
import PropTypes from "prop-types";

function ConfigBtn({ onConfig }) {
  return (
    <div className={styles.configBtn} onClick={onConfig}>
      <span className="material-symbols-outlined">settings</span>
    </div>
  );
}

ConfigBtn.propTypes = { onConfig: PropTypes.func.isRequired };
export default ConfigBtn;
