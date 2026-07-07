import styles from "./ScrollIndicator.module.css";

function ScrollIndicator() {
  const scrollToFooter = () => {
    const footer = document.querySelector("footer");
    if (footer) footer.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className={styles.scrollIndicator} onClick={scrollToFooter}>
      <span className={styles.text}>Rolar para baixo</span>
      <div className={styles.mouse}>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
}

export default ScrollIndicator;
