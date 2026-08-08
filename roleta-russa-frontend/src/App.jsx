// src/App.jsx
import { useState } from "react";

import Home from "./pages/Home/Home";
import AutenticationLogin from "./pages/authentication/Login";
import AutenticationCadastro from "./pages/authentication/Cadastro";
import SingleplayerGame from "./pages/game/SingleplayerGame";
import MultiplayerLobby from "./pages/game/MultiplayerLobby";
import MultiplayerRoom from "./pages/game/MultiplayerRoom";
import ConfigPage from "./pages/ConfigPage/ConfigPage";
import PerfilPage from "./pages/PerfilPage/PerfilPage";
import EstudosPage from "./pages/EstudosPage/EstudosPage";
import ErrorBoundary from "./components/Feedback/ErrorBoundary/ErrorBoundary";
import { ToastProvider } from "./context/ToastContext";
import { desconectarSocket } from "./services/socket";

function AppContent() {
  const [view, setView] = useState("login");
  const [returnView, setReturnView] = useState("login");
  const [urlAPI] = useState(
    import.meta.env.VITE_API_URL || "http://localhost:8080",
  );
  const [salaAtual, setSalaAtual] = useState(null);
  const [nomeNaSala, setNomeNaSala] = useState("");

  const openConfig = (nextView) => {
    setReturnView(nextView ?? view);
    setView("config");
  };

  const navigateTo = (target) => {
    setView(target);
    if (target !== "config") setReturnView(target);
  };

  const onLogout = () => {
    localStorage.removeItem("usuario");
    navigateTo("login");
  };

  const onPerfil = () => {
    if (!localStorage.getItem("usuario")) {
      alert("Você precisa estar logado para acessar o perfil.");
    } else {
      navigateTo("perfil");
    }
  };

  const entrarNaSala = (sala, nome) => {
    setSalaAtual(sala);
    setNomeNaSala(nome);
    navigateTo("multiplayer-room");
  };

  const sairDoMultiplayer = () => {
    desconectarSocket();
    setSalaAtual(null);
    navigateTo("home");
  };

  return (
    <div className="app-shell">
      {view === "login" && (
        <AutenticationLogin
          onConfig={() => openConfig("login")}
          onSignup={() => navigateTo("signup")}
          onHome={() => navigateTo("home")}
          urlAPI={urlAPI}
          setReturnView={setReturnView}
        />
      )}
      {view === "signup" && (
        <AutenticationCadastro
          onConfig={() => openConfig("signup")}
          onLogin={() => navigateTo("login")}
          urlAPI={urlAPI}
        />
      )}
      {view === "home" && (
        <Home
          onConfig={() => openConfig("home")}
          onSingleplayer={() => navigateTo("singleplayer")}
          onMultiplayer={() => navigateTo("multiplayer")}
          onEstudos={() => navigateTo("estudos")}
          onLogout={() => onLogout()}
          urlAPI={urlAPI}
          onPerfil={onPerfil}
        />
      )}
      {view === "singleplayer" && (
        <SingleplayerGame
          onBack={() => navigateTo("home")}
          onConfig={() => openConfig("singleplayer")}
          urlAPI={urlAPI}
        />
      )}
      {view === "multiplayer" && (
        <MultiplayerLobby
          onBack={() => navigateTo("home")}
          onConfig={() => openConfig("multiplayer")}
          onEntrarNaSala={entrarNaSala}
        />
      )}
      {view === "multiplayer-room" && salaAtual && (
        <MultiplayerRoom
          onBack={sairDoMultiplayer}
          onConfig={() => openConfig("multiplayer-room")}
          urlAPI={urlAPI}
          salaInicial={salaAtual}
          meuNome={nomeNaSala}
        />
      )}
      {view === "config" && (
        <ConfigPage onBack={() => navigateTo(returnView)} />
      )}
      {view === "perfil" && (
        <PerfilPage onBack={() => navigateTo("home")} urlAPI={urlAPI} />
      )}
      {view === "estudos" && <EstudosPage onBack={() => navigateTo("home")} />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
