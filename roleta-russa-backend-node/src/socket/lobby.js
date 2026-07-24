// src/socket/lobby.js
//
// Servidor de "lobby" multiplayer, usando Socket.IO (WebSocket com fallback
// automático pra long-polling). É aqui que vive o conceito de SALAS.
//
// ------------------------------------------------------------------
// CONCEITO: por que isso não é um servidor P2P "de verdade" tipo Among Us?
// ------------------------------------------------------------------
// A ideia original era "o PC de quem cria a sala vira o servidor". Na
// prática, um navegador comum não consegue abrir uma porta TCP/UDP
// acessível pela internet (não tem IP público, tem firewall/NAT no meio,
// etc.) - é exatamente por isso que jogos como Among Us, apesar de
// dizerem "region host", na verdade usam um SERVIDOR RELAY (um servidor
// de verdade, ligado 24/7, que fica repassando mensagens entre os
// jogadores). O "host" nesses jogos não abre porta nenhuma: ele só é
// tratado como a fonte de verdade da simulação, e todo mundo (inclusive
// ele) fala através do relay.
//
// Este arquivo implementa exatamente esse modelo:
//   - O `host` (quem criou a sala) roda a MESMA lógica de jogo usada no
//     singleplayer (veja src/game/rouletteEngine.js no front-end) só que
//     no lado dele, e manda pro servidor o estado resultante depois de
//     cada jogada ("room:hostState").
//   - O outro jogador manda só a INTENÇÃO da jogada ("room:playerAction",
//     ex: "atirar-oponente"), o servidor repassa pro host, o host calcula
//     o novo estado e o servidor distribui esse estado pra sala inteira
//     (jogadores + espectadores).
//   - O servidor Node, portanto, nunca entende as regras do jogo - ele só
//     conhece "salas", "quem está em cada uma" e "repassa mensagem de A
//     pra B". Isso é bem mais simples de implementar que um servidor
//     autoritativo completo, mas tem uma limitação importante pra quem
//     está estudando o código: como o host manda o estado já pronto, um
//     host mal-intencionado poderia trapacear (mandar um estado fabricado).
//     Pra um jogo de estudo local isso é aceitável; num jogo de produção
//     de verdade, o ideal seria o SERVIDOR calcular as regras (autoridade
//     de servidor), não o cliente.
// ------------------------------------------------------------------
"use strict";

const { randomUUID } = require("crypto");
const passwordUtil = require("../utils/passwordUtil");

/** @type {Map<string, Sala>} salas em memória, por id. Zera se o processo reiniciar. */
const salas = new Map();

const MAX_JOGADORES = 2; // só duas pessoas jogam por vez; o resto assiste
const MAX_CHAT_HISTORICO = 100;

/**
 * @typedef {Object} Participante
 * @property {string} socketId
 * @property {string} nome
 */

/**
 * @typedef {Object} Sala
 * @property {string} id
 * @property {string} nome
 * @property {boolean} privada
 * @property {string|null} senhaHash
 * @property {string} hostSocketId
 * @property {Participante[]} jogadores  (máx. 2 - hostSocketId é sempre jogadores[0] enquanto ele estiver na sala)
 * @property {Participante[]} espectadores
 * @property {{autor:string, texto:string, hora:string}[]} chat
 * @property {any} ultimoEstadoJogo  último estado de jogo enviado pelo host (opaco pro servidor)
 * @property {number} criadoEm
 */

function resumoPublico(sala) {
  return {
    id: sala.id,
    nome: sala.nome,
    privada: sala.privada,
    qtdJogadores: sala.jogadores.length,
    maxJogadores: MAX_JOGADORES,
    qtdEspectadores: sala.espectadores.length,
    hostNome: sala.jogadores[0] ? sala.jogadores[0].nome : "(sem host)",
  };
}

