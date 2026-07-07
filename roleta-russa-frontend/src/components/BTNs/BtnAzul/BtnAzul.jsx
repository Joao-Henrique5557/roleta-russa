import styles from "./BtnAzul.module.css";

function BtnAzul({ placeholder, type = "button", onClick }) {
  return (
    <button className={styles.btnAzul} type={type} onClick={onClick}>
      {placeholder}
    </button>
  );
}

export default BtnAzul;
