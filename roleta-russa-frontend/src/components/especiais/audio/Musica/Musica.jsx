import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

function Musica({ src, volume = 0.0 }) {
  const audioRef = useRef(null);

  // Atualiza apenas o volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const enable = () => {
      audio.play().catch(() => {});
      document.removeEventListener("click", enable);
      document.removeEventListener("touchstart", enable);
    };

    const playAudio = () => {
      audio.play().catch(() => {
        document.addEventListener("click", enable);
        document.addEventListener("touchstart", enable);
      });
    };

    audio.pause();
    audio.currentTime = 0;
    audio.load();

    if (audio.readyState >= 2) {
      playAudio();
    } else {
      audio.addEventListener("canplay", playAudio, { once: true });
    }

    return () => {
      audio.pause();
      audio.removeEventListener("canplay", playAudio);
      document.removeEventListener("click", enable);
      document.removeEventListener("touchstart", enable);
    };
  }, [src]);

  return (
    <audio ref={audioRef} loop hidden preload="auto">
      <source src={src} type="audio/mpeg" />
      Seu navegador não suporta áudio.
    </audio>
  );
}

Musica.propTypes = {
  src: PropTypes.string.isRequired,
  volume: PropTypes.number,
};

export default Musica;
