import styles from "./home.module.css";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Ranking from "../../components/show-to-public/Ranking/Ranking";
import Novidades from "../../components/show-to-public/Novidades/Novidades";
import Footer from "../../components/show-to-public/Footer/Footer";
import ScrollIndicator from "../../components/ScrollIndicador/ScrollIndicator";
import PropTypes from "prop-types";
import ConfigBtn from "../../components/BTNs/ConfigBtn/ConfigBtn";

Home.propTypes = {
  onConfig: PropTypes.func.isRequired,
  onSingleplayer: PropTypes.func.isRequired,
  onMultiplayer: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

function Home({ onConfig, onSingleplayer, onMultiplayer, onLogout, urlAPI, onPerfil }) {
  return (
    <div className={styles.home}>
      <ConfigBtn onConfig={onConfig} />
      <span
        className={`${styles.logoutBtn} material-symbols-outlined`}
        onClick={onLogout}
      >
        logout
      </span>
      <div className={styles.conteudoPrincipal}>
        <MenuLateral
          onSingleplayer={onSingleplayer}
          onMultiplayer={onMultiplayer}
          onPerfil={onPerfil}
        />
        <Ranking urlAPI={urlAPI}/>
        <Novidades urlAPI={urlAPI}/>
        <ScrollIndicator />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
