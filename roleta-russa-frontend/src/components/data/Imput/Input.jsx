import { forwardRef } from "react";
import styles from "./Imput.module.css";

const Input = forwardRef(function Input(
  { tipoInput, placeholder, value, onChange, name },
  ref,
) {
  return (
    <div className={styles.input}>
      <input
        ref={ref}
        className={styles.inputField}
        type={tipoInput}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
      />
    </div>
  );
});

export default Input;
