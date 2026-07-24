// pages/index.js
//
// Rota "/" deste laboratório. Mostra o mesmo ranking que a Home do
// front-end principal mostra (componente Ranking.jsx) - só que aqui os
// dados chegam via Prisma + SSR em vez de via axios + useEffect + CSR.
//
// CONCEITO CENTRAL: getServerSideProps
// Essa função roda NO SERVIDOR (nunca no navegador), a cada vez que
// alguém pede essa página. O que ela retorna em `props` já chega pronto
// pro componente - por isso não existe "loading..." piscando na tela
// aqui: o HTML que o navegador recebe já vem com os dados dentro.
//
// Compare com Ranking.jsx (front-end principal): lá, o componente
// primeiro renderiza vazio, dispara um axios.get dentro de um
// useEffect, e SÓ DEPOIS (quando a resposta chega) atualiza a tela. Isso
// é CSR (Client-Side Rendering) - o preço de ser mais simples de montar é
// esse "flash" inicial sem dados.
import prisma from "../lib/prisma";
import styles from "../styles/Home.module.css";

export async function getServerSideProps() {
  // Prisma já devolve os dados tipados (sabe que `pontos` é número, etc.)
  // sem a gente escrever nenhum SQL - compare com o SQL escrito à mão em
  // UsuarioDAO.java (SELECT * FROM usuarios ORDER BY pontos DESC LIMIT 10)
  // ou em usuarios.js (mesma query, via mysql2).
  const usuarios = await prisma.usuario.findMany({
    orderBy: { pontos: "desc" },
    take: 10,
    select: { id: true, nome: true, pontos: true, cargo: true },
  });

  return {
    props: {
      // Datas/BigInt não serializam direto em JSON - aqui não é um
      // problema porque não selecionamos `dataCadastro`, mas é uma
      // armadilha comum de getServerSideProps vale registrar no
      // comentário pra quem for mexer depois.
      usuarios,
    },
  };
}

export default function Home({ usuarios }) {
  return (
    <main className={styles.container}>
      <h1>🧪 Laboratório Next.js + Prisma</h1>
      <p>
        Esta página é renderizada NO SERVIDOR (SSR) e busca os dados com Prisma, direto da
        tabela <code>usuarios</code> - a mesma que os backends Java e Node usam.
      </p>
      <p className={styles.aviso}>
        Isto é só um laboratório de estudo, sem autenticação nem escrita no banco. O projeto
        principal continua sendo o front-end Vite + backend Java.
      </p>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Pontos</th>
            <th>Cargo</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u, i) => (
            <tr key={u.id}>
              <td>{i + 1}</td>
              <td>{u.nome}</td>
              <td>{u.pontos}</td>
              <td>{u.cargo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
