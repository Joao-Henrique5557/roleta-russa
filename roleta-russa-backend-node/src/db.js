"use strict";

const mysql = require("mysql2/promise");

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_NAME = process.env.DB_NAME || "roleta_russa";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";

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
  // rejectUnauthorized: false -> criptografa a conexão mas não valida a
  // cadeia do certificado (o Aiven usa um CA próprio/auto-assinado, que
  // não está nas autoridades confiáveis padrão do Node). Mesmo
  // comportamento que sslMode=REQUIRED no backend Java.
  ssl: DB_SSL ? { rejectUnauthorized: false } : undefined,
});

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
