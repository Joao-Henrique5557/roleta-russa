import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import axios from "axios";
import { getErrorMessage } from "../utils/apiError";
import { colors, radius, spacing } from "../constants/theme";

// Porta de components/especiais/Terminal/TerminalSql.jsx. Chama
// POST /DevSql de verdade no backend Java (DevSqlServlet.java) - o MESMO
// endpoint sensível usado pelo web, com a MESMA validação no servidor
// (cargo === 'DEV', conferido no banco, nunca só no app) e a mesma trava
// por variável de ambiente ENABLE_DEV_SQL (sem ela =true no servidor, o
// endpoint responde 404 e este terminal só mostra erro de conexão).
//
// NÃO portamos o miniformulário de "Cadastrar novidade" que ainda existe
// dentro do TerminalSql.jsx do web - ele fala com CadastrarNovidade, do
// sistema antigo de Novidades que a própria Home web já não usa mais
// (trocou pra Feedbacks). Preservar essa forma legada aqui só adicionaria
// uma tela morta sem endpoint com uso ativo em lugar nenhum do app.
function RelogioTerminal() {
  const [hora, setHora] = useState(() => new Date().toLocaleTimeString("pt-BR"));

  useEffect(() => {
    const id = setInterval(() => setHora(new Date().toLocaleTimeString("pt-BR")), 1000);
    return () => clearInterval(id);
  }, []);

  return <Text style={styles.relogio}>{hora}</Text>;
}

export default function TerminalSql({ urlAPI, usuarioId }) {
  const [comando, setComando] = useState("SELECT * FROM usuarios LIMIT 10");
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState(null); // { tipo, colunas, linhas, ... } | { erro }
  const [historico, setHistorico] = useState([]);

  async function executar() {
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
      // quanto pra "acesso negado" / endpoint desativado - mostramos a
      // mensagem exatamente como veio.
      const mensagem = error.response?.data?.error || getErrorMessage(error, "Erro ao executar SQL.");
      setResultado({ erro: mensagem });
    } finally {
      setExecutando(false);
    }
  }

  return (
    <View style={styles.areaDev}>
      <View style={styles.header}>
        <View style={styles.headerTitulo}>
          <View style={styles.dot} />
          <Text style={styles.headerTexto}>TERMINAL_SQL v1.0 — roleta_russa</Text>
        </View>
        <RelogioTerminal />
      </View>

      <Text style={styles.aviso}>
        Executa comandos DIRETO no MySQL do container. Use com cuidado: não há confirmação antes de
        um DELETE ou UPDATE sem WHERE.
      </Text>

      <Text style={styles.prompt}>root@roleta-russa:~$</Text>

      <TextInput
        style={styles.textarea}
        placeholder="Digite comandos SQL aqui..."
        placeholderTextColor="rgba(255,255,255,0.4)"
        value={comando}
        onChangeText={setComando}
        multiline
        numberOfLines={4}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable
        style={[styles.btnExecutar, executando && styles.btnExecutarDisabled]}
        onPress={executar}
        disabled={executando}
      >
        {executando ? (
          <ActivityIndicator color="#000" size="small" />
        ) : (
          <Text style={styles.btnExecutarTexto}>▶ EXECUTAR</Text>
        )}
      </Pressable>

      {resultado?.erro && <Text style={styles.erro}>✖ ERRO: {resultado.erro}</Text>}

      {resultado?.tipo === "select" && (
        <View style={styles.resultadoBox}>
          <Text style={styles.meta}>
            &gt; {resultado.totalLinhas} linha(s) em {resultado.duracaoMs}ms
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={styles.tabelaLinha}>
                {resultado.colunas.map((c) => (
                  <Text key={c} style={[styles.celula, styles.celulaCabecalho]}>
                    {c}
                  </Text>
                ))}
              </View>
              <ScrollView style={styles.tabelaCorpo}>
                {resultado.linhas.map((linha, i) => (
                  <View key={i} style={styles.tabelaLinha}>
                    {resultado.colunas.map((c) => (
                      <Text key={c} style={styles.celula}>
                        {linha[c] === null ? "NULL" : String(linha[c])}
                      </Text>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}

      {resultado?.tipo === "escrita" && (
        <Text style={styles.meta}>
          &gt; OK — {resultado.linhasAfetadas} linha(s) afetada(s) em {resultado.duracaoMs}ms
          {resultado.insertId ? ` — novo id: ${resultado.insertId}` : ""}
        </Text>
      )}

      {historico.length > 0 && (
        <View style={styles.historico}>
          <Text style={styles.historicoTitulo}>&gt; Últimos comandos:</Text>
          {historico.map((c, i) => (
            <Pressable key={i} onPress={() => setComando(c)}>
              <Text style={styles.historicoItem} numberOfLines={1}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  areaDev: {
    width: "100%",
    backgroundColor: "#0a0a0a",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(80, 255, 120, 0.3)",
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitulo: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#50ff78" },
  headerTexto: { color: "#50ff78", fontSize: 12, fontFamily: "monospace" },
  relogio: { color: "rgba(80,255,120,0.7)", fontSize: 12, fontFamily: "monospace" },
  aviso: { color: "rgba(255,255,255,0.6)", fontSize: 11, lineHeight: 15 },
  prompt: { color: "#50ff78", fontSize: 12, fontFamily: "monospace" },
  textarea: {
    minHeight: 90,
    backgroundColor: "#000000",
    color: "#50ff78",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(80,255,120,0.3)",
    padding: spacing.sm,
    fontFamily: "monospace",
    fontSize: 13,
    textAlignVertical: "top",
  },
  btnExecutar: {
    backgroundColor: "#50ff78",
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  btnExecutarDisabled: { opacity: 0.6 },
  btnExecutarTexto: { color: "#000000", fontWeight: "700", fontFamily: "monospace" },
  erro: { color: "#ff5555", fontFamily: "monospace", fontSize: 12 },
  resultadoBox: { gap: spacing.xs },
  meta: { color: "rgba(80,255,120,0.8)", fontFamily: "monospace", fontSize: 12 },
  tabelaCorpo: { maxHeight: 220 },
  tabelaLinha: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "rgba(80,255,120,0.15)" },
  celula: {
    color: "#e0e0e0",
    fontFamily: "monospace",
    fontSize: 11,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    minWidth: 90,
  },
  celulaCabecalho: { color: "#50ff78", fontWeight: "700" },
  historico: { gap: 2, marginTop: spacing.xs },
  historicoTitulo: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "monospace" },
  historicoItem: {
    color: "rgba(80,255,120,0.8)",
    fontSize: 11,
    fontFamily: "monospace",
    paddingVertical: 2,
  },
});
