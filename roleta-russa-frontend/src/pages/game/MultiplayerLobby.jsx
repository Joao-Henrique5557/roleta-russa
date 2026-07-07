import { useState } from "react";
import styles from "./game.module.css";

const rooms = [
  {
    id: "sala-01",
    nome: "Sala Cremosa",
    players: 1,
    max: 6,
    theme: "Vermelho",
  },
  { id: "sala-02", nome: "Sala Fumaça", players: 2, max: 6, theme: "Azul" },
  { id: "sala-03", nome: "Sala Negra", players: 3, max: 6, theme: "Preto" },
];

export default function MultiplayerLobby({
  onBack,
  onConfig,
  onCreateRoom,
  onJoinRoom,
}) {
  const [criando, setCriando] = useState(false);
  const [nomeSala, setNomeSala] = useState("");

  const handleCriar = () => {
    if (!nomeSala.trim()) return;
    onCreateRoom(nomeSala.trim());
    setCriando(false);
    setNomeSala("");
  };

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
        <p className={styles.gameCardHeader}>Salas disponíveis</p>
        <div className={styles.roomList}>
          {rooms.map((room) => (
            <div key={room.id} className={styles.roomItem}>
              <div>
                <strong>{room.nome}</strong>
                <span>
                  {room.players}/{room.max} jogadores · {room.theme}
                </span>
              </div>
              <button
                className={styles.primaryButton}
                onClick={() => onJoinRoom(room.nome)}
                disabled={room.players >= room.max}
              >
                {room.players >= room.max ? "Cheia" : "Entrar"}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.roomFooter}>
          {criando ? (
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="Nome da sala"
                value={nomeSala}
                onChange={(e) => setNomeSala(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCriar()}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(127,127,255,0.3)",
                  background: "rgba(0,0,0,0.4)",
                  color: "#fff",
                  fontSize: 15,
                }}
                autoFocus
              />
              <button className={styles.primaryButton} onClick={handleCriar}>
                Criar
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => setCriando(false)}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <p>Não encontrou uma sala? Crie a sua própria partida.</p>
              <button
                className={styles.primaryButton}
                onClick={() => setCriando(true)}
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
