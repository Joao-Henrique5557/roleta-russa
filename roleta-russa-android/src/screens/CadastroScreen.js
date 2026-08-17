import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenBackground from "../components/ScreenBackground";
import Formulario from "../components/Formulario";
import { API_URL } from "../config/api";
import { spacing } from "../constants/theme";

// Porta de roleta-russa-frontend/src/pages/authentication/Cadastro.jsx
export default function CadastroScreen({ navigation }) {
  // Mesma ideia do web: tanto trocar pra tela de login quanto concluir o
  // cadastro levam de volta pro Login (o cadastro não loga automaticamente).
  function onLogin() {
    navigation.navigate("Login");
  }

  return (
    <ScreenBackground scroll>
      <SafeAreaView style={styles.container}>
        <View style={styles.conteudo}>
          <Formulario tipo="cadastro" onSwitch={onLogin} onSubmit={onLogin} urlAPI={API_URL} />
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
  },
});
