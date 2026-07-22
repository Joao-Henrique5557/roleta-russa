import styles from "./config.module.css";
import MusicPlayer from "../../components/especiais/audio/music-player/Music-player";
function ConfigPage({ onBack }) {
  return (
    <div className={styles.pagePanel}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Configurações</h1>
          <p>Altere volume e música de fundo para a experiência do jogo.</p>
        </div>
        <button className={styles.primaryButton} onClick={onBack}>
          Voltar
        </button>
      </div>

      <div className={styles.configCard}>
        <MusicPlayer />
      </div>
    </div>
  );
}

export default ConfigPage;
