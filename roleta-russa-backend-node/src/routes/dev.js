// POST /DevSql
//
// Backend do "Terminal SQL" que aparece na Área de DEV Vip do Perfil
// (PerfilPage.jsx). É uma funcionalidade pedida explicitamente pelo dono
// do projeto para fins de ESTUDO (entender como um painel administrativo
// simples se conecta direto no banco). Por isso ela existe igual nos dois
// backends (Java e Node) - veja controller/DevSqlServlet.java no backend
// Java, que é o backend "principal" do projeto.
//
// ====================== AVISO DE SEGURANÇA ======================
// Rodar SQL arbitrário vindo do cliente é PERIGOSO por natureza (é
// literalmente um vetor de SQL Injection "de propósito", já que o próprio
// texto digitado pelo usuário DEV vira o comando). Isso só é aceitável aqui
// porque:
//   1. O projeto roda 100% local, sem nada exposto publicamente;
//   2. O acesso é restrito a quem tem cargo = 'DEV' no banco, verificado
//      no SERVIDOR (nunca confie apenas na checagem que o React faz na
//      tela - qualquer pessoa pode abrir o DevTools e "fingir" ser DEV no
//      front-end, então a validação de verdade tem que estar aqui);
//   3. O objetivo é aprender como manter/depurar um app - não é uma
//      feature pensada pra produção.
// Se um dia este projeto for exposto na internet, ESSA ROTA DEVE SER
// REMOVIDA (ou, no mínimo, escondida atrás de autenticação forte + rede
// interna).
// ==================================================================
"use strict";

const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const validation = require("../utils/validation");

function erro(res, status, texto) {
  res.status(status).json({ error: texto });
}

/**
 * Confirma no banco (não confia no que o front manda) que o usuário
 * informado realmente tem cargo = 'DEV'.
 */
async function usuarioEhDev(usuarioId) {
  if (validation.isBlank(usuarioId)) return false;
  const [linhas] = await pool.query("SELECT cargo FROM usuarios WHERE id = ?", [usuarioId]);
  if (linhas.length === 0) return false;
  return linhas[0].cargo === "DEV";
}

// POST /DevSql  body: { usuarioId, sql }
router.post("/DevSql", async (req, res) => {
  const { usuarioId, sql } = req.body;

  if (validation.isBlank(usuarioId) || validation.isBlank(sql)) {
    return erro(res, 400, "Parâmetros 'usuarioId' e 'sql' são obrigatórios.");
  }

  try {
    const ehDev = await usuarioEhDev(usuarioId);
    if (!ehDev) {
      // 403 = "eu entendi quem você é, mas você não tem permissão".
      return erro(res, 403, "Acesso negado: apenas usuários com cargo DEV podem usar o terminal SQL.");
    }
  } catch (e) {
    console.error("[DevSql] Falha ao validar cargo do usuário:", e);
    return erro(res, 500, "Erro ao validar permissões.");
  }

  // Bloqueia múltiplos statements separados por ";" - reduz (mas não
  // elimina) o risco de alguém colar um script inteiro sem querer/querendo.
  const comandos = sql.split(";").map((c) => c.trim()).filter(Boolean);
  if (comandos.length > 1) {
    return erro(res, 400, "Execute um comando SQL por vez (sem ';' entre comandos).");
  }

  const inicio = Date.now();
  try {
    // pool.query() do mysql2 já cobre SELECT, INSERT, UPDATE, DELETE, DDL...
    const [resultado, campos] = await pool.query(sql);
    const duracaoMs = Date.now() - inicio;

    if (Array.isArray(resultado)) {
      // SELECT: `resultado` é um array de linhas.
      return res.status(200).json({
        tipo: "select",
        colunas: campos ? campos.map((c) => c.name) : Object.keys(resultado[0] || {}),
        linhas: resultado,
        totalLinhas: resultado.length,
        duracaoMs,
      });
    }

    // INSERT/UPDATE/DELETE/DDL: `resultado` é um ResultSetHeader.
    return res.status(200).json({
      tipo: "escrita",
      linhasAfetadas: resultado.affectedRows ?? 0,
      insertId: resultado.insertId ?? null,
      duracaoMs,
    });
  } catch (e) {
    console.error("[DevSql] Erro ao executar SQL:", e.message);
    return erro(res, 400, `Erro ao executar SQL: ${e.message}`);
  }
});

module.exports = router;
