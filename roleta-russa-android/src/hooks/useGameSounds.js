import { useEffect, useRef } from "react";
import { useAudioPlayer } from "expo-audio";

// Porta de roleta-russa-frontend/src/hooks/useSoundEffect.js, adaptada:
// no web, SingleplayerGame.jsx toca os sons DENTRO da função pura
// atirar()/recarregar() (recebendo playTiro/playRecarga/playBalaFalsa
// como parâmetros); MultiplayerRoom.jsx, que só RECEBE o estado já pronto
// pela rede, não tem como fazer isso - em vez disso, ele observa a última
// linha do log e decide o som por palavra-chave (🔁 / REAL / falsa).
//
// Como aqui o motor do jogo (src/game/engine.js) é o MESMO pros dois
// modos e é uma função pura (sem efeitos colaterais, de propósito - fica
// mais fácil de testar/reusar), usamos a técnica do Multiplayer nos dois
// lugares: este hook observa o log do estado do jogo e toca o som
// correspondente sempre que novas linhas aparecem.
const tiroSrc = require("../../assets/audio/tiro.mp3");
const tiroFalsoSrc = require("../../assets/audio/tiro_falso.mp3");
const recargaSrc = require("../../assets/audio/arma_recarregando.mp3");

export function useGameSounds(log) {
  const playerTiro = useAudioPlayer(tiroSrc);
  const playerFalso = useAudioPlayer(tiroFalsoSrc);
  const playerRecarga = useAudioPlayer(recargaSrc);
  const tamanhoAnteriorRef = useRef(log?.length ?? 0);

  useEffect(() => {
    const atual = log || [];
    const anterior = tamanhoAnteriorRef.current;

    if (atual.length > anterior) {
      const novasLinhas = atual.slice(anterior);
      // Prioridade: recarga > bala real > bala falsa (mesma ordem de
      // checagem usada em MultiplayerRoom.jsx).
      const tocarRecarga = novasLinhas.some((l) => l.includes("🔁"));
      const tocarTiro = !tocarRecarga && novasLinhas.some((l) => l.includes("REAL"));
      const tocarFalsa =
        !tocarRecarga && !tocarTiro && novasLinhas.some((l) => l.includes("falsa"));

      try {
        if (tocarRecarga) {
          playerRecarga.seekTo(0);
          playerRecarga.play();
        } else if (tocarTiro) {
          playerTiro.seekTo(0);
          playerTiro.play();
        } else if (tocarFalsa) {
          playerFalso.seekTo(0);
          playerFalso.play();
        }
      } catch {
        // Ignora falha de playback (ex: aparelho sem áudio disponível).
      }
    }

    tamanhoAnteriorRef.current = atual.length;
  }, [log, playerTiro, playerFalso, playerRecarga]);
}

export default useGameSounds;
