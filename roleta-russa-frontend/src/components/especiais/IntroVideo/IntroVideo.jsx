import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./IntroVideo.module.css";
import CreditsOverlay from "./CreditsOverlay";

function IntroVideo({ src, onFinish }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const finalizadoRef = useRef(false);

  // Evita chamar onFinish duas vezes (ex: clique em "Pular" logo antes do onEnded disparar)
  const finalizar = useCallback(() => {
    if (finalizadoRef.current) return;
    finalizadoRef.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Como a intro só abre a partir de um clique no botão "Créditos", o
    // navegador considera essa ação como originada de um gesto do usuário
    // e libera autoplay COM som. Se mesmo assim algum navegador bloquear
    // (ex: política mais restrita), caímos pro modo mudo como fallback.
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      setMuted(true);
      video.play().catch(() => {});
    });
  }, []);

  const handleUnmute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    video.play().catch(() => {});
  };

  return (
    <div className={styles.introOverlay}>
      <video
        ref={videoRef}
        className={styles.introVideo}
        src={src}
        autoPlay
        playsInline
        onEnded={finalizar}
        onError={finalizar}
      />

      <CreditsOverlay />

      <div className={styles.introControls}>
        {muted && (
          <button
            type="button"
            className={styles.controlBtn}
            onClick={handleUnmute}
          >
            🔊 Ativar som
          </button>
        )}
        <button type="button" className={styles.controlBtn} onClick={finalizar}>
          Pular introdução ⏭
        </button>
      </div>
    </div>
  );
}

IntroVideo.propTypes = {
  src: PropTypes.string.isRequired,
  onFinish: PropTypes.func.isRequired,
};

export default IntroVideo;
