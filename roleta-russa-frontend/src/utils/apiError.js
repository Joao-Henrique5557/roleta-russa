/**
 * Traduz um erro do axios em uma mensagem amigável pro usuário.
 *
 * Centralizar isso aqui evita que cada componente reimplemente sua própria
 * lógica de "se for 401 então... se for timeout então..." - antes isso
 * estava espalhado (e um pouco inconsistente) entre Formulario, Ranking e
 * Novidades.
 *
 * @param {import('axios').AxiosError} error
 * @param {string} fallback mensagem padrão caso nenhum caso específico bata
 * @returns {string}
 */
export function getErrorMessage(error, fallback = "Algo deu errado. Tente novamente.") {
  if (!error) return fallback;

  // Erro de rede: backend fora do ar, sem conexão, ou bloqueio de CORS antes
  // mesmo de uma resposta chegar.
  if (error.code === "ERR_NETWORK") {
    return "Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente em instantes.";
  }

  if (error.code === "ECONNABORTED") {
    return "O servidor demorou demais para responder. Tente novamente.";
  }

  const status = error.response?.status;
  // O backend (JsonResponse.error) sempre manda { "error": "mensagem" }
  const mensagemDoServidor = error.response?.data?.error;

  switch (status) {
    case 400:
      return mensagemDoServidor || "Dados inválidos. Confira os campos e tente novamente.";
    case 401:
      return mensagemDoServidor || "Usuário ou senha incorretos.";
    case 404:
      return mensagemDoServidor || "Não encontrado.";
    case 409:
      return mensagemDoServidor || "Esse registro já existe.";
    case 500:
      return mensagemDoServidor || "Erro interno do servidor. Tente novamente mais tarde.";
    default:
      return mensagemDoServidor || fallback;
  }
}
