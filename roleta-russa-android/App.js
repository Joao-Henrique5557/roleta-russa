import { enableScreens } from "react-native-screens";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "./src/context/ToastContext";

import LoginScreen from "./src/screens/LoginScreen";
import CadastroScreen from "./src/screens/CadastroScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SingleplayerGameScreen from "./src/screens/SingleplayerGameScreen";
import MultiplayerLobbyScreen from "./src/screens/MultiplayerLobbyScreen";
import MultiplayerRoomScreen from "./src/screens/MultiplayerRoomScreen";
import PerfilScreen from "./src/screens/PerfilScreen";

enableScreens();

const Stack = createNativeStackNavigator();

// Navegação agora é via @react-navigation/native-stack em vez do padrão de
// estado usado antes (e ainda usado no App.jsx do frontend web). Cada tela
// recebe `navigation`/`route` automaticamente do React Navigation - não
// precisa mais repassar callbacks onX manualmente por prop daqui.
//
// Sem tela de Config por enquanto (removida a pedido - inclui o que
// dependia dela: botão de engrenagem nas telas e a música de fundo).
export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Singleplayer" component={SingleplayerGameScreen} />
            <Stack.Screen name="Multiplayer" component={MultiplayerLobbyScreen} />
            <Stack.Screen name="MultiplayerRoom" component={MultiplayerRoomScreen} />
            <Stack.Screen name="Perfil" component={PerfilScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
