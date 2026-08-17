import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenBackground from "../components/ScreenBackground";
import Formulario from "../components/Formulario";
import { API_URL } from "../config/api";
import { spacing } from "../constants/theme";

// Porta de roleta-russa-frontend/src/pages/authentication/Login.jsx
export default function LoginScreen({ navigation }) {
  function onSignup() {
    navigation.navigate("Cadastro");
  }

  function onHome() {
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  }

  return (
    <ScreenBackground scroll>
      <SafeAreaView style={styles.container}>
        <View style={styles.conteudo}>
          <Text style={styles.aviso}>
            Caso a mensagem de recarregar a pagina apareça, recarregue a pagina até o servidor
            acordar!
          </Text>

          <Formulario tipo="login" onSwitch={onSignup} onSubmit={onHome} urlAPI={API_URL} />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    minHeight: "100%",
  },
  conteudo: {
    width: "100%",
    alignItems: "center",
    gap: spacing.lg,
  },
  aviso: {
    color: "rgba(165, 176, 199, 0.9)",
    textAlign: "center",
    fontSize: 13,
    maxWidth: 400,
  },
});
