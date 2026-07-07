import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

Musica.propTypes = {
  src: PropTypes.string.isRequired,
  volume: PropTypes.number,
};

function Musica({ src, volume = 0.7 }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const playAudio = () => {
      audio.volume = volume;
      audio.play().catch(() => {
        const enable = () => {
          audio.play();
          document.removeEventListener("click", enable);
          document.removeEventListener("touchstart", enable);
        };
        document.addEventListener("click", enable);
        document.addEventListener("touchstart", enable);
      });
    };
    audio.pause();
    audio.load();
    if (audio.readyState >= 2) playAudio();
    else audio.addEventListener("canplay", playAudio);
    return () => audio.removeEventListener("canplay", playAudio);
  }, [src, volume]);

  return (
    <audio ref={audioRef} loop hidden>
      <source src={src} type="audio/mpeg" />
    </audio>
  );
}

export default Musica;
