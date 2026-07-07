import styles from "./perfilPage.module.css";

const PerfilPage = ({ onBack }) => {
  return (
    <div className={styles.perfilPage}>
      <h1>Meu Perfil</h1>
      <img
        className={styles.fotoUser}
        src="/images/fotoUser.png"
        alt="Foto do Usuário"
      />
      <button className={styles.btnBack} onClick={onBack}>
        Voltar
      </button>
      <div className={styles.gradeInfo}>
        <div className={styles.labelItens}>
          <p>Nome de Usuário:</p>
          <p>Email:</p>
          <p>Pontos:</p>
          <p>Cargo:</p>
          <p>Data de Cadastro:</p>
        </div>
        <div className={styles.ItensInfo}>
          <p>
            {JSON.parse(localStorage.getItem("usuario")).nome ||
              "Não encontrado"}
          </p>
          <p>
            {JSON.parse(localStorage.getItem("usuario")).email ||
              "Não encontrado"}
          </p>
          <p>{JSON.parse(localStorage.getItem("usuario")).pontos || "0"}pts</p>
          <p>
            {JSON.parse(localStorage.getItem("usuario")).cargo ||
              "Não encontrado"}
          </p>
          <p>
            {new Date(
              JSON.parse(localStorage.getItem("usuario")).dataCadastro,
            ).toLocaleDateString() || "Não encontrado"}
          </p>
        </div>
      </div>
      <h2>Área de DEV Vip</h2>

      {JSON.parse(localStorage.getItem("usuario")).cargo === "DEV"? (
        <div className={styles.areaDEV}>
          <p>Terminal SQL:</p>
          <textarea
            className={styles.terminalSQL}
            placeholder="Digite comandos SQL aqui..."
          ></textarea>
        </div>
      ) : (
        <p className={styles.semAcesso}>
          Você não tem acesso a área de DEV Vip.</p>
      )}
    </div>
  );
};

export default PerfilPage;
