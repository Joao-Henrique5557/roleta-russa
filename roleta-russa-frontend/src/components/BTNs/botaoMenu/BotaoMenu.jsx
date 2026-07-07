import styles from "./BotaoMenu.module.css";
import PropTypes from "prop-types";

function BotaoMenu({ texto, onClick }) {
  return (
    <button className={styles.botaoMenu} type="button" onClick={onClick}>
      {texto}
    </button>
  );
}

BotaoMenu.propTypes = {
  texto: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default BotaoMenu;
