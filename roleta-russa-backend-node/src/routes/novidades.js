// Equivalente a ListarNovidades.java e CadastrarNovidade.java (NovidadeDAO.java).
"use strict";

const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const validation = require("../utils/validation");

function erro(res, status, texto) {
  res.status(status).json({ error: texto });
}

function mensagem(res, status, texto) {
  res.status(status).json({ message: texto });
}

/**
 * O front-end (CardNovidade.jsx) espera os campos em camelCase
 * (titulo, descricao, tipo, autor, versao, dataPublicacao, ativo) - iguais
 * ao Gson do backend Java. As colunas do MySQL usam snake_case
 * (data_publicacao), então convertemos aqui.
 */
function paraApi(linha) {
  return {
    id: String(linha.id),
    titulo: linha.titulo,
    descricao: linha.descricao,
    tipo: linha.tipo,
    autor: linha.autor,
    versao: linha.versao,
    dataPublicacao: linha.data_publicacao,
    ativo: !!linha.ativo,
  };
}

// GET /ListarNovidades - só as ativas, mais recentes primeiro (igual ao SQL do Java)
router.get("/ListarNovidades", async (req, res) => {
  try {
    const [linhas] = await pool.query(
      "SELECT * FROM novidades WHERE ativo = TRUE ORDER BY data_publicacao DESC LIMIT 10",
    );
    res.status(200).json(linhas.map(paraApi));
  } catch (e) {
    console.error("[ListarNovidades] Falha ao acessar o MySQL:", e);
    res.status(200).json([]);
  }
});

// POST /CadastrarNovidade (titulo, descricao, tipo, autor?, versao?, ativo?)
router.post("/CadastrarNovidade", async (req, res) => {
  const { titulo, descricao, tipo, autor, versao, ativo } = req.body;

  if (validation.isBlank(titulo) || validation.isBlank(descricao) || validation.isBlank(tipo)) {
    return erro(res, 400, "Campos obrigatórios ausentes ou vazios (titulo, descricao, tipo).");
  }

  const autorFinal = !validation.isBlank(autor) ? autor : "Anônimo";
  const versaoFinal = !validation.isBlank(versao) ? versao : "1.0.0";
  // Se o parâmetro 'ativo' não vier, assume true (igual ao servlet Java).
  const ativoFinal = ativo === undefined ? true : ativo === "true" || ativo === true;

  try {
    await pool.query(
      "INSERT INTO novidades (titulo, descricao, tipo, autor, versao, data_publicacao, ativo) VALUES (?, ?, ?, ?, ?, NOW(), ?)",
      [titulo, descricao, String(tipo).toUpperCase(), autorFinal, versaoFinal, ativoFinal],
    );
    return mensagem(res, 201, "Novidade criada com sucesso!");
  } catch (e) {
    console.error("[CadastrarNovidade] Falha ao acessar o MySQL:", e);
    return erro(res, 500, "Erro ao salvar no banco de dados.");
  }
});

module.exports = router;
