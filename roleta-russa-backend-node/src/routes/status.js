// GET /Status - equivalente ao StatusServlet.java.
"use strict";

const express = require("express");
const router = express.Router();
const { testarConexao } = require("../db");

router.get("/Status", async (req, res) => {
  const bancoConectado = await testarConexao();

  const json = {
    status: "ok",
    service: "roleta-russa-backend-node",
    bancoConectado,
  };

  if (!bancoConectado) {
    json.bancoErro =
      "Não foi possível conectar ao MySQL. Verifique se o serviço está rodando, " +
      "se o database 'roleta_russa' foi criado (db/schema.sql) e se as " +
      "variáveis DB_HOST / DB_USER / DB_PASSWORD estão corretas.";
  }

  res.status(200).json(json);
});

module.exports = router;
