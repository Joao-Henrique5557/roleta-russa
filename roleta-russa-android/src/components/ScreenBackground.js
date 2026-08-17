import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const fundoImagem = require("../../assets/imagens/fundo.png");

/**
 * Fundo compartilhado por todas as telas - espelha os dois padrões de
 * background usados no CSS do frontend web:
 *
 * - "gradient": gradiente diagonal escuro (navy → roxo), usado em
 *   login.module.css (.loginContainer). É o que a página de Login/Cadastro
 *   realmente renderiza - o `background-image: url(fundo.png)` ali é
 *   sobrescrito por um `background: linear-gradient(...)` logo abaixo no
 *   CSS (cascata), então a foto de fundo nunca aparece nessas duas telas.
 * - "image": foto de fundo (`/imagens/fundo.png`) com overlay preto a 75%
 *   de opacidade por cima, usado em home.module.css, game.module.css e
 *   perfilPage.module.css (.home / .pagePanel / .perfilPage).
 */
export default function ScreenBackground({ children, scroll = false, variant = "gradient", style }) {
  const conteudo = scroll ? (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.flex}>{children}</View>
  );

  return (
    <View style={[styles.flex, style]}>
      {variant === "image" ? (
        <ImageBackground
          source={fundoImagem}
          resizeMode="cover"
          style={StyleSheet.absoluteFillObject}
        >
          <View style={styles.overlayEscuro} />
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={["rgba(10, 10, 30, 0.98)", "rgba(20, 20, 60, 0.98)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {conteudo}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  overlayEscuro: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
});
