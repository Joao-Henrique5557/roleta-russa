import styles from "./config.module.css";
import PropTypes from "prop-types";

function ConfigPage({
  volume,
  currentTrack,
  tracks,
  onVolumeChange,
  onTrackChange,
  onBack,
}) {
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
        <div className={styles.configSection}>
          <h2>Volume da música</h2>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
          />
          <span>{Math.round(volume * 100)}%</span>
        </div>

        <div className={styles.configSection}>
          <h2>Trocar música</h2>
          <div className={styles.trackList}>
            {tracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className={`${styles.trackButton} ${track.id === currentTrack ? styles.trackButtonActive : ""}`}
                onClick={() => onTrackChange(track.id)}
              >
                {track.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

ConfigPage.propTypes = {
  volume: PropTypes.number.isRequired,
  currentTrack: PropTypes.number.isRequired,
  tracks: PropTypes.array.isRequired,
  onVolumeChange: PropTypes.func.isRequired,
  onTrackChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};
export default ConfigPage;
