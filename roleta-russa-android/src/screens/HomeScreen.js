import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenBackground from "../components/ScreenBackground";
import BotaoMenu from "../components/BotaoMenu";
import Ranking from "../components/Ranking";
import Feedbacks from "../components/Feedbacks";
import { API_URL } from "../config/api";
import { colors, spacing } from "../constants/theme";

// Porta de roleta-russa-frontend/src/pages/Home/Home.jsx + MenuLateral.jsx
// + Footer.jsx. Fundo com foto (fundo.png + overlay), botão de logout
// flutuante no canto (como o .logoutBtn fixed do CSS) e menu em pills
// (BotaoMenu), igual ao web.
export default function HomeScreen({ navigation }) {
  async function onLogout() {
    await AsyncStorage.removeItem("usuario");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  async function onPerfil() {
    const usuario = await AsyncStorage.getItem("usuario");
    navigation.navigate(usuario ? "Perfil" : "Login");
  }

  return (
    <ScreenBackground variant="image" scroll>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <Pressable onPress={onLogout} hitSlop={12} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={26} color={colors.textWhite} />
        </Pressable>

        <View style={styles.conteudoPrincipal}>
          <View style={styles.menu}>
            <BotaoMenu texto="Jogar contra bot" onPress={() => navigation.navigate("Singleplayer")} />
            <BotaoMenu
              texto="Multiplayer: entrar em sala"
              onPress={() => navigation.navigate("Multiplayer")}
            />
            <BotaoMenu texto="Perfil" onPress={onPerfil} />
          </View>

          <Ranking urlAPI={API_URL} />
          <Feedbacks urlAPI={API_URL} />
        </View>

        <View style={styles.footer}>
          <View style={styles.footerColuna}>
            <Text style={styles.footerTitulo}>Redes sociais</Text>
            <Text style={styles.footerTexto}>Instagram</Text>
            <Text style={styles.footerLink} onPress={() => Linking.openURL("https://www.youtube.com/@Pequeno_dev")}>
              YouTube
            </Text>
            <Text
              style={styles.footerLink}
              onPress={() => Linking.openURL("https://www.chess.com/member/joao_henrique5557")}
            >
              Chess.com
            </Text>
            <Text style={styles.footerLink} onPress={() => Linking.openURL("https://github.com/Joao-Henrique5557")}>
              GitHub
            </Text>
          </View>
          <View style={styles.footerColuna}>
            <Text style={styles.footerTitulo}>Tecnologias</Text>
            {/* Mesma estrutura/estilo do footer web, com a stack real do
                app Android (o footer web lista React/HTML/CSS/JSX, que não
                se aplicam aqui). */}
            <Text style={styles.footerTexto}>React Native</Text>
            <Text style={styles.footerTexto}>Expo</Text>
            <Text style={styles.footerTexto}>Jakarta EE</Text>
            <Text style={styles.footerTexto}>MySQL</Text>
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  logoutBtn: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    zIndex: 10,
  },
  conteudoPrincipal: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    gap: spacing.lg,
  },
  menu: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderTopWidth: 2,
    borderTopColor: colors.borderDark,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  footerColuna: {
    alignItems: "center",
    gap: 2,
  },
  footerTitulo: {
    color: colors.secondaryLight,
    fontWeight: "600",
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  footerTexto: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  footerLink: {
    color: colors.primaryLight,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
