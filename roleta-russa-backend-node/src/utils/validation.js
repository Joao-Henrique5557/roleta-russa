// Equivalente ao util/ValidationUtil.java.
"use strict";

const EMAIL_PATTERN = /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/;

function isBlank(valor) {
  return valor == null || String(valor).trim().length === 0;
}

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_PATTERN.test(email.trim());
}

function isValidSenha(senha) {
  return typeof senha === "string" && senha.length >= 4;
}

function isValidNome(nome) {
  if (typeof nome !== "string") return false;
  const tam = nome.trim().length;
  return tam >= 2 && tam <= 60;
}

module.exports = { isBlank, isValidEmail, isValidSenha, isValidNome };
