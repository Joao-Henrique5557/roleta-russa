import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InputField from "./InputField";
import { PrimaryButton, LinkButton } from "./Buttons";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/apiError";
import { colors, radius, spacing } from "../constants/theme";

/**
 * Porta de roleta-russa-frontend/src/components/data/Formulario/Formulario.jsx.
 * Mantém a mesma lógica de validação e as mesmas rotas do backend
 * (CadastrarServlet / AutenticarServlet), só trocando localStorage por
 * AsyncStorage.
 */
export default function Formulario({ tipo, onSwitch, onSubmit, urlAPI }) {
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const senhaRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    let ativo = true;
    AsyncStorage.getItem("usuario").then((valor) => {
      if (ativo && valor) onSubmit();
    });
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isOk() {
    if (!usuario) {
      setError("Preencha o campo usuário.");
      return false;
    }
    if (tipo === "cadastro" && !email) {
      setError("Preencha o campo e-mail.");
      return false;
    }
    if (!senha) {
      setError("Preencha o campo senha.");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    setError(null);
    if (!isOk()) return;
    setLoading(true);

    if (tipo === "cadastro") {
      try {
        const params = new URLSearchParams();
        params.append("nome", usuario);
        params.append("email", email);
        params.append("senha", senha);

        const response = await axios.post(`${urlAPI}/CadastrarServlet`, params.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 5000,
        });

        if (response.status === 200 || response.status === 201) {
          showToast("Cadastro realizado com sucesso!", "success");
          onSwitch();
        }
      } catch (err) {
        const mensagem = getErrorMessage(err, "Erro ao realizar cadastro. Tente novamente.");
        setError(mensagem);
        showToast(mensagem, "error");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const params = new URLSearchParams();
        params.append("usuario", usuario);
        params.append("senha", senha);

        const response = await axios.post(`${urlAPI}/AutenticarServlet`, params.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 5000,
        });

        if (response.status === 200) {
          const dadosUsuarioLogado = response.data;
          if (dadosUsuarioLogado && dadosUsuarioLogado.nome) {
            showToast(`Bem-vindo de volta, ${dadosUsuarioLogado.nome}!`, "success");
            await AsyncStorage.setItem("usuario", JSON.stringify(dadosUsuarioLogado));
            onSubmit();
          } else {
            const mensagem = "Erro ao processar dados de login do servidor.";
            setError(mensagem);
            showToast(mensagem, "error");
          }
        }
      } catch (err) {
        const mensagem = getErrorMessage(err, "Erro ao conectar com o servidor.");
        setError(mensagem);
        showToast(mensagem, "error");
      } finally {
        setLoading(false);
      }
    }
  }

  async function entrarComoConvidado() {
    onSubmit();
  }

  return (
    <View style={styles.form}>
      {loading && <ActivityIndicator color={colors.primary} />}
      {!loading && error && <Text style={styles.errorText}>{error}</Text>}

      <InputField placeholder="Usuário" value={usuario} onChangeText={setUsuario} />

      {tipo === "cadastro" && (
        <InputField
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      )}

      <InputField
        ref={senhaRef}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <PrimaryButton
        title={tipo === "login" ? "Entrar" : "Cadastrar"}
        onPress={handleSubmit}
        disabled={loading}
      />

      <View style={styles.linhaAlternar}>
        <Text style={styles.textoNeutro}>
          {tipo === "login" ? "Não tem uma conta? " : "Já tem uma conta? "}
        </Text>
        <LinkButton title={tipo === "login" ? "Cadastre-se" : "Faça login"} onPress={onSwitch} />
      </View>

      <View style={styles.linhaAlternar}>
        <Text style={styles.textoNeutro}>Entrar sem cadastro </Text>
        <LinkButton title="Entrar como convidado" onPress={entrarComoConvidado} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    maxWidth: 400,
    padding: spacing.xl,
    backgroundColor: "#ffffff",
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  errorText: {
    fontSize: 14,
    color: "#c0392b",
    backgroundColor: "rgba(192, 57, 43, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(192, 57, 43, 0.25)",
    borderRadius: radius.sm,
    padding: spacing.sm,
    textAlign: "center",
  },
  linhaAlternar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  textoNeutro: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
