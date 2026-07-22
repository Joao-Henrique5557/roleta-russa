const capaPadrao = "/images/covers_musicas/padrao.jpg";

// Lista de músicas disponíveis
const musicTracks = [
  {
    id: 1,
    label: "L'amour Toujours",
    src: "/audio/musica/L'amour Toujours - Gigi D'Agostino (Piano Cover).mp3",
    capa: capaPadrao,
  },
  {
    id: 2,
    label: "FNAF cover",
    src: "/audio/musica/fnafcover.mp3",
    capa: capaPadrao,
  },
  {
    id: 3,
    label: "Marilyn Manson - Sweet Dreams ( cover )",
    src: "/audio/musica/Marilyn Manson - Sweet Dreams ( cover ).mp3",
    capa: capaPadrao,
  },
  {
    id: 4,
    label: "Backshot rolete original",
    // [BUG FIX] Era "/audio/musia/..." (faltava o "c") -> 404, faixa nunca tocava.
    src: "/audio/musica/Buckshot Roulette OST - General Release (extended).mp3",
    capa: capaPadrao,
  },
  {
    id: 5,
    label: "Meu estilo 'Sertanejo'",
    src: "/audio/musica/Aria Math (Forro).mp3",
    capa: capaPadrao,
  },
];

export default musicTracks;
