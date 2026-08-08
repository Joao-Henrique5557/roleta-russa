import PropTypes from "prop-types";
import styles from "./FeedbackCard.module.css";

// Rótulos e ícones exibidos pra cada tipo de feedback. Centralizado aqui
// (em vez de espalhado em condicionais no JSX) pra facilitar adicionar um
// novo tipo no futuro sem precisar mexer em várias partes do componente.
const TIPO_INFO = {
  COMENTARIO: { label: "Comentário", icon: "💬", className: "comentario" },
  SUGESTAO: { label: "Sugestão", icon: "💡", className: "sugestao" },
  DENUNCIA: { label: "Denúncia", icon: "🚩", className: "denuncia" },
};

const STATUS_LABEL = {
  ABERTO: "Aberto",
  EM_ANALISE: "Em análise",
  RESOLVIDO: "Resolvido",
  ARQUIVADO: "Arquivado",
};

function formatarData(dataString) {
  if (!dataString) return "Data não informada";
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return dataString;
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(data);
  } catch {
    return dataString;
  }
}

function FeedbackCard({ tipo, mensagem, autor, status, dataCriacao }) {
  const info = TIPO_INFO[tipo] ?? { label: tipo, icon: "📝", className: "comentario" };

  return (
    <div className={`${styles.card} ${styles[info.className]}`}>
      <div className={styles.header}>
        <span className={styles.badge}>
          {info.icon} {info.label}
        </span>
        {/* Status só é relevante mostrar publicamente pra denúncias -
            comentários/sugestões não têm um fluxo de "resolução". */}
        {tipo === "DENUNCIA" && status && (
          <span className={styles.status}>{STATUS_LABEL[status] ?? status}</span>
        )}
      </div>
      <p className={styles.mensagem}>{mensagem}</p>
      <div className={styles.footer}>
        <span className={styles.autor}>{autor || "Anônimo"}</span>
        <span className={styles.data}>{formatarData(dataCriacao)}</span>
      </div>
    </div>
  );
}

FeedbackCard.propTypes = {
  tipo: PropTypes.oneOf(["COMENTARIO", "SUGESTAO", "DENUNCIA"]).isRequired,
  mensagem: PropTypes.string.isRequired,
  autor: PropTypes.string,
  status: PropTypes.string,
  dataCriacao: PropTypes.string,
};

export default FeedbackCard;
