import styles from "./CardNovidade.module.css";

function CardNovidade({ titulo, descricao, autor, versao, tipo, dataPublicacao, ativo }) {
  const formatarData = (dataString) => {
    if (!dataString) return "Data não informada";
    
    try {
      const data = new Date(dataString);
      // Verifica se a data é válida antes de formatar
      if (isNaN(data.getTime())) return dataString; 

      // Formata para o padrão DD/MM/AAAA, HH:MM
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(data);
    } catch (e) {
      console.error("Error: " + e)
      return dataString; // Caso ocorra erro, retorna o texto original
    }
  };
  return (
    <div className={styles.card}>
      <h3>Título: {titulo}</h3>
      <br />
      <p>Descrição: {descricao}</p>
      <br />
      <p>Autor: {autor}</p>
      <br />
      <p>Versão: {versao}</p>
      <br />
      <p>Tipo: {tipo}</p>
      <br />
      <p>Data: {formatarData(dataPublicacao)}</p>
      <br />
      <p>Ativo? {
      ativo.toString() === "true" ? "sim" : "não"}</p>
    </div>
  );
}

export default CardNovidade;
