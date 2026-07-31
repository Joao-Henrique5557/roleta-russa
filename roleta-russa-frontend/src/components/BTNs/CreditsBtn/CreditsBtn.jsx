import styles from "./CreditsBtn.module.css";
import PropTypes from "prop-types";

function CreditsBtn({ onCredits }) {
  return (
    <div className={styles.creditsBtn} onClick={onCredits}>
      <span className="material-symbols-outlined">movie</span>
      <span className={styles.label}>Créditos</span>
    </div>
  );
}

CreditsBtn.propTypes = { onCredits: PropTypes.func.isRequired };
export default CreditsBtn;
