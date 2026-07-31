import { useEffect, useState } from "react";
import styles from "./IntroVideo.module.css";
import creditos from "../../../constants/creditos";

/**
 * Faz o ciclo automático entre os blocos de `creditos`, com fade-in/fade-out
 * entre cada um. A troca usa uma `key` no elemento (baseada no índice) pra
 * forçar o React a remontar o nó e a animação de CSS reiniciar do zero -
 * sem isso, trocar só o texto não retriggera a keyframe.
 */
function CreditsOverlay() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const atual = creditos[indice];
    if (!atual) return;

    const timer = setTimeout(() => {
      setIndice((i) => (i + 1) % creditos.length);
    }, atual.duracaoMs);

    return () => clearTimeout(timer);
  }, [indice]);

  const bloco = creditos[indice];
  if (!bloco) return null;

  return (
    <div className={styles.creditsContainer}>
      <div key={bloco.id} className={styles.creditsBlock}>
        <p className={styles.creditsTitulo}>{bloco.titulo}</p>
        {bloco.linhas.map((linha) => (
          <p key={linha} className={styles.creditsLinha}>
            {linha}
          </p>
        ))}
      </div>
    </div>
  );
}

export default CreditsOverlay;
