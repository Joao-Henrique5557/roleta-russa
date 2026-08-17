// src/game/powerUps.js
//
// Sistema de "itens"/power-ups do jogo, inspirado no jogo original que deu
// origem a essa mecânica de roleta-russa com tambor variável: Buckshot
// Roulette (cigarro, serrote, algemas, lupa, cerveja...). Aqui a gente
// reimplementa a IDEIA com nomes e regras próprias - não copia arte nem
// texto do jogo original, só o conceito de "cada rodada você ganha itens
// aleatórios que mudam sua estratégia".
//
// Este arquivo é usado tanto pelo Singleplayer (SingleplayerGame.jsx,
// direto) quanto pelo Multiplayer (só no lado do HOST, dentro de
// MultiplayerRoom.jsx - veja o comentário sobre "host-autoritativo" em
// roleta-russa-backend-node/src/socket/lobby.js) - é por isso que a lógica
// vive num arquivo separado dos componentes React: assim os dois modos de
// jogo reaproveitam exatamente a mesma regra, sem duplicar código.
//
// CONCEITO DE JAVASCRIPT usado aqui: imutabilidade. Toda função devolve um
// estado NOVO (spread `{ ...coisa }`) em vez de alterar o objeto recebido
// por parâmetro. É o mesmo princípio que o React usa pra saber quando
// re-renderizar (comparação de referência) - se a gente mutasse o objeto
// direto, o React poderia não perceber a mudança.
"use strict";

/**
 * Catálogo de itens disponíveis. `id` é a chave usada no inventário
 * (`estado.jogador.itens[id]`); `usaTurno` indica se usar o item consome a
 * vez do jogador (a maioria não consome - é isso que torna a rodada mais
 * estratégica, dá pra usar vários itens antes de atirar).
 */
export const ITENS = {
  cigarro: {
    id: "cigarro",
    nome: "Cigarro",
    icone: "🚬",
    descricao: "Recupera 1 vida (não passa do máximo).",
    usaTurno: false,
  },
  algemas: {
    id: "algemas",
    nome: "Algemas",
    icone: "🔗",
    descricao: "O oponente perde a próxima vez dele.",
    usaTurno: false,
  },
  lupa: {
    id: "lupa",
    nome: "Lupa",
    icone: "🔍",
    descricao: "Revela se a bala atual da câmara é real ou falsa.",
    usaTurno: false,
  },
  cerveja: {
    id: "cerveja",
    nome: "Cerveja",
    icone: "🍺",
    descricao: "Ejeta a bala da câmara atual sem atirar (avança o tambor).",
    usaTurno: false,
  },
  serra: {
    id: "serra",
    nome: "Serrote",
    icone: "🪚",
    descricao: "O seu próximo tiro certeiro no oponente causa dano dobrado.",
    usaTurno: false,
  },
};

const IDS_ITENS = Object.keys(ITENS);

/** Cria um inventário vazio: { cigarro: 0, algemas: 0, ... }. */
export function inventarioVazio() {
  return Object.fromEntries(IDS_ITENS.map((id) => [id, 0]));
}

/**
 * Sorteia `quantidade` itens aleatórios (com repetição) e devolve um
 * inventário parcial pra somar ao existente. Chamado a cada recarga do
 * revólver, imitando o jogo original (você ganha itens novos a cada
 * rodada).
 */
export function sortearItens(quantidade = 2) {
  const ganhos = inventarioVazio();
  for (let i = 0; i < quantidade; i++) {
    const id = IDS_ITENS[Math.floor(Math.random() * IDS_ITENS.length)];
    ganhos[id] += 1;
  }
  return ganhos;
}

/** Soma dois inventários (usado ao conceder itens novos numa recarga). */
export function somarInventarios(a, b) {
  const total = { ...a };
  for (const id of IDS_ITENS) {
    total[id] = (a[id] || 0) + (b[id] || 0);
  }
  return total;
}

/**
 * Aplica o uso de um item ao estado do jogo. Não sabe nada sobre React -
 * é lógica pura, fácil de testar e de reaproveitar no host do multiplayer.
 *
 * @param {object} estado       estado atual do jogo (mesmo formato usado em SingleplayerGame)
 * @param {"jogador"|"bot"} quem quem está usando o item (no multiplayer, os nomes dos lados podem ser outros - veja MultiplayerRoom)
 * @param {string} itemId       uma das chaves de ITENS
 * @returns {{estado: object, sucesso: boolean, mensagem: string}}
 */
