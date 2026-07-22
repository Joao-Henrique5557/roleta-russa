import { useState } from "react";

import Home from "./pages/Home/Home";
import AutenticationLogin from "./pages/authentication/Login";
import AutenticationCadastro from "./pages/authentication/Cadastro";
import SingleplayerGame from "./pages/game/SingleplayerGame";
import MultiplayerLobby from "./pages/game/MultiplayerLobby";
import ConfigPage from "./pages/ConfigPage/ConfigPage";
import PerfilPage from "./pages/PerfilPage/PerfilPage";
import ErrorBoundary from "./components/Feedback/ErrorBoundary/ErrorBoundary";
import { ToastProvider, useToast } from "./context/ToastContext";
import { MusicPlayerProvider } from "./context/MusicPlayerContext";

// Fica dentro do ToastProvider pra poder usar o hook useToast.
function AppContent() {
  const [view, setView] = useState("login");
  const [returnView, setReturnView] = useState("login");
  const [urlAPI] = useState(
    import.meta.env.VITE_API_URL || "http://localhost:8080",
  );
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
          onCreateRoom={(room) =>
            showToast(`Sala "${room}" criada! (back-end pendente)`, "info")
          }
          onJoinRoom={(room) =>
            showToast(`Entrando na sala ${room}... (back-end pendente)`, "info")
          }
        />
      )}
      {view === "config" && (
        <ConfigPage onBack={() => navigateTo(returnView)} />
      )}
      {view === "perfil" && <PerfilPage onBack={() => navigateTo("home")} />}
    </div>
  );
}

// Componente raiz: fornece o ErrorBoundary (captura erros de renderização)
// e o ToastProvider (notificações globais) pro resto da aplicação.
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
