import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <h4>Redes sociais</h4>
        <p>Instagram</p>
        <a href="https://www.youtube.com/@Pequeno_dev">
          <p>YouTube</p>
        </a>
        <a href="https://www.chess.com/member/joao_henrique5557">
          <p>Chess.com</p>
        </a>
        <a href="https://github.com/Joao-Henrique5557">
          <p>GitHub</p>
        </a>
      </div>
      <div>
        <h4>Tecnologias</h4>
        <p>React</p>
        <p>MVC</p>
        <p>CSS</p>
        <p>JavaScript</p>
        <p>HTML</p>
        <p>JSX</p>
        <p>Figma</p>
      </div>
    </footer>
  );
}

export default Footer;
