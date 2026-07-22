import styles from "./music-player.module.css";
import { useMusicPlayer } from "../../../../context/MusicPlayerContext";

/**
 * Componente 100% visual - todo o estado de reprodução (faixa atual,
 * tocando/pausado, progresso, volume) vive no MusicPlayerContext, que fica
 * montado na raiz do app (App.jsx). Por isso a música continua tocando
 * normalmente mesmo saindo dessa tela.
 */
const MusicPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
  } = useMusicPlayer();

  return (
    <div className={styles.player}>
      <img
        className={styles.cover}
        src={currentTrack.capa}
        alt={`Capa de ${currentTrack.label}`}
      />
      <h2 className={styles.text}>Now Playing</h2>
      <h3 id="title" className={styles.title}>
        {currentTrack.label}
      </h3>
      <p id="artist" className={styles.artist}>
        Artist Name
      </p>

      <div className={styles.controls}>
        <button id="prev" onClick={prevTrack}>
          Voltar
        </button>
        <button id="play" className={styles.playBtn} onClick={togglePlay}>
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <button id="next" onClick={nextTrack}>
          Próx
        </button>
      </div>

      <div className={styles.progress}>
        <input
          type="range"
          id="progress"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
        />
      </div>

      <div className={styles.volume}>
        <i className={styles.text}>volume</i>
        <input
          type="range"
          id="volume"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default MusicPlayer;
