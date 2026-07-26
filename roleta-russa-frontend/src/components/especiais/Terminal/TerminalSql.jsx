// src/pages/PerfilPage/TerminalSql/TerminalSql.jsx
//
// Terminal SQL da "Área de DEV Vip" (só renderizado por PerfilPage.jsx
// quando usuario.cargo === "DEV"). Extraído pra seu próprio arquivo porque
// tinha lógica e estilo o bastante (visual "hacker CRT", histórico de
// comandos, tabela de resultado) pra não fazer sentido mais morar dentro
// de PerfilPage.jsx.
//
// IMPORTANTE sobre segurança: este componente só ESCONDE o terminal de
// quem o pai (PerfilPage) decidiu não montar - isso é só uma questão de
// experiência de uso. A validação de verdade (se o SQL realmente roda ou
// não) acontece no BACKEND, olhando o cargo direto no banco. Nunca confie
// só na checagem do front-end pra proteger algo sensível. Veja o aviso
// completo nos comentários do backend: DevSqlServlet.java (Java) /
// src/routes/dev.js (Node).
import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "./TerminalSql.module.css";
import { getErrorMessage } from "../../../utils/apiError";

/**
 * Relógio ao vivo do cabeçalho do terminal. Isolado num componente próprio
 * (em vez de um estado dentro de TerminalSql) para que o tick de 1 em 1
 * segundo não re-renderize o terminal inteiro (textarea, tabela de
 * resultado, histórico) - só este spanzinho.
 */
function RelogioTerminal() {
  const [hora, setHora] = useState(() =>
    new Date().toLocaleTimeString("pt-BR"),
  );

  useEffect(() => {
    const id = setInterval(
      () => setHora(new Date().toLocaleTimeString("pt-BR")),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  return <span className={styles.terminalClock}>{hora}</span>;
}

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
      const mensagem =
        error.response?.data?.error ||
        getErrorMessage(error, "Erro ao executar SQL.");
      setResultado({ erro: mensagem });
    } finally {
      setExecutando(false);
    }
  }, [comando, urlAPI, usuarioId]);

  return (
    <div className={styles.areaDEV}>
      <div className={styles.terminalHeader}>
        <span className={styles.terminalHeaderTitle}>
          <span className={styles.terminalHeaderDot} aria-hidden="true" />
          TERMINAL_SQL v1.0 — roleta_russa
        </span>
        <RelogioTerminal />
      </div>

      <p className={styles.terminalAviso}>
        Executa comandos DIRETO no MySQL do container. Use com cuidado: não há
        confirmação antes de um <code>DELETE</code> ou <code>UPDATE</code> sem{" "}
        <code>WHERE</code>.
      </p>

      <div className={styles.terminalPromptLine}>
        <span className={styles.terminalPrompt}>root@roleta-russa:~$</span>
      </div>
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
        spellCheck={false}
      />
      <div className={styles.terminalBotoes}>
        <button
          className={styles.btnExecutar}
          onClick={executar}
          disabled={executando}
        >
          {executando ? "EXECUTANDO..." : "▶ EXECUTAR"}
          <span className={styles.terminalHint}>Ctrl+Enter</span>
        </button>
      </div>

      {resultado?.erro && (
        <p className={styles.terminalErro}>✖ ERRO: {resultado.erro}</p>
      )}

      {resultado?.tipo === "select" && (
        <div className={styles.terminalResultado}>
          <p className={styles.terminalMeta}>
            &gt; {resultado.totalLinhas} linha(s) em {resultado.duracaoMs}ms
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
                      <td key={c}>
                        {linha[c] === null ? "NULL" : String(linha[c])}
                      </td>
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
          &gt; OK — {resultado.linhasAfetadas} linha(s) afetada(s) em{" "}
          {resultado.duracaoMs}ms
          {resultado.insertId ? ` — novo id: ${resultado.insertId}` : ""}
        </p>
      )}

      {historico.length > 0 && (
        <div className={styles.terminalHistorico}>
          <p>
            <span className={styles.terminalPrompt}>&gt;</span> Últimos
            comandos:
          </p>
          <ul>
            {historico.map((c, i) => (
              <li key={i}>
                <button type="button" onClick={() => setComando(c)}>
                  {c}
                </button>
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

export default TerminalSql;
