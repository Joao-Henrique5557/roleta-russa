import { Component } from "react";
import PropTypes from "prop-types";
import styles from "./ErrorBoundary.module.css";

/**
 * Captura erros lançados durante a renderização de qualquer componente
 * filho e mostra uma tela de fallback em vez de deixar a aplicação inteira
 * quebrar em branco.
 *
 * Precisa ser um componente de classe porque os hooks
 * `getDerivedStateFromError` e `componentDidCatch` só existem no ciclo de
 * vida de classes - não têm equivalente em hooks até hoje.
 *
 * Importante: Error Boundaries só capturam erros de renderização (dentro do
 * JSX/render), não erros em handlers de evento (onClick, etc.) nem em
 * chamadas assíncronas (axios). Para esses casos, o tratamento continua
 * sendo feito com try/catch + getErrorMessage + toast, como no Formulario.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { temErro: false };
  }

  static getDerivedStateFromError() {
    return { temErro: true };
  }

  componentDidCatch(error, infoDoErro) {
    // Em um projeto real isso poderia mandar o erro pra um serviço de
    // monitoramento (Sentry, etc). Aqui, só logamos no console.
    console.error("[ErrorBoundary] Erro capturado na renderização:", error, infoDoErro);
  }

  render() {
    if (this.state.temErro) {
      return (
        <div className={styles.container}>
          <h1>Ops, algo deu errado.</h1>
          <p>Um erro inesperado aconteceu na interface. Tente recarregar a página.</p>
          <button className={styles.button} onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
