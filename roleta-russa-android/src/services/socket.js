// src/services/socket.js
//
// Porta de roleta-russa-frontend/src/services/socket.js. Mesma ideia:
// conexão única (singleton) com o backend Node (multiplayer), criada só
// quando a pessoa realmente entra na tela de Multiplayer (`autoConnect:
// false` + conectarSocket() chamado explicitamente no useEffect da tela).
//
// socket.io-client funciona em React Native sem configuração extra - usa
// o WebSocket global que o próprio RN já expõe, com fallback pra
// long-polling via XHR (também disponível nativamente).
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/api";

let socket = null;

/** Retorna a instância única do socket, criando-a na primeira chamada. */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function conectarSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function desconectarSocket() {
  if (socket && socket.connected) socket.disconnect();
}
