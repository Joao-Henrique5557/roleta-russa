import styles from "./MenuLateral.module.css";
import BotaoMenu from "../BTNs/botaoMenu/BotaoMenu";
import PropTypes from "prop-types";

function MenuLateral({ onSingleplayer, onMultiplayer, onPerfil, onEstudos }) {
  return (
    <div className={styles.menuLateral}>
      <BotaoMenu texto="Jogar contra bot" onClick={onSingleplayer} />
      <BotaoMenu texto="Multiplayer: entrar em sala" onClick={onMultiplayer} />
      <BotaoMenu texto="Perfil" onClick={onPerfil} />
      {/* Tela de estudos: playlists dos cursos, tecnologias e conceitos
          usados no projeto - útil pra quem está aprendendo junto. */}
      {onEstudos && <BotaoMenu texto="📚 Sobre o projeto / Estudos" onClick={onEstudos} />}
    </div>
  );
}

MenuLateral.propTypes = {
  onSingleplayer: PropTypes.func.isRequired,
  onMultiplayer: PropTypes.func.isRequired,
  onPerfil: PropTypes.func,
  onEstudos: PropTypes.func,
};
export default MenuLateral;
