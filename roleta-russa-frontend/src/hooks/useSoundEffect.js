import { useCallback } from "react";

export function useSoundEffect(src, volume = 0.8) {
  // play é uma função que cria um novo objeto Audio e toca o som.
  const play = useCallback(() => {
    try {
      const audio = new Audio(src); // Cria um novo objeto Audio para cada reprodução, permitindo sobreposição de sons.
      audio.volume = volume; // Define o volume do som (0.0 a 1.0).

      audio.play().catch(() => {});
    } catch {
      // Ignora falha de criação/playback do áudio (ex: navegador sem suporte).
    }
  }, [src, volume]);

  return play;
}

export default useSoundEffect;
