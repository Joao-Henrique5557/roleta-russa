import styles from "./Novidades.module.css";
import CardNovidade from "../CardNovidade/CardNovidade";
import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/apiError";

function Novidades({ urlAPI }) {
  const [novidades, setNovidades] = useState([]);
  const [loading, setLoanding] = useState(false);
  const [erro, setErro] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const listarNovidades = async () => {
      try {
        setLoanding(true);
        setErro(null);
        const response = await axios.get(`${urlAPI}/ListarNovidades`, { timeout: 5000 });
        setNovidades(response.data);
      } catch (error) {
        const mensagem = getErrorMessage(error, "Erro ao buscar novidades.");
        setErro(mensagem);
        showToast(mensagem, "error");
      } finally {
        setLoanding(false);
      }
    };
    if (urlAPI) {
      listarNovidades();
    }
  }, [urlAPI, showToast]);

  return (
    <div className={styles.novidades}>
      <h1>Novidades</h1>
      {loading && <p>Carregando...</p>}
      {!loading && erro && <p role="alert">{erro}</p>}
      {!loading && !erro && novidades.length === 0 ? (
        <p>Nenhuma novidade encontrada.</p>
      ) : (
        !erro &&
        novidades.map((novidade, index) => (
          <CardNovidade key={index} {...novidade} />
        ))
      )}
    </div>
  );
}

export default Novidades;
