import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import musicTracks from "../constants/musicTracks";

const MusicPlayerContext = createContext(null);

/**
 * Dono único do elemento <audio>. Fica montado na raiz do app (ver App.jsx),
 * então trocar de tela (Home -> Config -> Singleplayer etc.) NÃO desmonta
 * esse componente, e a música continua tocando normalmente.
 *
 * O componente visual (Music-player.jsx) não guarda mais nenhum estado de
 * áudio próprio - ele só lê/chama o que está aqui via useMusicPlayer().
 */
export function MusicPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const isFirstMount = useRef(true);

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100 (%)
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);

  const currentTrack = musicTracks[trackIndex];

  // Troca de faixa: recarrega o <audio> e, se já estava tocando, continua.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // No primeiro mount o <audio> já carrega sozinho pelo atributo src do
    // JSX - forçar load() aqui só causaria um "soluço" audível à toa.
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    audio.pause();
    audio.load();
    setProgress(0);

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex]);

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  const nextTrack = useCallback(() => {
    setTrackIndex((prev) => (prev + 1) % musicTracks.length);
  }, []);

  const prevTrack = useCallback(() => {
    setTrackIndex(
      (prev) => (prev - 1 + musicTracks.length) % musicTracks.length,
    );
  }, []);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  // Faixa acabou -> avança pra próxima automaticamente
  const handleEnded = () => {
    nextTrack();
  };

  // Faixa deu erro ao carregar (404, arquivo corrompido, etc.) -> avisa no
  // console (em vez de travar o player em silêncio) e pula pra próxima.
  const handleError = () => {
    console.error(
      `[MusicPlayer] Falha ao carregar a faixa "${currentTrack.label}" (${currentTrack.src}). Pulando para a próxima.`,
    );
    setIsPlaying(false);
  };

  const seek = useCallback(
    (percent) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      audio.currentTime = (percent / 100) * duration;
      setProgress(percent);
    },
    [duration],
  );

  const value = {
    tracks: musicTracks,
    currentTrack,
    trackIndex,
    isPlaying,
    progress,
    duration,
    volume,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    setTrackIndex,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
        preload="auto"
        hidden
      />
    </MusicPlayerContext.Provider>
  );
}

MusicPlayerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook pra controlar a música de qualquer componente dentro do
 * <MusicPlayerProvider>. Uso: const { togglePlay, isPlaying } = useMusicPlayer();
 */
export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error(
      "useMusicPlayer precisa ser usado dentro de um <MusicPlayerProvider>.",
    );
  }
  return context;
}
