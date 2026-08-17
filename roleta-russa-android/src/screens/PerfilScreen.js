import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import ScreenBackground from "../components/ScreenBackground";
import { PrimaryButton, SecondaryButton } from "../components/Buttons";
import TerminalSql from "../components/TerminalSql";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/apiError";
import { API_URL } from "../config/api";
import { colors, spacing } from "../constants/theme";

const fotoPadrao = require("../../assets/imagens/fotoPadrao.jpg");

// Porta de roleta-russa-frontend/src/pages/PerfilPage/PerfilPage.jsx.
//
// Mesmo fluxo do web: carrega o usuário salvo (AsyncStorage no lugar de
// localStorage) e em seguida busca os dados atuais em GET /BuscarUsuario
// (os pontos podem estar desatualizados se mudaram em outra sessão).
//
// A "Área de DEV Vip" agora chama o /DevSql de verdade via TerminalSql.js
// - veja os comentários lá sobre o que ficou de fora (o miniformulário de
// Novidade, ligado a um sistema que a própria Home web já não usa mais).
export default function PerfilScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const { showToast } = useToast();
  const onBack = () => navigation.goBack();

  const atualizarDoServidor = useCallback(async (usuarioAtual) => {
    if (!usuarioAtual?.id) return;
    setAtualizando(true);
    try {
      const { data } = await axios.get(`${API_URL}/BuscarUsuario`, {
        params: { id: usuarioAtual.id },
        timeout: 5000,
      });
      setUsuario(data);
      await AsyncStorage.setItem("usuario", JSON.stringify(data));
    } catch (error) {
      showToast(getErrorMessage(error, "Não foi possível atualizar seus dados."), "error");
    } finally {
      setAtualizando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let ativo = true;
    AsyncStorage.getItem("usuario")
      .then(async (valor) => {
        if (!ativo) return;
        let inicial = null;
        try {
          inicial = valor ? JSON.parse(valor) : null;
        } catch {
          inicial = null;
        }
        setUsuario(inicial);
        setCarregando(false);
        if (inicial) await atualizarDoServidor(inicial);
      })
      .catch(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [atualizarDoServidor]);

  if (carregando) {
    return (
      <ScreenBackground variant="image">
        <SafeAreaView style={styles.centralizado}>
          <ActivityIndicator color={colors.secondaryLight} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (!usuario) {
    return (
      <ScreenBackground variant="image">
        <SafeAreaView style={styles.centralizado}>
          <Text style={styles.h1}>Meu Perfil</Text>
          <Text style={styles.infoTexto}>Você precisa estar logado para ver seu perfil.</Text>
          <PrimaryButton title="Voltar" onPress={onBack} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const dataCadastro = usuario.dataCadastro
    ? new Date(usuario.dataCadastro).toLocaleDateString("pt-BR")
    : "Não encontrado";

  return (
    <ScreenBackground variant="image" scroll>
      <SafeAreaView style={styles.container}>
        <Text style={styles.h1}>Meu Perfil</Text>

        <Image source={fotoPadrao} style={styles.avatar} />

        <View style={styles.botoesTopo}>
          <PrimaryButton title="Voltar" onPress={onBack} style={styles.flexBtn} />
          <SecondaryButton
            title={atualizando ? "Atualizando..." : "🔄 Atualizar do servidor"}
            onPress={() => atualizarDoServidor(usuario)}
            disabled={atualizando}
            style={styles.flexBtn}
          />
        </View>

        <View style={styles.grade}>
          <LinhaInfo label="Nome de Usuário:" valor={usuario.nome || "Não encontrado"} />
          <LinhaInfo label="Email:" valor={usuario.email || "Não encontrado"} />
          <LinhaInfo label="Pontos:" valor={`${usuario.pontos ?? 0}pts`} />
          <LinhaInfo label="Cargo:" valor={usuario.cargo || "Não encontrado"} />
          <LinhaInfo label="Data de Cadastro:" valor={dataCadastro} />
        </View>

        <Text style={styles.h2}>Área de DEV Vip</Text>

        {usuario.cargo === "DEV" ? (
          <TerminalSql urlAPI={API_URL} usuarioId={String(usuario.id)} />
        ) : (
          <Text style={styles.semAcesso}>
            Você não tem acesso a área de DEV Vip. (Veja no README como um administrador pode
            alterar seu cargo pra &quot;DEV&quot; direto no banco de dados.)
          </Text>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

function LinhaInfo({ label, valor }) {
  return (
    <View style={styles.linhaInfo}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
  },
  centralizado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  h1: { color: colors.textWhite, fontSize: 22, fontWeight: "bold" },
  h2: { color: colors.textWhite, fontSize: 18, fontWeight: "600", marginTop: spacing.md },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ffffff",
  },
  botoesTopo: { flexDirection: "row", gap: spacing.sm, width: "100%" },
  flexBtn: { flex: 1 },
  grade: { width: "100%", gap: spacing.sm },
  linhaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  label: { color: "rgba(255,255,255,0.75)" },
  valor: { color: colors.textWhite, fontWeight: "500" },
  infoTexto: { color: colors.textWhite, textAlign: "center" },
  semAcesso: { color: "#ff5555", fontWeight: "bold", textAlign: "center" },
});