export function usarItem(estado, quem, itemId) {
  const item = ITENS[itemId];
  if (!item) {
    return { estado, sucesso: false, mensagem: "Item desconhecido." };
  }

  const outro = quem === "jogador" ? "bot" : "jogador";
  const dono = estado[quem];
  const alvo = estado[outro];

  if (!dono || (dono.itens?.[itemId] || 0) <= 0) {
    return { estado, sucesso: false, mensagem: "Você não tem esse item." };
  }

  const donoNomeExibicao = quem === "jogador" ? "Você" : "Bot";
  const novoInventario = { ...dono.itens, [itemId]: dono.itens[itemId] - 1 };

  switch (itemId) {
    case "cigarro": {
      const maxVidas = dono.maxVidas ?? 3;
      const novaVida = Math.min(dono.vidas + 1, maxVidas);
      const novoDono = { ...dono, itens: novoInventario, vidas: novaVida };
      return {
        estado: { ...estado, [quem]: novoDono },
        sucesso: true,
        mensagem: `🚬 ${donoNomeExibicao} fumou um cigarro e recuperou 1 vida.`,
      };
    }

    case "algemas": {
      const novoAlvo = { ...alvo, pulaProximaVez: true };
      const novoDono = { ...dono, itens: novoInventario };
      return {
        estado: { ...estado, [quem]: novoDono, [outro]: novoAlvo },
        sucesso: true,
        mensagem: `🔗 ${donoNomeExibicao} usou algemas — o oponente vai perder a próxima vez.`,
      };
    }

    case "lupa": {
      const isVerdadeira = estado.balas?.[estado.posAtual];
      const novoDono = { ...dono, itens: novoInventario };
      return {
        estado: { ...estado, [quem]: novoDono, balaRevelada: isVerdadeira },
        sucesso: true,
        mensagem: `🔍 ${donoNomeExibicao} usou a lupa: a bala atual é ${isVerdadeira ? "REAL 🔴" : "FALSA ⚪"}.`,
      };
    }

    case "cerveja": {
      const novoDono = { ...dono, itens: novoInventario };
      let novoEstado = {
        ...estado,
        [quem]: novoDono,
        posAtual: estado.posAtual + 1,
        balaRevelada: null,
      };
      const ejetada = estado.balas[estado.posAtual];
      let mensagem = `🍺 ${donoNomeExibicao} tomou uma cerveja e ejetou a bala ${ejetada ? "REAL 🔴" : "falsa ⚪"} sem atirar.`;
      return { estado: novoEstado, sucesso: true, mensagem };
    }

    case "serra": {
      const novoDono = { ...dono, itens: novoInventario, serraAtiva: true };
      return {
        estado: { ...estado, [quem]: novoDono },
        sucesso: true,
        mensagem: `🪚 ${donoNomeExibicao} afiou o próximo tiro — dano dobrado no próximo acerto no oponente.`,
      };
    }

    default:
      return { estado, sucesso: false, mensagem: "Item não implementado." };
  }
}

/**
 * Depois de decidir de quem é a próxima vez (`proximoVezDe`), aplica o
 * efeito das algemas: se quem receberia a vez está com `pulaProximaVez`,
 * essa pessoa é pulada (a vez volta pra quem acabou de jogar) e a flag é
 * consumida. Retorna { vezDe, log } prontos pra mesclar no estado.
 */
export function resolverPulosDeVez(estadoParcial, quemAcabouDeJogar, proximoVezDe) {
  const alvo = estadoParcial[proximoVezDe];
  if (alvo?.pulaProximaVez) {
    const nomeExibicao = proximoVezDe === "jogador" ? "Você estava" : "O bot estava";
    return {
      vezDe: quemAcabouDeJogar,
      [proximoVezDe]: { ...alvo, pulaProximaVez: false },
      logExtra: `⛓️ ${nomeExibicao} algemado(a) e perdeu a vez!`,
    };
  }
  return { vezDe: proximoVezDe, logExtra: null };
}
