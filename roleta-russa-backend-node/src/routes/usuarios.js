// Equivalente a: CadastrarServlet, AutenticarServlet, ListarUsuarios,
// BuscarUsuario, GanharPontos (UsuarioDAO.java) do backend Java.
//
// Os nomes das rotas ("/CadastrarServlet", "/AutenticarServlet", etc.)
// foram mantidos EXATAMENTE iguais ao backend Java de propósito: assim o
// front-end (que já faz axios.post(`${urlAPI}/CadastrarServlet`, ...)) não
// precisa de nenhuma alteração pra funcionar com qualquer um dos dois
// backends - basta trocar VITE_API_URL.
"use strict";

const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const passwordUtil = require("../utils/passwordUtil");
const validation = require("../utils/validation");

function erro(res, status, mensagem) {
  res.status(status).json({ error: mensagem });
}

function mensagem(res, status, texto) {
  res.status(status).json({ message: texto });
}

/** Remove o hash da senha antes de devolver o usuário pro cliente. */
function semSenha(usuario) {
  if (!usuario) return usuario;
  const { senha, ...resto } = usuario;
  return resto;
}

// POST /CadastrarServlet  (nome, email, senha)
router.post("/CadastrarServlet", async (req, res) => {
  const nomeDado = req.body.nome;
  const emailDado = req.body.email;
  const senhaDada = req.body.senha;

  if (!validation.isValidNome(nomeDado)) {
    return erro(res, 400, "Nome inválido. Use entre 2 e 60 caracteres.");
  }
  if (!validation.isValidEmail(emailDado)) {
    return erro(res, 400, "E-mail inválido.");
  }
  if (!validation.isValidSenha(senhaDada)) {
    return erro(res, 400, "Senha muito curta (mínimo 4 caracteres).");
  }

  try {
    await pool.query(
      "INSERT INTO usuarios (nome, email, senha, pontos, cargo) VALUES (?, ?, ?, 0, 'usuario')",
      [nomeDado.trim(), emailDado.trim(), passwordUtil.hash(senhaDada)],
    );
    return mensagem(res, 201, "Usuário cadastrado com sucesso!");
  } catch (e) {
    if (e && e.code === "ER_DUP_ENTRY") {
      return erro(res, 409, "Não foi possível cadastrar. Esse e-mail já pode estar em uso.");
    }
    console.error("[CadastrarServlet] Falha ao acessar o MySQL:", e);
    return erro(
      res,
      500,
      "Erro interno ao cadastrar. Verifique os logs do servidor (provável falha de conexão com o MySQL).",
    );
  }
});

// POST /AutenticarServlet  (usuario|login|email, senha)
router.post("/AutenticarServlet", async (req, res) => {
  const loginInformado = req.body.usuario || req.body.login || req.body.email;
  const senhaInformada = req.body.senha;

  if (validation.isBlank(loginInformado) || validation.isBlank(senhaInformada)) {
    return erro(res, 400, "Usuário/E-mail e senha são obrigatórios.");
  }

  try {
    const login = loginInformado.trim();
    const [porEmail] = await pool.query("SELECT * FROM usuarios WHERE email = ? LIMIT 1", [login]);
    let usuario = porEmail[0];
    if (!usuario) {
      const [porNome] = await pool.query("SELECT * FROM usuarios WHERE nome = ? LIMIT 1", [login]);
      usuario = porNome[0];
    }

    if (!usuario || !passwordUtil.matches(senhaInformada, usuario.senha)) {
      return erro(res, 401, "Usuário ou senha incorretos.");
    }

    return res.status(200).json({
      id: String(usuario.id),
      nome: usuario.nome,
      email: usuario.email,
      pontos: usuario.pontos,
      dataCadastro: usuario.data_cadastro || "",
      cargo: usuario.cargo || "usuario",
    });
  } catch (e) {
    console.error("[AutenticarServlet] Falha ao acessar o MySQL:", e);
    return erro(res, 500, "Erro interno ao autenticar.");
  }
});

router.options("/AutenticarServlet", (req, res) => res.status(200).end());

// GET /ListarUsuarios - ranking (top 10 por pontos)
router.get("/ListarUsuarios", async (req, res) => {
  try {
    const [linhas] = await pool.query("SELECT * FROM usuarios ORDER BY pontos DESC LIMIT 10");
    res.status(200).json(linhas.map(semSenha));
  } catch (e) {
    console.error("[ListarUsuarios] Falha ao acessar o MySQL:", e);
    res.status(200).json([]); // mesmo comportamento do DAO Java: lista vazia em caso de erro
  }
});

// GET /BuscarUsuario?id=xxx
router.get("/BuscarUsuario", async (req, res) => {
  const id = req.query.id;
  if (validation.isBlank(id)) {
    return erro(res, 400, "Parâmetro 'id' é obrigatório.");
  }
  try {
    const [linhas] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [id]);
    if (linhas.length === 0) {
      return erro(res, 404, "Usuário não encontrado.");
    }
    res.status(200).json(semSenha(linhas[0]));
  } catch (e) {
    console.error("[BuscarUsuario] Falha ao acessar o MySQL:", e);
    return erro(res, 500, "Erro interno ao buscar usuário.");
  }
});

// POST /GanharPontos (id, forma=bot|player)
router.post("/GanharPontos", async (req, res) => {
  const id = req.body.id;
  const forma = req.body.forma;

  if (validation.isBlank(id) || validation.isBlank(forma)) {
    return erro(res, 400, "Parâmetros 'id' e 'forma' são obrigatórios.");
  }

  let incremento;
  if (forma === "bot") incremento = 10;
  else if (forma === "player") incremento = 40;
  else return erro(res, 400, "Parâmetro 'forma' deve ser 'bot' ou 'player'.");

  try {
    const [resultado] = await pool.query("UPDATE usuarios SET pontos = pontos + ? WHERE id = ?", [
      incremento,
      id,
    ]);
    if (resultado.affectedRows > 0) {
      return mensagem(res, 200, "Pontos atualizados.");
    }
    return erro(res, 500, "Não foi possível atualizar os pontos (id inexistente ou erro no MySQL).");
  } catch (e) {
    console.error("[GanharPontos] Falha ao acessar o MySQL:", e);
    return erro(res, 500, "Não foi possível atualizar os pontos (id inexistente ou erro no MySQL).");
  }
});

module.exports = router;
