import styles from "./config.module.css";
import PropTypes from "prop-types";

function ConfigPage({ onBack }) {
  return (
    <div className={styles.pagePanel}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Configurações</h1>
          <p>Nenhuma opção configurável por aqui ainda.</p>
        </div>
        <button className={styles.primaryButton} onClick={onBack}>
          Voltar
        </button>
      </div>
    </div>
  );
}

ConfigPage.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default ConfigPage;
