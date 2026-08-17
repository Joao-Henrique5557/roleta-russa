import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenBackground from "../components/ScreenBackground";
import InputField from "../components/InputField";
import { PrimaryButton, SecondaryButton } from "../components/Buttons";
import { useToast } from "../context/ToastContext";
import { conectarSocket, getSocket } from "../services/socket";
import { colors, radius, spacing } from "../constants/theme";

// Porta de roleta-russa-frontend/src/pages/game/MultiplayerLobby.jsx.
// Lista salas PÚBLICAS em tempo real via Socket.IO (backend Node -
// roleta-russa-backend-node), permite criar sala (pública ou privada, com
// senha) e entrar direto com um código. Mesmos eventos do web:
// lobby:listar / lobby:criar / lobby:entrar / lobby:atualizada.
export default function MultiplayerLobbyScreen({ navigation }) {
  const { showToast } = useToast();
  const [salas, setSalas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [nomeSala, setNomeSala] = useState("");
  const [privada, setPrivada] = useState(false);
  const [senhaCriar, setSenhaCriar] = useState("");
  const [meuNome, setMeuNome] = useState("");

  const [codigoSala, setCodigoSala] = useState("");
  const [senhaEntrar, setSenhaEntrar] = useState("");

  const onBack = () => navigation.goBack();

  useEffect(() => {
    AsyncStorage.getItem("usuario").then((valor) => {
      if (!valor) return;
      try {
        const usuario = JSON.parse(valor);
        if (usuario?.nome) setMeuNome(usuario.nome);
      } catch {
        // ignora - o campo só fica vazio, a pessoa digita manualmente
      }
    });
  }, []);

  useEffect(() => {
    const socket = conectarSocket();

    function aoAtualizarLobby({ salas: lista }) {
      setSalas(lista || []);
      setCarregando(false);
    }

    socket.on("lobby:atualizada", aoAtualizarLobby);
    socket.emit("lobby:listar", null, (resposta) => aoAtualizarLobby(resposta));

    return () => {
      socket.off("lobby:atualizada", aoAtualizarLobby);
    };
  }, []);

  const nomeValido = useCallback(() => {
    if (!meuNome.trim()) {
      showToast("Digite um nome pra você antes de continuar.", "info");
      return false;
    }
    return true;
  }, [meuNome, showToast]);

  const criarSala = useCallback(() => {
    if (!nomeValido()) return;
    if (privada && !senhaCriar.trim()) {
      showToast("Salas privadas precisam de uma senha.", "info");
      return;
    }
    const socket = getSocket();
    socket.emit(
      "lobby:criar",
      { nome: nomeSala.trim(), privada, senha: senhaCriar, nomeJogador: meuNome.trim() },
      (resposta) => {
        if (resposta?.erro) return showToast(resposta.erro, "error");
        showToast(`Sala criada! Código para convidar: ${resposta.sala.id}`, "success", 8000);
        navigation.navigate("MultiplayerRoom", { salaInicial: resposta.sala });
      },
    );
  }, [nomeSala, privada, senhaCriar, meuNome, nomeValido, showToast, navigation]);

  const entrarNaSala = useCallback(
    (salaId, senha, comoEspectador) => {
      if (!nomeValido()) return;
      const socket = getSocket();
      socket.emit(
        "lobby:entrar",
        { salaId, senha, nomeJogador: meuNome.trim(), comoEspectador },
        (resposta) => {
          if (resposta?.erro) return showToast(resposta.erro, "error");
          navigation.navigate("MultiplayerRoom", { salaInicial: resposta.sala });
        },
      );
    },
    [meuNome, nomeValido, showToast, navigation],
  );

  return (
    <ScreenBackground variant="image" scroll>
      <SafeAreaView style={styles.container}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.h1}>Multiplayer</Text>
            <Text style={styles.subTexto}>Entre em uma sala existente ou crie a sua própria partida.</Text>
          </View>
          <PrimaryButton title="Voltar" onPress={onBack} />
        </View>

        <View style={styles.gameCard}>
          <View style={styles.campo}>
            <Text style={styles.label}>Seu nome (mostrado pra outros na sala)</Text>
            <InputField placeholder="Ex: joao123" value={meuNome} onChangeText={setMeuNome} />
          </View>

          <Text style={styles.cardHeader}>Salas públicas disponíveis</Text>
          {carregando && <ActivityIndicator color={colors.secondaryLight} />}
          {!carregando && salas.length === 0 && (
            <Text style={styles.textoNeutro}>Nenhuma sala pública aberta no momento. Crie a sua!</Text>
          )}

          <View style={styles.roomList}>
            {salas.map((sala) => {
              const cheia = sala.qtdJogadores >= sala.maxJogadores;
              return (
                <View key={sala.id} style={styles.roomItem}>
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomNome}>{sala.nome}</Text>
                    <Text style={styles.roomDetalhe}>
                      Anfitrião: {sala.hostNome} · {sala.qtdJogadores}/{sala.maxJogadores} jogando ·{" "}
                      {sala.qtdEspectadores} assistindo
                    </Text>
                  </View>
                  <PrimaryButton
                    title={cheia ? "Assistir" : "Jogar"}
                    onPress={() => entrarNaSala(sala.id, null, false)}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerTexto}>Tem o código de uma sala privada? Entre direto aqui:</Text>
            <View style={styles.linhaEntrar}>
              <InputField placeholder="Código da sala" value={codigoSala} onChangeText={setCodigoSala} />
              <InputField
                placeholder="Senha (se privada)"
                value={senhaEntrar}
                onChangeText={setSenhaEntrar}
                secureTextEntry
              />
              <SecondaryButton
                title="Entrar"
                onPress={() => entrarNaSala(codigoSala.trim(), senhaEntrar, false)}
                disabled={!codigoSala.trim()}
              />
            </View>

            {mostrarCriar ? (
              <View style={styles.criarSalaForm}>
                <InputField placeholder="Nome da sala" value={nomeSala} onChangeText={setNomeSala} />
                <View style={styles.linhaSwitch}>
                  <Switch value={privada} onValueChange={setPrivada} />
                  <Text style={styles.textoNeutro}>Sala privada (precisa de senha pra entrar)</Text>
                </View>
                {privada && (
                  <InputField
                    placeholder="Senha da sala"
                    value={senhaCriar}
                    onChangeText={setSenhaCriar}
                    secureTextEntry
                  />
                )}
                <View style={styles.criarSalaBotoes}>
                  <PrimaryButton title="Criar sala" onPress={criarSala} />
                  <SecondaryButton title="Cancelar" onPress={() => setMostrarCriar(false)} />
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.footerTexto}>Não encontrou uma sala? Crie a sua própria partida.</Text>
                <PrimaryButton title="Criar nova sala" onPress={() => setMostrarCriar(true)} />
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, gap: spacing.md },
  pageHeader: { gap: spacing.md },
  h1: { color: colors.textWhite, fontSize: 24, fontWeight: "bold" },
  subTexto: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },
  gameCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.2)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  campo: { gap: spacing.xs },
  label: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  cardHeader: { color: colors.textWhite, fontSize: 17, fontWeight: "600" },
  textoNeutro: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  roomList: { gap: spacing.md },
  roomItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.bgCardLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(127,127,255,0.15)",
    gap: spacing.md,
  },
  roomInfo: { flex: 1, gap: 4 },
  roomNome: { color: colors.textWhite, fontSize: 15, fontWeight: "600" },
  roomDetalhe: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(127,127,255,0.15)",
    alignItems: "center",
    gap: spacing.md,
  },
  footerTexto: { color: "rgba(255,255,255,0.8)", textAlign: "center" },
  linhaEntrar: { width: "100%", gap: spacing.sm },
  criarSalaForm: { width: "100%", gap: spacing.sm },
  linhaSwitch: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  criarSalaBotoes: { flexDirection: "row", gap: spacing.sm, justifyContent: "center" },
});
