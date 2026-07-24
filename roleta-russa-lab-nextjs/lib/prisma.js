// lib/prisma.js
//
// Cria UMA instância do PrismaClient e reaproveita entre requisições.
//
// CONCEITO/ARMADILHA COMUM: em desenvolvimento, o Next.js recarrega
// módulos a cada alteração de arquivo (Fast Refresh/HMR). Se a gente
// simplesmente fizesse `export default new PrismaClient()` no topo do
// arquivo, cada recarga criaria uma conexão NOVA com o banco, e depois de
// algumas dezenas de edições de código você bateria no limite de conexões
// simultâneas do MySQL ("too many connections").
//
// A solução padrão (documentada pelo próprio Prisma) é guardar a
// instância numa variável global do processo Node e só criar uma nova se
// ainda não existir - assim ela sobrevive entre recarregamentos de
// módulo em dev, mas se comporta normalmente em produção (onde não há
// hot-reload).
const { PrismaClient } = require("@prisma/client");

const globalParaPrisma = globalThis;

const prisma =
  globalParaPrisma.prismaClient ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prismaClient = prisma;
}

module.exports = prisma;
