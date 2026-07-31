// Lista de blocos de créditos exibidos em sequência sobre o vídeo de intro.
// Cada bloco fica visível por `duracaoMs` antes de dar lugar ao próximo.
const creditos = [
  {
    id: 1,
    titulo: "Desenvolvido por",
    linhas: ["João Henrique"],
    duracaoMs: 3000,
  },
  {
    id: 2,
    titulo: "Frontend",
    linhas: ["React 19", "Vite", "TypeScript", "CSS Modules"],
    duracaoMs: 3000,
  },
  {
    id: 3,
    titulo: "Backend",
    linhas: ["Java 17", "Jakarta EE Servlets", "Tomcat 10", "MySQL"],
    duracaoMs: 3000,
  },
  {
    id: 4,
    titulo: "Infraestrutura",
    linhas: ["Docker", "Docker Compose"],
    duracaoMs: 3000,
  },
  {
    id: 5,
    titulo: "Roleta Russa",
    linhas: ["Projeto de estudo full stack"],
    duracaoMs: 4000,
  },
];

export default creditos;