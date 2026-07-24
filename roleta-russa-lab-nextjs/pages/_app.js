// pages/_app.js
//
// Arquivo especial do Next.js (Pages Router): envolve TODAS as páginas.
// É o equivalente conceitual do src/main.jsx + src/App.jsx do front-end
// principal (Vite) - só que aqui o Next.js já sabe encontrar esse arquivo
// pelo nome/local, sem precisar registrar nada manualmente.
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
