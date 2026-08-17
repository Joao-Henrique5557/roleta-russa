// src/game/engine.js
//
// Motor puro do jogo (tambor/balas/turnos), compartilhado entre o
// Singleplayer e o Multiplayer - igual ao web, onde SingleplayerGame.jsx e
// MultiplayerRoom.jsx têm cada um a sua cópia de gerarBalas/estadoInicial/
// recarregar/atirar, byte-a-byte idênticas (só o nome de quem aparece no
// log muda: "Você"/"Bot" vs "Anfitrião"/"Visitante"). Aqui as duas cópias
// foram consolidadas numa só, parametrizando os nomes de exibição - a
// regra do jogo em si é exatamente a mesma dos dois lados.
//
// Sem efeitos sonoros aqui (o web toca sons a cada tiro/recarga via
// useSoundEffect; o app Android ainda não tem os arquivos de áudio
// portados - veja README).
"use strict";

import {
  sortearItens,
  somarInventarios,
  usarItem as aplicarUsoDeItemBase,
  resolverPulosDeVez,
} from "./powerUps";

export const NOMES_SINGLEPLAYER = { jogador: "Você", bot: "Bot" };
export const NOMES_MULTIPLAYER = { jogador: "Anfitrião", bot: "Visitante" };

export function gerarBalas(dificuldade) {
  let quantBalas = Math.floor(Math.random() * 5) + 2; // 2–6
  let quantVerdadeiras;

  if (dificuldade === "facil") {
    quantVerdadeiras = 1;
    if (quantBalas >= 3) quantBalas = 3;
  } else if (dificuldade === "medio") {
    quantVerdadeiras = 2;
    if (quantBalas <= 4 && quantBalas < 6) quantBalas += 1;
  } else {
    quantVerdadeiras = 3;
    if (quantBalas <= 3 && quantBalas < 6) quantBalas += 1;
  }

  const balas = new Array(quantBalas).fill(false);
  let colocadas = 0;
  while (colocadas < quantVerdadeiras) {
    const pos = Math.floor(Math.random() * quantBalas);
    if (!balas[pos]) {
      balas[pos] = true;
      colocadas++;
    }
  }
  return { balas, quantVerdadeiras };
}

function ladoInicial() {
  return {
    vidas: 3,
    maxVidas: 3,
    alive: true,
    itens: sortearItens(1),
    serraAtiva: false,
    pulaProximaVez: false,
  };
}

export function estadoInicial(dificuldade) {
  const { balas, quantVerdadeiras } = gerarBalas(dificuldade);
  return {
    fase: "jogando",
    dificuldade,
    rodada: 1,
    vezDe: "jogador",
    jogador: ladoInicial(),
    bot: ladoInicial(),
    balas,
    posAtual: 0,
    quantVerdadeiras,
    balaRevelada: null,
    log: [`🔫 Rodada 1 iniciada — ${balas.length} câmaras, ${quantVerdadeiras} bala(s) real(is).`],
    esperandoBot: false,
  };
}

export function recarregar(estado) {
  const { balas, quantVerdadeiras } = gerarBalas(estado.dificuldade);
  const itensGanhosJogador = sortearItens(1 + Math.round(Math.random()));
  const itensGanhosBot = sortearItens(1 + Math.round(Math.random()));

  return {
    ...estado,
    balas,
    posAtual: 0,
    quantVerdadeiras,
    balaRevelada: null,
    rodada: estado.rodada + 1,
    jogador: {
      ...estado.jogador,
      itens: somarInventarios(estado.jogador.itens, itensGanhosJogador),
    },
    bot: {
      ...estado.bot,
      itens: somarInventarios(estado.bot.itens, itensGanhosBot),
    },
    log: [
      ...estado.log,
      `🔁 Revólver recarregado — Rodada ${estado.rodada + 1} | ${balas.length} câmaras, ${quantVerdadeiras} bala(s) real(is).`,
      "🎁 Novos itens distribuídos para os dois lados.",
    ],
  };
}

/**
 * @param {object} estado
 * @param {"self"|"opponent"} alvo
 * @param {{jogador:string, bot:string}} nomes - textos usados no log
 *        (NOMES_SINGLEPLAYER ou NOMES_MULTIPLAYER)
 */
export function atirar(estado, alvo, nomes = NOMES_SINGLEPLAYER) {
  const { balas, posAtual } = estado;
  const isVerdadeira = balas[posAtual];
  const novoPos = posAtual + 1;

  let novoJogador = { ...estado.jogador };
  let novoBot = { ...estado.bot };
  let logEntry;
  let mudaVez;

  const atirador = estado.vezDe === "jogador" ? novoJogador : novoBot;
  const nomeDe = (lado) => (lado === "jogador" ? nomes.jogador : nomes.bot);

  if (alvo === "self") {
    const quemAtira = nomeDe(estado.vezDe);
    if (isVerdadeira) {
      logEntry = `💥 ${quemAtira} atirou em si mesmo — bala REAL! -1 vida. Mantém a vez.`;
      if (estado.vezDe === "jogador") novoJogador.vidas -= 1;
      else novoBot.vidas -= 1;
      mudaVez = false;
    } else {
      logEntry = `💨 ${quemAtira} atirou em si mesmo — bala falsa. Mantém a vez.`;
      mudaVez = false;
    }
  } else {
    const quemAtira = nomeDe(estado.vezDe);
    const fraseAlvo = estado.vezDe === "jogador" ? `em ${nomes.bot}` : `em ${nomes.jogador}`;

    if (isVerdadeira) {
      const dano = atirador.serraAtiva ? 2 : 1;
      const sufixoSerra = atirador.serraAtiva ? " (🪚 dano dobrado!)" : "";
      logEntry = `💥 ${quemAtira} atirou ${fraseAlvo} — bala REAL! -${dano} vida.${sufixoSerra}`;
      if (estado.vezDe === "jogador") {
        novoBot.vidas -= dano;
        novoJogador = { ...novoJogador, serraAtiva: false };
      } else {
        novoJogador.vidas -= dano;
        novoBot = { ...novoBot, serraAtiva: false };
      }
    } else {
      logEntry = `💨 ${quemAtira} atirou ${fraseAlvo} — bala falsa.`;
    }
    mudaVez = true;
  }

  if (novoJogador.vidas <= 0) novoJogador.alive = false;
  if (novoBot.vidas <= 0) novoBot.alive = false;

  const candidatoProximaVez = mudaVez ? (estado.vezDe === "jogador" ? "bot" : "jogador") : estado.vezDe;
  const {
    vezDe: vezDeFinal,
    jogador: jogadorAposPulo,
    bot: botAposPulo,
    logExtra,
  } = resolverPulosDeVez({ jogador: novoJogador, bot: novoBot }, estado.vezDe, candidatoProximaVez);
  if (jogadorAposPulo) novoJogador = jogadorAposPulo;
  if (botAposPulo) novoBot = botAposPulo;

  let novoEstado = {
    ...estado,
    jogador: novoJogador,
    bot: novoBot,
    posAtual: novoPos,
    balaRevelada: null,
    log: logExtra ? [...estado.log, logEntry, logExtra] : [...estado.log, logEntry],
    vezDe: vezDeFinal,
  };

  if (!novoJogador.alive || !novoBot.alive) {
    return { ...novoEstado, fase: "resultado" };
  }

  if (novoPos >= balas.length) {
    novoEstado = recarregar(novoEstado);
  }

  return novoEstado;
}

export const usarItem = aplicarUsoDeItemBase;
export { ITENS } from "./powerUps";
