import { useEffect, useState } from "react";
import styles from "./Ranking.module.css";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/apiError";

function Ranking({ urlAPI }) {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoanding] = useState(false);
  const [erro, setErro] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const listarUsuarios = async () => {
      try {
        setLoanding(true);
        setErro(null);
        const response = await axios.get(`${urlAPI}/ListarUsuarios`, {
          timeout: 5000,
        });
        setJogadores(response.data);
      } catch (error) {
        // Antes: alert() bloqueante toda vez que o ranking falhava ao
        // carregar. Agora: mensagem inline discreta + toast, sem travar a
        // tela - o resto da Home continua usável enquanto isso.
        const mensagem = getErrorMessage(error, "Erro ao buscar dados do ranking.");
        setErro(mensagem);
        showToast(mensagem, "error");
      } finally {
        setLoanding(false);
      }
    };

    if (urlAPI) {
      listarUsuarios();
    }
  }, [urlAPI, showToast]);

  return (
    <div className={styles.ranking}>
      <h1>Ranking Global</h1>
      {loading && <p>Carregando</p>}
      {!loading && erro && <p role="alert">{erro}</p>}
      {!loading && !erro && jogadores.length === 0 ? (
        <p>Nenhum jogador encontrado.</p>
      ) : (
        !erro && (
          <ol className={styles.list}>
            {jogadores.map((jogador, index) => (
              <li key={jogador.id || index} className={styles.item}>
                <span className={styles.posicao}>{index + 1}°</span>
                <span className={styles.nome}>{jogador.nome}</span>
                <span className={styles.pontos}>{jogador.pontos} pt</span>
              </li>
            ))}
          </ol>
        )
      )}
    </div>
  );
}

export default Ranking;
