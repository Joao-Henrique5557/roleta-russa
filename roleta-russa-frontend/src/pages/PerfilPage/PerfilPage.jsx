// src/pages/PerfilPage/PerfilPage.jsx
//
// Tela de perfil do usuário logado. Duas partes principais:
//   1. Dados do usuário (nome, email, pontos, cargo, data de cadastro),
//      lidos do localStorage e, opcionalmente, atualizados do servidor.
//   2. "Área de DEV Vip": só aparece pra quem tem cargo === "DEV", e dá
//      acesso a um terminal que executa SQL DIRETO no banco (veja o aviso
//      de segurança nos comentários do backend: DevSqlServlet.java /
//      src/routes/dev.js no backend Node).
//
// IMPORTANTE sobre segurança: o front-end só ESCONDE o terminal de quem
// não é DEV - isso é só uma questão de experiência de uso (não faz
// sentido mostrar um botão que vai dar erro 403 pra maioria das pessoas).
// A validação de verdade (que decide se o comando SQL realmente roda ou
// não) acontece no BACKEND, olhando o cargo direto no banco. Nunca confie
// só na checagem do front-end pra proteger algo sensível.
import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "./perfilPage.module.css";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/apiError";

/**
 * Lê e valida o usuário salvo no localStorage. Centralizado aqui porque
 * antes cada `<p>` da tela fazia seu próprio `JSON.parse(...)` (5 vezes!)
 * sem tratar o caso de o valor não existir ou estar corrompido - qualquer
 * um desses `JSON.parse` quebraria a tela inteira em branco.
 */
