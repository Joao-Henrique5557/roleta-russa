// Equivalente ao util/PasswordUtil.java: hash SHA-256 em hex minúsculo.
// Usar o MESMO algoritmo dos dois backends é o que permite os dois
// (Java e Node) lerem/escreverem a mesma tabela `usuarios` sem conflito -
// um hash gerado por um é validado normalmente pelo outro.
"use strict";

const crypto = require("crypto");

function hash(senhaPura) {
  return crypto.createHash("sha256").update(String(senhaPura), "utf8").digest("hex");
}

function matches(senhaPura, hashArmazenado) {
  if (senhaPura == null || hashArmazenado == null) return false;
  return hash(senhaPura) === hashArmazenado;
}

module.exports = { hash, matches };
