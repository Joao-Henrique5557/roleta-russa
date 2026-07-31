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
import IntroVideo from "./components/especiais/IntroVideo/IntroVideo";
import { ToastProvider, useToast } from "./context/ToastContext";
import { MusicPlayerProvider } from "./context/MusicPlayerContext";
import { desconectarSocket } from "./services/socket";
import { isDesktopDevice } from "./utils/device";

// Fica dentro do ToastProvider pra poder usar o hook useToast.
function AppContent() {
  const [view, setView] = useState("login");
  const [returnView, setReturnView] = useState("login");
  const [urlAPI] = useState(
    import.meta.env.VITE_API_URL || "http://localhost:8080",
  );
  const [salaAtual, setSalaAtual] = useState(null);
  const [nomeNaSala, setNomeNaSala] = useState("");
  // Controla a intro como OVERLAY, não como troca de "view". Assim a Home
  // (e o Ranking/Novidades dentro dela) continuam montados por baixo do
  // vídeo, sem refazer as chamadas à API toda vez que a intro abre/fecha.
  const [introAberta, setIntroAberta] = useState(false);
  const { showToast } = useToast();

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

  // Botão "Créditos" na Home. Só abre o overlay - não navega pra lugar
  // nenhum, então a Home embaixo nunca desmonta.
  const onCredits = () => {
    if (!isDesktopDevice()) {
      showToast("Os créditos em vídeo estão disponíveis apenas no PC.", "info");
      return;
    }
    setIntroAberta(true);
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
          onCredits={onCredits}
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

      {/* Overlay independente da "view" atual - fica por cima sem desmontar
          o que está embaixo (evita refazer fetch de Ranking/Novidades). */}
      {introAberta && (
        <IntroVideo
          src="/video/Intro/intro.mp4"
          onFinish={() => setIntroAberta(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <MusicPlayerProvider>
          <AppContent />
        </MusicPlayerProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
