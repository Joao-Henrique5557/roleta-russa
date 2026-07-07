import styles from "./MenuLateral.module.css";
import BotaoMenu from "../BTNs/botaoMenu/BotaoMenu";
import PropTypes from "prop-types";

function MenuLateral({ onSingleplayer, onMultiplayer, onPerfil }) {
  return (
    <div className={styles.menuLateral}>
      <BotaoMenu texto="Jogar contra bot" onClick={onSingleplayer} />
      <BotaoMenu texto="Multiplayer: entrar em sala" onClick={onMultiplayer} />
      <BotaoMenu texto="Perfil" onClick={onPerfil} />
    </div>
  );
}

MenuLateral.propTypes = {
  onSingleplayer: PropTypes.func.isRequired,
  onMultiplayer: PropTypes.func.isRequired,
};
export default MenuLateral;