function estadoCompletoSala(sala) {
  return {
    id: sala.id,
    nome: sala.nome,
    privada: sala.privada,
    jogadores: sala.jogadores.map((p) => ({ nome: p.nome, socketId: p.socketId })),
    espectadores: sala.espectadores.map((p) => ({ nome: p.nome, socketId: p.socketId })),
    hostSocketId: sala.hostSocketId,
    ultimoEstadoJogo: sala.ultimoEstadoJogo,
  };
}

function listarSalasPublicas() {
  return Array.from(salas.values())
    .filter((s) => !s.privada)
    .map(resumoPublico);
}

/**
 * Liga o gerenciador de salas numa instância do Socket.IO.
 * Chamado a partir de bin/www, depois do servidor HTTP ser criado.
 * @param {import('socket.io').Server} io
 */
function attachLobby(io) {
  io.on("connection", (socket) => {
    // Cada socket guarda em qual sala está e se é jogador ou espectador -
    // evita ter que varrer todas as salas toda hora pra descobrir isso.
    socket.data.salaId = null;
    socket.data.papel = null; // "jogador" | "espectador"

    // ---- LISTAGEM ----
    socket.on("lobby:listar", (_payload, ack) => {
      if (typeof ack === "function") ack({ salas: listarSalasPublicas() });
    });

    // ---- CRIAR SALA ----
    // payload: { nome, privada, senha, nomeJogador }
    socket.on("lobby:criar", (payload, ack) => {
      const responder = typeof ack === "function" ? ack : () => {};
      const nomeSala = String(payload?.nome || "").trim().slice(0, 40) || `Sala de ${payload?.nomeJogador || "alguém"}`;
      const nomeJogador = String(payload?.nomeJogador || "Jogador").trim().slice(0, 30) || "Jogador";
      const privada = !!payload?.privada;
      const senha = payload?.senha ? String(payload.senha) : null;

      if (privada && !senha) {
        return responder({ erro: "Salas privadas precisam de uma senha." });
      }

      /** @type {Sala} */
      const sala = {
        id: randomUUID().slice(0, 8),
        nome: nomeSala,
        privada,
        senhaHash: senha ? passwordUtil.hash(senha) : null,
        hostSocketId: socket.id,
        jogadores: [{ socketId: socket.id, nome: nomeJogador }],
        espectadores: [],
        chat: [],
        ultimoEstadoJogo: null,
        criadoEm: Date.now(),
      };
      salas.set(sala.id, sala);

      socket.join(sala.id);
      socket.data.salaId = sala.id;
      socket.data.papel = "jogador";

      responder({ sala: estadoCompletoSala(sala) });
      io.emit("lobby:atualizada", { salas: listarSalasPublicas() });
    });

    // ---- ENTRAR EM SALA ----
    // payload: { salaId, senha, nomeJogador, comoEspectador }
    socket.on("lobby:entrar", (payload, ack) => {
      const responder = typeof ack === "function" ? ack : () => {};
      const sala = salas.get(payload?.salaId);
      if (!sala) return responder({ erro: "Sala não encontrada (pode já ter fechado)." });

      if (sala.privada) {
        const senhaOk = payload?.senha && passwordUtil.matches(payload.senha, sala.senhaHash);
        if (!senhaOk) return responder({ erro: "Senha incorreta." });
      }

      const nomeJogador = String(payload?.nomeJogador || "Visitante").trim().slice(0, 30) || "Visitante";
      const participante = { socketId: socket.id, nome: nomeJogador };

      const querJogar = !payload?.comoEspectador;
      const temVagaDeJogador = sala.jogadores.length < MAX_JOGADORES;

      if (querJogar && temVagaDeJogador) {
        sala.jogadores.push(participante);
        socket.data.papel = "jogador";
      } else {
        sala.espectadores.push(participante);
        socket.data.papel = "espectador";
      }

      socket.join(sala.id);
      socket.data.salaId = sala.id;

      responder({ sala: estadoCompletoSala(sala), papel: socket.data.papel });
      io.to(sala.id).emit("room:atualizada", estadoCompletoSala(sala));
      io.to(sala.id).emit("room:chat", {
        autor: "sistema",
        texto: `${nomeJogador} entrou na sala (${socket.data.papel === "jogador" ? "jogando" : "assistindo"}).`,
        hora: new Date().toISOString(),
      });
      io.emit("lobby:atualizada", { salas: listarSalasPublicas() });
    });

    // ---- CHAT DA SALA ----
    // payload: { texto }
    socket.on("room:chat", (payload) => {
      const sala = salas.get(socket.data.salaId);
      if (!sala) return;
      const texto = String(payload?.texto || "").trim().slice(0, 300);
      if (!texto) return;

      const participante =
        sala.jogadores.find((p) => p.socketId === socket.id) ||
        sala.espectadores.find((p) => p.socketId === socket.id);

      const msg = {
        autor: participante ? participante.nome : "desconhecido",
        texto,
        hora: new Date().toISOString(),
      };
      sala.chat.push(msg);
      if (sala.chat.length > MAX_CHAT_HISTORICO) sala.chat.shift();

      io.to(sala.id).emit("room:chat", msg);
    });

    // ---- ESTADO DO JOGO (só o HOST manda) ----
    // payload: { estado }  -> o "estado" é opaco pro servidor: quem entende
    // o formato é o front-end (veja src/game/rouletteEngine.js).
    socket.on("room:hostState", (payload) => {
      const sala = salas.get(socket.data.salaId);
      if (!sala || sala.hostSocketId !== socket.id) return; // só o host pode publicar estado
      sala.ultimoEstadoJogo = payload?.estado ?? null;
      socket.to(sala.id).emit("room:estadoJogo", sala.ultimoEstadoJogo);
    });

    // ---- AÇÃO DO JOGADOR NÃO-HOST (repassa pro host decidir) ----
    // payload: { acao, dados }
    socket.on("room:playerAction", (payload) => {
      const sala = salas.get(socket.data.salaId);
      if (!sala) return;
      if (socket.id === sala.hostSocketId) return; // o host já sabe o que ele mesmo fez
      io.to(sala.hostSocketId).emit("room:playerAction", {
        deSocketId: socket.id,
        acao: payload?.acao,
        dados: payload?.dados,
      });
    });

    // ---- SAIR DA SALA (voluntário) ----
    socket.on("room:sair", () => {
      sairDaSalaAtual(io, socket);
    });

    socket.on("disconnect", () => {
      sairDaSalaAtual(io, socket);
    });
  });
}

