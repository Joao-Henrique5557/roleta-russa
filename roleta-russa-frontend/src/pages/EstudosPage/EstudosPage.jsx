// src/pages/EstudosPage/EstudosPage.jsx
//
// Tela "📚 Sobre o projeto / Estudos". Todo o CONTEÚDO mostrado aqui vem
// de src/constants/estudosData.js - este componente só sabe "desenhar",
// não guarda nenhum texto fixo sobre o projeto (fora os títulos das
// seções). Veja o comentário grande no topo de estudosData.js pra
// entender por que essa separação existe e como editar o conteúdo.
import PropTypes from "prop-types";
import styles from "./estudos.module.css";
import {
  descricaoProjeto,
  linksUteis,
  materiais,
  tecnologias,
  playlists,
  conceitos,
} from "../../constants/estudosData";

/** Monta a URL de embed de uma playlist ou vídeo único do YouTube. */
function urlEmbedYoutube({ playlistId, videoId }) {
  if (playlistId)
    return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
  if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  return null;
}

/** Um bloco de conceitos de UMA tecnologia (ex: "React"), com sua lista. */
function BlocoConceitos({ titulo, itens }) {
  if (!itens || itens.length === 0) return null;
  return (
    <div className={styles.blocoConceito}>
      <h3>{titulo}</h3>
      <div className={styles.listaConceitos}>
        {itens.map((c) => (
          <details key={c.titulo} className={styles.conceitoItem}>
            <summary>{c.titulo}</summary>
            <p>{c.texto}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
BlocoConceitos.propTypes = {
  titulo: PropTypes.string.isRequired,
  itens: PropTypes.array,
};

export default function EstudosPage({ onBack }) {
  return (
    <div className={styles.pagePanel}>
      <div className={styles.pageHeader}>
        <div>
          <h1>📚 Sobre o projeto / Estudos</h1>
          <p>
            De onde vem o conhecimento por trás deste projeto — cursos,
            tecnologias e conceitos.
          </p>
        </div>
        <button className={styles.primaryButton} onClick={onBack}>
          ← Voltar
        </button>
      </div>

      <div className={styles.conteudo}>
        {/* ---- DESCRIÇÃO DO PROJETO ---- */}
        <section className={styles.secao}>
          <h2>{descricaoProjeto.titulo}</h2>
          {descricaoProjeto.paragrafos.map((p, i) => (
            <p key={i} className={styles.paragrafo}>
              {p}
            </p>
          ))}
        </section>

        {/* ---- TECNOLOGIAS ---- */}
        <section className={styles.secao}>
          <h2>Tecnologias usadas</h2>
          <div className={styles.gradeTecnologias}>
            {tecnologias.map((t) => (
              <div key={t.nome} className={styles.cardTecnologia}>
                <span className={styles.categoriaTag}>{t.categoria}</span>
                <strong>{t.nome}</strong>
                <p>{t.descricao}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- LINKS ÚTEIS (READMEs, repositórios) ---- */}
        <section className={styles.secao}>
          <h2>Links e documentação</h2>
          <ul className={styles.listaLinks}>
            {linksUteis.map((l) => (
              <li key={l.titulo}>
                <a href={l.url} target="_blank" rel="noreferrer">
                  {l.titulo}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ---- MATERIAIS (fotos, arquivos de /docs) ---- */}
        <section className={styles.secao}>
          <h2>Materiais de estudo (docs/fotos)</h2>
          <div className={styles.gradeMateriais}>
            {materiais.map((m) => (
              <a
                key={m.titulo}
                className={styles.cardMaterial}
                href={m.src}
                target="_blank"
                rel="noreferrer"
              >
                {m.tipo === "imagem" ? (
                  <img
                    src={m.src}
                    alt={m.titulo}
                    className={styles.thumbMaterial}
                    loading="lazy"
                  />
                ) : (
                  <span className={styles.iconeArquivo}>📄</span>
                )}
                <strong>{m.titulo}</strong>
                <p>{m.descricao}</p>
              </a>
            ))}
          </div>
        </section>

        {/* ---- PLAYLISTS (iframes do YouTube, uma abaixo da outra) ---- */}
        <section className={styles.secao}>
          <h2>Playlists dos cursos que estou seguindo</h2>
          <div className={styles.listaPlaylists}>
            {playlists.map((p) => {
              const url = urlEmbedYoutube(p);
              return (
                <div key={p.titulo} className={styles.blocoPlaylist}>
                  <h3>{p.titulo}</h3>
                  {p.descricao && (
                    <p className={styles.paragrafo}>{p.descricao}</p>
                  )}
                  {url ? (
                    <div className={styles.embedWrapper}>
                      <iframe
                        src={url}
                        title={p.titulo}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <p className={styles.paragrafo}>
                      (Sem vídeo configurado ainda — edite
                      src/constants/estudosData.js)
                    </p>
                  )}
                  <p>
                    Link do vídeo/playlist:{" "}
                    <a
                      href={
                        p.videoId
                          ? `https://www.youtube.com/watch?v=${p.videoId}`
                          : `https://www.youtube.com/playlist?list=${p.playlistId}`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir no YouTube
                    </a>
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---- CONCEITOS PRINCIPAIS ---- */}
        <section className={styles.secao}>
          <h2>Principais conceitos e arquitetura do projeto</h2>
          <p className={styles.paragrafo}>
            Clique em cada item para expandir a aula detalhada.
          </p>

          <BlocoConceitos
            titulo="🎲 Mecânicas do Jogo (Game Design & Algoritmos)"
            itens={conceitos.mecanicasJogo}
          />
          <BlocoConceitos
            titulo="⚛️ React 19 & Gerenciamento de Estado"
            itens={conceitos.react}
          />
          <BlocoConceitos
            titulo="🟨 JavaScript Avançado & Assincronismo"
            itens={conceitos.javascript}
          />
          <BlocoConceitos
            titulo="🟩 Node.js, Express & WebSockets (Multiplayer)"
            itens={conceitos.nodejs}
          />
          <BlocoConceitos
            titulo="☕ Java 17, Jakarta EE & JDBC"
            itens={conceitos.java}
          />
          <BlocoConceitos
            titulo="🐳 Banco de Dados & Docker (Infraestrutura)"
            itens={conceitos.infraBD}
          />
        </section>
      </div>
    </div>
  );
}

EstudosPage.propTypes = {
  onBack: PropTypes.func.isRequired,
};
