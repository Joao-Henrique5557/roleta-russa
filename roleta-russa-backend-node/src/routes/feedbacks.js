// Equivalente a ListarFeedbacks.java e CriarFeedback.java (FeedbackDAO.java)
// no backend Java. Substitui o antigo src/routes/novidades.js - a tabela
// "novidades" (mural escrito só pelo dono do projeto) deu lugar a
// "feedbacks" (comentários/sugestões/denúncias enviados pelos jogadores).
// Ver db/migration_002_feedbacks.sql para o schema.
"use strict";

const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const validation = require("../utils/validation");

const TIPOS_VALIDOS = new Set(["COMENTARIO", "SUGESTAO", "DENUNCIA"]);
const TAMANHO_MAXIMO_MENSAGEM = 2000;

function erro(res, status, texto) {
  res.status(status).json({ error: texto });
}

function mensagem(res, status, texto) {
  res.status(status).json({ message: texto });
}

/**
 * O front-end espera os campos em camelCase (usuarioId, dataCriacao),
 * iguais ao Gson do backend Java. As colunas do MySQL usam snake_case
 * (usuario_id, data_criacao), então convertemos aqui.
 */
function paraApi(linha) {
  return {
    id: String(linha.id),
    tipo: linha.tipo,
    mensagem: linha.mensagem,
    autor: linha.autor,
    usuarioId: linha.usuario_id != null ? String(linha.usuario_id) : null,
    status: linha.status,
    dataCriacao: linha.data_criacao,
    ativo: !!linha.ativo,
  };
}

// GET /ListarFeedbacks - opcionalmente filtrado por ?tipo=COMENTARIO|SUGESTAO|DENUNCIA
router.get("/ListarFeedbacks", async (req, res) => {
  const { tipo } = req.query;

  try {
    let linhas;
    if (!validation.isBlank(tipo)) {
      [linhas] = await pool.query(
        "SELECT * FROM feedbacks WHERE ativo = TRUE AND tipo = ? ORDER BY data_criacao DESC LIMIT 50",
        [String(tipo).toUpperCase()],
      );
    } else {
      [linhas] = await pool.query(
        "SELECT * FROM feedbacks WHERE ativo = TRUE ORDER BY data_criacao DESC LIMIT 50",
      );
    }
    res.status(200).json(linhas.map(paraApi));
  } catch (e) {
    console.error("[ListarFeedbacks] Falha ao acessar o MySQL:", e);
    res.status(200).json([]);
  }
});

// POST /CriarFeedback (tipo, mensagem, autor?, usuarioId?)
router.post("/CriarFeedback", async (req, res) => {
  const { tipo, mensagem: texto, autor, usuarioId } = req.body;

  const tipoNormalizado = typeof tipo === "string" ? tipo.trim().toUpperCase() : "";
  if (!TIPOS_VALIDOS.has(tipoNormalizado)) {
    return erro(res, 400, "Campo 'tipo' deve ser COMENTARIO, SUGESTAO ou DENUNCIA.");
  }
  if (validation.isBlank(texto)) {
    return erro(res, 400, "Campo 'mensagem' é obrigatório.");
  }
  if (String(texto).trim().length > TAMANHO_MAXIMO_MENSAGEM) {
    return erro(res, 400, `Mensagem muito longa (máximo ${TAMANHO_MAXIMO_MENSAGEM} caracteres).`);
  }

  const autorFinal = !validation.isBlank(autor) ? String(autor).trim() : "Anônimo";
  const usuarioIdFinal = !validation.isBlank(usuarioId) ? Number(usuarioId) : null;

  try {
    await pool.query(
      "INSERT INTO feedbacks (tipo, mensagem, autor, usuario_id, status, data_criacao, ativo) "
        + "VALUES (?, ?, ?, ?, 'ABERTO', NOW(), TRUE)",
      [tipoNormalizado, String(texto).trim(), autorFinal, usuarioIdFinal],
    );
    const mensagemSucesso =
      tipoNormalizado === "DENUNCIA"
        ? "Denúncia enviada. Nossa equipe vai analisar em breve."
        : "Obrigado pelo feedback!";
    return mensagem(res, 201, mensagemSucesso);
  } catch (e) {
    console.error("[CriarFeedback] Falha ao acessar o MySQL:", e);
    return erro(res, 500, "Erro ao salvar no banco de dados.");
  }
});

module.exports = router;
