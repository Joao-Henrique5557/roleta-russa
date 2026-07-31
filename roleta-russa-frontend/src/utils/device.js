/**
 * Detecta se o dispositivo é "desktop" combinando largura de tela mínima
 * com ausência de ponteiro touch primário. Só largura não basta (um
 * tablet em modo paisagem passaria), por isso o pointer:coarse.
 */
export function isDesktopDevice() {
  if (typeof window === "undefined" || !window.matchMedia) return false;

  const larguraOk = window.matchMedia("(min-width: 769px)").matches;
  const temPonteiroFino = window.matchMedia("(pointer: fine)").matches;

  return larguraOk && temPonteiroFino;
}
