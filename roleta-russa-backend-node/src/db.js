// Pool de conexões MySQL - equivalente ao util/ConnectionFactory.java do
// backend Java, mas usando um pool (mysql2/promise) em vez de abrir uma
// conexão nova a cada chamada, que é o padrão idiomático em Node.
//
// Ordem de resolução das variáveis (mesma ideia do EnvLoader/ConnectionFactory
// em Java): variável de ambiente real do processo (Docker Compose já injeta)
// -> valor lido do .env (dotenv, carregado em bin/www) -> valor padrão local.
"use strict";

const mysql = require("mysql2/promise");

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_NAME = process.env.DB_NAME || "roleta_russa";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";

// Em produção (Aiven exige TLS), o driver precisa negociar SSL.
// Rodando local via Docker Compose (sem TLS configurado no MySQL do
// container), isso continua funcionando normalmente: `ssl: undefined`
// equivale a não usar SSL, então só ativamos quando DB_SSL=true.
const DB_SSL = process.env.DB_SSL !== "false"; // default: ligado

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  ssl: DB_SSL ? { rejectUnauthorized: true } : undefined,
});

/**
 * Testa a conexão rapidamente - usado pelo GET /Status, igual ao
 * ConnectionFactory.testarConexao() do backend Java.
 */
async function testarConexao() {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.query("SELECT 1");
      return true;
    } finally {
      conn.release();
    }
  } catch (erro) {
    console.error("[db] Falha ao conectar no MySQL:", erro.message);
    return false;
  }
}

module.exports = { pool, testarConexao, DB_HOST, DB_PORT, DB_NAME };