function lerUsuarioLogado() {
  try {
    const bruto = localStorage.getItem("usuario");
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

/** Sub-componente: o terminal SQL da área DEV. Só é montado se cargo === "DEV". */
function TerminalSql({ urlAPI, usuarioId }) {
  const [comando, setComando] = useState("SELECT * FROM usuarios LIMIT 10");
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState(null); // { tipo, colunas, linhas, ... } | { erro }
  const [historico, setHistorico] = useState([]); // últimos comandos executados

  const executar = useCallback(async () => {
    if (!comando.trim()) return;
    setExecutando(true);
    setResultado(null);
    try {
      const { data } = await axios.post(
        `${urlAPI}/DevSql`,
        { usuarioId, sql: comando },
        { timeout: 10000 },
      );
      setResultado(data);
      setHistorico((atual) => [comando, ...atual].slice(0, 10));
    } catch (error) {
      // O backend devolve { error: "mensagem" } tanto pra erro de SQL
      // quanto pra "acesso negado" (cargo não é DEV) - mostramos a
      // mensagem exatamente como veio.
      const mensagem = error.response?.data?.error || getErrorMessage(error, "Erro ao executar SQL.");
      setResultado({ erro: mensagem });
    } finally {
      setExecutando(false);
    }
  }, [comando, urlAPI, usuarioId]);

  return (
    <div className={styles.areaDEV}>
      <p>
        Terminal SQL — executa comandos DIRETO no MySQL do container. Use com cuidado: não há
        confirmação antes de um <code>DELETE</code> ou <code>UPDATE</code> sem <code>WHERE</code>.
      </p>
      <textarea
        className={styles.terminalSQL}
        placeholder="Digite comandos SQL aqui..."
        value={comando}
        onChange={(e) => setComando(e.target.value)}
        onKeyDown={(e) => {
          // Ctrl+Enter (ou Cmd+Enter no Mac) executa - atalho comum em consoles SQL.
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") executar();
        }}
        rows={4}
      />
      <div className={styles.terminalBotoes}>
        <button className={styles.btnExecutar} onClick={executar} disabled={executando}>
          {executando ? "Executando..." : "▶ Executar (Ctrl+Enter)"}
        </button>
      </div>

      {resultado?.erro && <p className={styles.terminalErro}>❌ {resultado.erro}</p>}

      {resultado?.tipo === "select" && (
        <div className={styles.terminalResultado}>
          <p className={styles.terminalMeta}>
            {resultado.totalLinhas} linha(s) em {resultado.duracaoMs}ms
          </p>
          <div className={styles.terminalTabelaWrapper}>
            <table className={styles.terminalTabela}>
              <thead>
                <tr>
                  {resultado.colunas.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultado.linhas.map((linha, i) => (
                  <tr key={i}>
                    {resultado.colunas.map((c) => (
                      <td key={c}>{linha[c] === null ? "NULL" : String(linha[c])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {resultado?.tipo === "escrita" && (
        <p className={styles.terminalMeta}>
          ✅ {resultado.linhasAfetadas} linha(s) afetada(s) em {resultado.duracaoMs}ms
          {resultado.insertId ? ` — novo id: ${resultado.insertId}` : ""}
        </p>
      )}

      {historico.length > 0 && (
        <div className={styles.terminalHistorico}>
          <p>Últimos comandos:</p>
          <ul>
            {historico.map((c, i) => (
              <li key={i}>
                <button type="button" onClick={() => setComando(c)}>{c}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
TerminalSql.propTypes = {
  urlAPI: PropTypes.string.isRequired,
  usuarioId: PropTypes.string.isRequired,
};

const PerfilPage = ({ onBack, urlAPI }) => {
  const { showToast } = useToast();
  const [usuario, setUsuario] = useState(lerUsuarioLogado);
  const [atualizando, setAtualizando] = useState(false);

  // Busca os dados mais recentes do usuário direto do banco - o
  // localStorage pode estar desatualizado se os pontos mudaram em outra
  // aba/sessão (ex: jogou singleplayer em outra aba). Não usamos
  // useCallback aqui de propósito: a função é simples o bastante pra ser
  // recriada a cada render sem custo perceptível, e evita conflito com a
  // memoização automática do compilador do React nas dependências.
  async function atualizarDoServidor() {
    if (!usuario?.id) return;
    setAtualizando(true);
    try {
      const { data } = await axios.get(`${urlAPI}/BuscarUsuario`, {
        params: { id: usuario.id },
        timeout: 5000,
      });
      setUsuario(data);
      localStorage.setItem("usuario", JSON.stringify(data));
    } catch (error) {
      showToast(getErrorMessage(error, "Não foi possível atualizar seus dados."), "error");
    } finally {
      setAtualizando(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial dos dados do perfil ao montar a tela
    atualizarDoServidor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!usuario) {
    return (
      <div className={styles.perfilPage}>
        <h1>Meu Perfil</h1>
        <p>Você precisa estar logado para ver seu perfil.</p>
        <button className={styles.btnBack} onClick={onBack}>Voltar</button>
      </div>
    );
  }

  return (
    <div className={styles.perfilPage}>
      <h1>Meu Perfil</h1>
      <img
        className={styles.fotoUser}
        src="/images/fotoUser.png"
        alt="Foto do Usuário"
      />
      <button className={styles.btnBack} onClick={onBack}>
        Voltar
      </button>
      <button className={styles.btnAtualizar} onClick={atualizarDoServidor} disabled={atualizando}>
        {atualizando ? "Atualizando..." : "🔄 Atualizar do servidor"}
      </button>
      <div className={styles.gradeInfo}>
        <div className={styles.labelItens}>
          <p>Nome de Usuário:</p>
          <p>Email:</p>
          <p>Pontos:</p>
          <p>Cargo:</p>
          <p>Data de Cadastro:</p>
        </div>
        <div className={styles.ItensInfo}>
          <p>{usuario.nome || "Não encontrado"}</p>
          <p>{usuario.email || "Não encontrado"}</p>
          <p>{usuario.pontos ?? "0"}pts</p>
          <p>{usuario.cargo || "Não encontrado"}</p>
          <p>
            {usuario.dataCadastro
              ? new Date(usuario.dataCadastro).toLocaleDateString()
              : "Não encontrado"}
          </p>
        </div>
      </div>
      <h2>Área de DEV Vip</h2>

      {usuario.cargo === "DEV" ? (
        <TerminalSql urlAPI={urlAPI} usuarioId={String(usuario.id)} />
      ) : (
        <p className={styles.semAcesso}>
          Você não tem acesso a área de DEV Vip. (Veja no README como um administrador pode
          alterar seu cargo pra "DEV" direto no banco de dados.)
        </p>
      )}
    </div>
  );
};

PerfilPage.propTypes = {
  onBack: PropTypes.func.isRequired,
  urlAPI: PropTypes.string.isRequired,
};

export default PerfilPage;
