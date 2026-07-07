import styles from "./Formulario.module.css";
import Input from "../Imput/Input";
import BtnAzul from "../../BTNs/BtnAzul/BtnAzul";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/apiError";

function Formulario({ tipo, onSwitch, onSubmit, urlAPI }) {
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const usuarioRef = useRef(null);
  const emailRef = useRef(null);
  const senhaRef = useRef(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  function isOk() {
    if (!usuario) {
      usuarioRef.current?.focus();
      setError("Preencha o campo usuário.");
      return false;
    }
    if (tipo === "cadastro" && !email) {
      emailRef.current?.focus();
      setError("Preencha o campo e-mail.");
      return false;
    }
    if (!senha) {
      senhaRef.current?.focus();
      setError("Preencha o campo senha.");
      return false;
    }
    return true;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Limpa erros anteriores antes de tentar novamente
    if (!isOk()) return;

    setLoading(true);

    if (tipo === "cadastro") {
      // --- FLUXO DE CADASTRO ---
      try {
        const paramsCadastro = new URLSearchParams();
        paramsCadastro.append("nome", usuario);
        paramsCadastro.append("email", email);
        paramsCadastro.append("senha", senha);

        const response = await axios.post(
          `${urlAPI}/CadastrarServlet`,
          paramsCadastro,
          { timeout: 5000 },
        );

        if (response.status === 200 || response.status === 201) {
          showToast("Cadastro realizado com sucesso!", "success");
          onSwitch();
        }
      } catch (error) {
        // Antes: alert() bloqueante + mensagens genéricas fixas.
        // Agora: mensagem específica pro status (ex: 409 = e-mail em uso,
        // ERR_NETWORK = backend fora do ar) num toast não-bloqueante.
        const mensagem = getErrorMessage(error, "Erro ao realizar cadastro. Tente novamente.");
        setError(mensagem);
        showToast(mensagem, "error");
      } finally {
        setLoading(false);
      }
    } else if (tipo === "login") {
      // --- FLUXO DE LOGIN ---
      try {
        const paramsLogin = new URLSearchParams();
        paramsLogin.append("usuario", usuario);
        paramsLogin.append("senha", senha);

        const response = await axios.post(
          `${urlAPI}/AutenticarServlet`,
          paramsLogin,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 5000,
          },
        );

        if (response.status === 200) {
          const dadosUsuarioLogado = response.data;

          if (dadosUsuarioLogado && dadosUsuarioLogado.nome) {
            showToast(`Bem-vindo de volta, ${dadosUsuarioLogado.nome}!`, "success");
            localStorage.setItem("usuario", JSON.stringify(dadosUsuarioLogado));
            onSubmit();
          } else {
            const mensagem = "Erro ao processar dados de login do servidor.";
            setError(mensagem);
            showToast(mensagem, "error");
          }
        }
      } catch (error) {
        const mensagem = getErrorMessage(error, "Erro ao conectar com o servidor.");
        setError(mensagem);
        showToast(mensagem, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem("usuario")) {
      onSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {loading && <p>Carregando...</p>}
      {!loading && error && (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      )}

      <Input
        ref={usuarioRef}
        tipoInput="text"
        placeholder="Usuário"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        name="inputUsuario"
      />

      {tipo === "cadastro" && (
        <Input
          ref={emailRef}
          tipoInput="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="inputEmail"
        />
      )}

      <Input
        ref={senhaRef}
        tipoInput="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        name="inputSenha"
      />

      <BtnAzul
        placeholder={tipo === "login" ? "Entrar" : "Cadastrar"}
        type="submit"
      />

      <p>
        {tipo === "login" ? "Não tem uma conta? " : "Já tem uma conta? "}
        <button type="button" className={styles.linkButton} onClick={onSwitch}>
          {tipo === "login" ? "Cadastre-se" : "Faça login"}
        </button>
      </p>

      <p>
        Entrar sem cadastro{" "}
        <button type="button" className={styles.linkButton} onClick={onSubmit}>
          Entrar como convidado
        </button>
      </p>
    </form>
  );
}

export default Formulario;
