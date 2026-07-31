// src/pages/PerfilPage/TerminalSql/TerminalSql.jsx
//
// Terminal SQL da "Área de DEV Vip" (só renderizado por PerfilPage.jsx
// quando usuario.cargo === "DEV"). Extraído pra seu próprio arquivo porque
// tinha lógica e estilo o bastante (visual "hacker CRT", histórico de
// comandos, tabela de resultado) pra não fazer sentido mais morar dentro
// de PerfilPage.jsx.

import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "./TerminalSql.module.css";
import { getErrorMessage } from "../../../utils/apiError";
import { useToast } from "../../../context/ToastContext";

function RelogioTerminal() {
  const [hora, setHora] = useState(
    () => new Date().toLocaleTimeString("pt-BR"), // Ex.'19:44:27'
  );

  useEffect(() => {
    const id = setInterval(
      // roda periodicamente depois do componente ser criado
      // define a hora a cada segundo
      () => setHora(new Date().toLocaleTimeString("pt-BR")),
      1000,
    );
    return () => clearInterval(id); // se desmontado, clearInterval!
  }, []);

  return <span className={styles.terminalClock}>{hora}</span>;
}

function TerminalSql({ urlAPI, usuarioId }) {
  // Comando de exemplo
  const [comando, setComando] = useState("SELECT * FROM usuarios LIMIT 10");
  // está executando?
  const [executando, setExecutando] = useState(false);
  // json resultado
  const [resultado, setResultado] = useState(null); // { tipo, colunas, linhas, ... } | { erro }
  // log
  const [historico, setHistorico] = useState([]); // últimos comandos executados
  const { showToast } = useToast();

  // useCallback -> armazena função react
  // função assicrona
  const executar = useCallback(async () => {
    // se comando não existe
    if (!comando.trim()) return;

    // executando
    setExecutando(true);
    // reseta resultado
    setResultado(null);

    // tente
    try {
      const { data } = await axios.post(
        `${urlAPI}/DevSql`,
        // informa id e comando
        { usuarioId, sql: comando },
        // timeout: 10s
        { timeout: 10000 },
      );

      // resultado é esse json
      setResultado(data);

      // log = [comando+[ outros comandos]]
      // (slice) do indice 0 até 10
      setHistorico((atual) => [comando, ...atual].slice(0, 10));
    } catch (error) {
      // O backend devolve { error: "mensagem" } tanto pra erro de SQL
      // quanto pra "acesso negado" (cargo não é DEV) - mostramos a
      // mensagem exatamente como veio.
      const mensagem =
        // se erro tiver response, ok
        error.response?.data?.error ||
        // senão
        getErrorMessage(error, "Erro ao executar SQL.");
      setResultado({ erro: mensagem });
    } finally {
      // finaliza a execução
      setExecutando(false);
    }
  }, [comando, urlAPI, usuarioId]);

  const cadastrarNovidade = useCallback(
    async (titulo, descricao, tipo, autor, versao, ativo) => {
      try {
        // [BUG FIX] O servlet CadastrarNovidade.java lê os campos com
        // request.getParameter(...), que só entende corpos no formato
        // "application/x-www-form-urlencoded" - igual ao resto do app
        // (veja Formulario.jsx). Antes mandávamos um objeto JS puro, e o
        // axios serializava isso como JSON ("Content-Type:
        // application/json"). O servlet não sabe ler JSON, então TODOS os
        // campos chegavam como null e o backend sempre respondia 400
        // ("Campos obrigatórios ausentes"), mesmo com o formulário
        // preenchido corretamente. Trocando para URLSearchParams o axios
        // já manda o Content-Type certo automaticamente.
        const params = new URLSearchParams();
        params.append("titulo", titulo ?? "");
        params.append("descricao", descricao ?? "");
        params.append("tipo", tipo ?? "");
        params.append("autor", autor ?? "");
        params.append("versao", versao ?? "");
        params.append("ativo", ativo ?? "");

        await axios.post(`${urlAPI}/CadastrarNovidade`, params, {
          timeout: 10000,
        });

        showToast("Novidade cadastrada com sucesso!", "success");
      } catch (error) {
        // [BUG FIX] O erro era calculado mas nunca usado - o usuário não
        // recebia nenhum feedback quando o cadastro falhava.
        const mensagem = getErrorMessage(error, "Erro ao cadastrar uma novidade.");
        showToast(mensagem, "error");
      }
    },
    [urlAPI],
  );

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
      <div className={styles.novidades}>
        <p className={styles.terminalAviso}>Cadastrar novidade</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            const form = new FormData(e.target);

            cadastrarNovidade(
              form.get("titulo"),
              form.get("descricao"),
              form.get("tipo"),
              form.get("autor"),
              form.get("versao"),
              form.get("ativo"),
            );

            // Limpa o formulário depois de disparar o cadastro, pra ficar
            // pronto pra próxima novidade sem precisar apagar tudo na mão.
            e.target.reset();
          }}
        >
          <input type="text" placeholder="titulo" name="titulo" />
          <input type="text" placeholder="descrição" name="descricao" />
          <input type="text" name="tipo" placeholder="tipo" />
          <input
            type="text"
            name="autor"
            placeholder="autor"
            // [BUG FIX] localStorage.getItem("usuario") devolve uma STRING
            // (JSON serializado), não um objeto - ".nome" numa string
            // sempre é undefined. Se o usuário nunca tivesse feito login
            // (localStorage vazio = null), ".nome" em cima de null também
            // quebraria o componente inteiro na renderização. Precisa dar
            // JSON.parse() primeiro, com fallback seguro.
            // Usamos defaultValue (não value) porque este input não tem
            // onChange - com "value" o React trataria como campo
            // controlado travado, impedindo o usuário de editar o nome.
            defaultValue={(() => {
              try {
                return JSON.parse(localStorage.getItem("usuario"))?.nome ?? "";
              } catch {
                return "";
              }
            })()}
          />
          <input type="text" placeholder="versão" name="versao" />
          <p>
            true/false <input type="text" placeholder="ativo" name="ativo" />
          </p>

          <input type="submit" value="Cadastrar novidade" />
        </form>
      </div>
    </div>
  );
}

TerminalSql.propTypes = {
  urlAPI: PropTypes.string.isRequired,
  usuarioId: PropTypes.string.isRequired,
};

export default TerminalSql;
