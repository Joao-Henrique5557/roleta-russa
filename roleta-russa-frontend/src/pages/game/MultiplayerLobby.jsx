// src/pages/game/MultiplayerLobby.jsx
//
// Tela de lobby: lista as salas PÚBLICAS existentes (atualizada em tempo
// real via Socket.IO), permite criar uma sala nova (pública ou privada,
// com senha) e permite entrar numa sala privada sabendo o código dela.
//
// Esta tela não sabe NADA sobre a lógica do jogo em si (tambor, balas,
// itens) - isso é responsabilidade de MultiplayerRoom.jsx. Aqui é só
// "descoberta de salas", o equivalente à tela de servidores de um jogo
// estilo Among Us.
import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import styles from "./game.module.css";
import { conectarSocket, getSocket } from "../../services/socket";
import { useToast } from "../../context/ToastContext";

export default function MultiplayerLobby({ onBack, onConfig, onEntrarNaSala }) {
  const { showToast } = useToast();
  const [salas, setSalas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Formulário de criação
  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [nomeSala, setNomeSala] = useState("");
  const [privada, setPrivada] = useState(false);
  const [senhaCriar, setSenhaCriar] = useState("");
  const [meuNome, setMeuNome] = useState(() => {
    // Se a pessoa já estiver logada, usa o nome dela como sugestão.
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
      return usuario?.nome || "";
    } catch {
      return "";
    }
  });

  // Formulário de entrar numa sala privada por código
  const [codigoSala, setCodigoSala] = useState("");
  const [senhaEntrar, setSenhaEntrar] = useState("");

  useEffect(() => {
    const socket = conectarSocket();

    function aoAtualizarLobby({ salas: lista }) {
      setSalas(lista);
      setCarregando(false);
    }

    socket.on("lobby:atualizada", aoAtualizarLobby);
    socket.emit("lobby:listar", null, (resposta) => aoAtualizarLobby(resposta));

    return () => {
      socket.off("lobby:atualizada", aoAtualizarLobby);
    };
  }, []);

  const nomeValido = useCallback(() => {
    if (!meuNome.trim()) {
      showToast("Digite um nome pra você antes de continuar.", "info");
      return false;
    }
    return true;
  }, [meuNome, showToast]);

  const criarSala = useCallback(() => {
    if (!nomeValido()) return;
    if (privada && !senhaCriar.trim()) {
      showToast("Salas privadas precisam de uma senha.", "info");
      return;
    }
    const socket = getSocket();
    socket.emit(
      "lobby:criar",
      {
        nome: nomeSala.trim(),
        privada,
        senha: senhaCriar,
        nomeJogador: meuNome.trim(),
      },
      (resposta) => {
        if (resposta?.erro) return showToast(resposta.erro, "error");
        // O código (resposta.sala.id) é diferente do NOME da sala - é ele
        // que precisa ser compartilhado pra alguém entrar, principalmente
        // em sala privada (que não aparece na lista pública). O código
        // também fica visível o tempo todo no header da sala, mas esse
        // toast garante que quem acabou de criar já veja de cara.
        showToast(
          `Sala criada! Código para convidar: ${resposta.sala.id}`,
          "success",
          8000,
        );
        onEntrarNaSala(resposta.sala, meuNome.trim());
      },
    );
  }, [
    nomeSala,
    privada,
    senhaCriar,
    meuNome,
    nomeValido,
    showToast,
    onEntrarNaSala,
  ]);

  const entrarNaSala = useCallback(
    (salaId, senha, comoEspectador) => {
      if (!nomeValido()) return;
      const socket = getSocket();
      socket.emit(
        "lobby:entrar",
        { salaId, senha, nomeJogador: meuNome.trim(), comoEspectador },
        (resposta) => {
          if (resposta?.erro) return showToast(resposta.erro, "error");
          onEntrarNaSala(resposta.sala, meuNome.trim());
        },
      );
    },
    [meuNome, nomeValido, showToast, onEntrarNaSala],
  );

  return (
    <div className={styles.pagePanel}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Multiplayer</h1>
          <p>Entre em uma sala existente ou crie a sua própria partida.</p>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.secondaryButton} onClick={onConfig}>
            Configurações
          </button>
          <button className={styles.primaryButton} onClick={onBack}>
            Voltar
          </button>
        </div>
      </div>

      <div className={styles.gameCard}>
        <div className={styles.configSection}>
          <label htmlFor="meu-nome">
            Seu nome (mostrado pra outros na sala)
          </label>
          <input
            id="meu-nome"
            type="text"
            value={meuNome}
            onChange={(e) => setMeuNome(e.target.value)}
            placeholder="Ex: joao123"
            maxLength={30}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid rgba(127,127,255,0.3)",
              background: "rgba(0,0,0,0.4)",
              color: "#fff",
            }}
          />
        </div>

        <p className={styles.gameCardHeader}>Salas públicas disponíveis</p>
        {carregando && <p>Carregando salas...</p>}
        {!carregando && salas.length === 0 && (
          <p>Nenhuma sala pública aberta no momento. Crie a sua!</p>
        )}
        <div className={styles.roomList}>
          {salas.map((sala) => (
            <div key={sala.id} className={styles.roomItem}>
              <div>
                <strong>{sala.nome}</strong>
                <span>
                  Anfitrião: {sala.hostNome} · {sala.qtdJogadores}/
                  {sala.maxJogadores} jogando · {sala.qtdEspectadores}{" "}
                  assistindo
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={styles.primaryButton}
                  onClick={() => entrarNaSala(sala.id, null, false)}
                >
                  {sala.qtdJogadores >= sala.maxJogadores
                    ? "Assistir"
                    : "Jogar"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.roomFooter}>
          <p>Tem o código de uma sala privada? Entre direto aqui:</p>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Código da sala"
              value={codigoSala}
              onChange={(e) => setCodigoSala(e.target.value)}
              style={{
                padding: 8,
                borderRadius: 8,
                border: "1px solid rgba(127,127,255,0.3)",
                background: "rgba(0,0,0,0.4)",
                color: "#fff",
              }}
            />
            <input
              type="password"
              placeholder="Senha (se privada)"
              value={senhaEntrar}
              onChange={(e) => setSenhaEntrar(e.target.value)}
              style={{
                padding: 8,
                borderRadius: 8,
                border: "1px solid rgba(127,127,255,0.3)",
                background: "rgba(0,0,0,0.4)",
                color: "#fff",
              }}
            />
            <button
              className={styles.secondaryButton}
              onClick={() =>
                entrarNaSala(codigoSala.trim(), senhaEntrar, false)
              }
              disabled={!codigoSala.trim()}
            >
              Entrar
            </button>
          </div>

          {mostrarCriar ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <input
                type="text"
                placeholder="Nome da sala"
                value={nomeSala}
                onChange={(e) => setNomeSala(e.target.value)}
                autoFocus
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid rgba(127,127,255,0.3)",
                  background: "rgba(0,0,0,0.4)",
                  color: "#fff",
                }}
              />
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={privada}
                  onChange={(e) => setPrivada(e.target.checked)}
                />
                Sala privada (precisa de senha pra entrar)
              </label>
              {privada && (
                <input
                  type="password"
                  placeholder="Senha da sala"
                  value={senhaCriar}
                  onChange={(e) => setSenhaCriar(e.target.value)}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid rgba(127,127,255,0.3)",
                    background: "rgba(0,0,0,0.4)",
                    color: "#fff",
                  }}
                />
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button className={styles.primaryButton} onClick={criarSala}>
                  Criar sala
                </button>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setMostrarCriar(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ marginTop: 16 }}>
                Não encontrou uma sala? Crie a sua própria partida.
              </p>
              <button
                className={styles.primaryButton}
                onClick={() => setMostrarCriar(true)}
              >
                Criar nova sala
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

MultiplayerLobby.propTypes = {
  onBack: PropTypes.func.isRequired,
  onConfig: PropTypes.func.isRequired,
  onEntrarNaSala: PropTypes.func.isRequired,
};
