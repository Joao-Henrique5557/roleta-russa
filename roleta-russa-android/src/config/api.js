// URLs dos dois backends do projeto, lidas de variáveis de ambiente
// (definidas no .env - veja .env.example na raiz do projeto).
//
// Fallback: 10.0.2.2 é o alias que o emulador Android usa para chegar no
// "localhost" da máquina host. Em dispositivo físico isso não funciona -
// defina EXPO_PUBLIC_API_URL / EXPO_PUBLIC_SOCKET_URL com o IP da sua
// máquina na rede local.

// Backend PRINCIPAL (Java/Jakarta EE): login, cadastro, ranking, pontos, perfil.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080";

// Backend de MULTIPLAYER (Node.js + Socket.IO) - serviço separado, veja
// roleta-russa-backend-node/README.md.
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "http://10.0.2.2:3001";
