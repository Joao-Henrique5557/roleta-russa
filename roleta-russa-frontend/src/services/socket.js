// src/services/socket.js
//
// Wrapper fino em cima do cliente do Socket.IO. Centralizamos a criação da
// conexão aqui por dois motivos:
//   1. Evitar abrir uma conexão WebSocket nova toda vez que um componente
//      re-renderiza (o React pode renderizar o mesmo componente várias
//      vezes - a conexão de rede não deveria acompanhar esse ritmo).
//   2. Dar um lugar único pra trocar a URL do servidor (VITE_SOCKET_URL)
//      sem precisar caçar `io(...)` espalhado pelos componentes.
//
// CONCEITO: diferente do axios (usado pro resto da API), aqui a conexão é
// "keep-alive" - fica aberta o tempo todo trocando mensagens nos dois
// sentidos (cliente -> servidor E servidor -> cliente), em vez do padrão
// requisição/resposta do HTTP tradicional.
import { io } from "socket.io-client";

let socket = null;

/**
 * Retorna a instância única (singleton) do socket, criando-a na primeira
 * chamada. `autoConnect: false` porque só queremos abrir a conexão quando
 * a pessoa realmente entrar na tela de Multiplayer - não faz sentido
 * manter WebSocket aberto enquanto ela está, por exemplo, jogando
 * singleplayer ou editando o perfil.
 */
export function getSocket() {
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
    socket = io(url, {
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
