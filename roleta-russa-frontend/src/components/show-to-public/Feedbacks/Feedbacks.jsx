import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "./Feedbacks.module.css";
import FeedbackCard from "../FeedbackCard/FeedbackCard";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/apiError";

// Substitui o antigo mural de "Novidades" (só o dono do projeto postava).
// Agora é um mural alimentado pelos próprios jogadores: comentários,
// sugestões e denúncias. Backend: GET/POST /ListarFeedbacks e /CriarFeedback
// (ver ListarFeedbacks.java / CriarFeedback.java, ou o espelho em
// roleta-russa-backend-node/src/routes/feedbacks.js).

const TIPOS = [
  { valor: "COMENTARIO", label: "💬 Comentário" },
  { valor: "SUGESTAO", label: "💡 Sugestão" },
  { valor: "DENUNCIA", label: "🚩 Denúncia" },
];

const TAMANHO_MAXIMO_MENSAGEM = 2000;

/** Lê o usuário logado do localStorage (se houver) sem quebrar a tela. */
function lerUsuarioLogado() {
  try {
    const bruto = localStorage.getItem("usuario");
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

function Feedbacks({ urlAPI }) {
  const usuarioLogado = lerUsuarioLogado();

  const [feedbacks, setFeedbacks] = useState([]);
  const [filtro, setFiltro] = useState(""); // "" = todos
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const { showToast } = useToast();

  const [tipoNovo, setTipoNovo] = useState("COMENTARIO");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const listarFeedbacks = useCallback(
    async (tipoFiltro) => {
      try {
        setLoading(true);
        setErro(null);
        const response = await axios.get(`${urlAPI}/ListarFeedbacks`, {
          params: tipoFiltro ? { tipo: tipoFiltro } : undefined,
          timeout: 5000,
        });
        setFeedbacks(response.data);
      } catch (error) {
        const mensagemErro = getErrorMessage(error, "Erro ao buscar comentários.");
        setErro(mensagemErro);
        showToast(mensagemErro, "error");
      } finally {
        setLoading(false);
      }
    },
    [urlAPI, showToast],
  );

  useEffect(() => {
    if (urlAPI) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- busca a lista ao montar/trocar filtro, igual ao padrão usado em Ranking/PerfilPage
      listarFeedbacks(filtro);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlAPI, filtro]);

  async function handleEnviar(event) {
    event.preventDefault();

    const texto = mensagem.trim();
    if (!texto) {
      showToast("Escreva algo antes de enviar.", "error");
      return;
    }
    if (texto.length > TAMANHO_MAXIMO_MENSAGEM) {
      showToast(`Mensagem muito longa (máximo ${TAMANHO_MAXIMO_MENSAGEM} caracteres).`, "error");
      return;
    }

    setEnviando(true);
    try {
      const params = new URLSearchParams();
      params.append("tipo", tipoNovo);
      params.append("mensagem", texto);
      params.append("autor", usuarioLogado?.nome || "Anônimo");
      if (usuarioLogado?.id) {
        params.append("usuarioId", usuarioLogado.id);
      }

      const { data } = await axios.post(`${urlAPI}/CriarFeedback`, params, {
        timeout: 5000,
      });

      showToast(data?.message || "Enviado com sucesso!", "success");
      setMensagem("");
      // Só recarrega a lista se o feedback novo entrar no filtro atual
      // (ex: se estou vendo só "Denúncias" e mando um "Comentário", não
      // faz sentido recarregar - ele não vai aparecer mesmo).
      if (!filtro || filtro === tipoNovo) {
        listarFeedbacks(filtro);
      }
    } catch (error) {
      showToast(getErrorMessage(error, "Erro ao enviar. Tente novamente."), "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={styles.feedbacks}>
      <h1>Comentários &amp; Sugestões</h1>

      <form className={styles.form} onSubmit={handleEnviar}>
        <div className={styles.tipoSelector} role="radiogroup" aria-label="Tipo de feedback">
          {TIPOS.map((t) => (
            <button
              key={t.valor}
              type="button"
              role="radio"
              aria-checked={tipoNovo === t.valor}
              className={`${styles.tipoBtn} ${tipoNovo === t.valor ? styles.tipoBtnAtivo : ""}`}
              onClick={() => setTipoNovo(t.valor)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          className={styles.textarea}
          placeholder={
            tipoNovo === "DENUNCIA"
              ? "Descreva o que aconteceu (comportamento, bug, etc.)..."
              : "Escreva aqui..."
          }
          value={mensagem}
          maxLength={TAMANHO_MAXIMO_MENSAGEM}
          onChange={(e) => setMensagem(e.target.value)}
          rows={3}
        />
        <div className={styles.formFooter}>
          <span className={styles.contador}>
            {mensagem.length}/{TAMANHO_MAXIMO_MENSAGEM}
          </span>
          <button className={styles.enviarBtn} type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>

      <div className={styles.filtros}>
        <button
          className={`${styles.filtroBtn} ${!filtro ? styles.filtroBtnAtivo : ""}`}
          onClick={() => setFiltro("")}
        >
          Todos
        </button>
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            className={`${styles.filtroBtn} ${filtro === t.valor ? styles.filtroBtnAtivo : ""}`}
            onClick={() => setFiltro(t.valor)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.lista}>
        {loading && <p>Carregando...</p>}
        {!loading && erro && <p role="alert">{erro}</p>}
        {!loading && !erro && feedbacks.length === 0 && <p>Nenhum registro encontrado ainda.</p>}
        {!loading &&
          !erro &&
          feedbacks.map((feedback) => <FeedbackCard key={feedback.id} {...feedback} />)}
      </div>
    </div>
  );
}

Feedbacks.propTypes = {
  urlAPI: PropTypes.string.isRequired,
};

export default Feedbacks;