/** Remove o socket da sala em que ele estiver, migrando o host se preciso. */
function sairDaSalaAtual(io, socket) {
  const salaId = socket.data.salaId;
  if (!salaId) return;
  const sala = salas.get(salaId);
  if (!sala) return;

  sala.jogadores = sala.jogadores.filter((p) => p.socketId !== socket.id);
  sala.espectadores = sala.espectadores.filter((p) => p.socketId !== socket.id);
  socket.leave(salaId);
  socket.data.salaId = null;
  socket.data.papel = null;

  if (sala.jogadores.length === 0 && sala.espectadores.length === 0) {
    // Sala vazia -> remove de memória.
    salas.delete(salaId);
  } else {
    // Migração de host: se quem saiu era o host, o próximo jogador (ou,
    // na falta de um, o primeiro espectador promovido) assume.
    if (sala.hostSocketId === socket.id) {
      if (sala.jogadores[0]) {
        sala.hostSocketId = sala.jogadores[0].socketId;
      } else if (sala.espectadores[0]) {
        const novoHost = sala.espectadores.shift();
        sala.jogadores.push(novoHost);
        sala.hostSocketId = novoHost.socketId;
      }
    }
    io.to(salaId).emit("room:atualizada", estadoCompletoSala(sala));
  }

  io.emit("lobby:atualizada", { salas: listarSalasPublicas() });
}

module.exports = { attachLobby, listarSalasPublicas };
