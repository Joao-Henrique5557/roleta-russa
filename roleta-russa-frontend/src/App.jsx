// src/App.jsx
//
// Componente raiz. Não usamos nenhuma biblioteca de rotas (tipo React
// Router) de propósito - a navegação inteira é feita trocando uma única
// variável de estado (`view`) e renderizando condicionalmente a página
// correspondente. Pra um projeto de estudo isso é mais simples de
// entender que configurar rotas "de verdade", ao custo de não ter URLs
// diferentes por tela (ex: sempre fica em "/", nunca em "/perfil").
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
import { MusicPlayerProvider } from "./context/MusicPlayerContext";
import { desconectarSocket } from "./services/socket";

// Fica dentro do ToastProvider pra poder usar o hook useToast.
function AppContent() {
  const [view, setView] = useState("login");
  const [returnView, setReturnView] = useState("login");
  const [urlAPI] = useState(
    import.meta.env.VITE_API_URL || "http://localhost:8080",
  );
  // Guarda a sala de multiplayer atual (id, nome, jogadores...) e o nome
  // escolhido pela pessoa, pra passar pra MultiplayerRoom quando ela entra.
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

  // Chamado pela MultiplayerLobby quando a pessoa cria/entra numa sala.
  const entrarNaSala = (sala, nome) => {
    setSalaAtual(sala);
    setNomeNaSala(nome);
    navigateTo("multiplayer-room");
  };

  // Sair da sala de multiplayer: fecha a conexão WebSocket (não faz
  // sentido manter ela aberta enquanto a pessoa está, por exemplo, no
  // singleplayer) e volta pra Home.
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
      {view === "estudos" && (
        <EstudosPage onBack={() => navigateTo("home")} />
      )}
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
