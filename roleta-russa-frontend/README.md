# Melhoria no tratamento de erros do frontend

## O que mudou

### 1. `src/utils/apiError.js` (novo)
Função `getErrorMessage(error, fallback)` que traduz qualquer erro do axios
numa mensagem em português amigável, olhando pro `error.code` (rede/timeout)
e pro `error.response.status` (400/401/404/409/500). Antes, cada componente
tinha sua própria lógica repetida (e um pouco diferente) pra isso.

### 2. `src/context/ToastContext.jsx` + `src/components/Feedback/Toast/` (novo)
Substitui os `alert()` do navegador (que travam a tela até o usuário clicar
OK) por notificações não-bloqueantes no canto da tela, que somem sozinhas.

Uso em qualquer componente:
```jsx
import { useToast } from "../../context/ToastContext"; // ajuste o caminho

function MeuComponente() {
  const { showToast } = useToast();
  showToast("Deu certo!", "success");
  showToast("Deu ruim", "error");
  showToast("Só um aviso", "info");
}
```

### 3. `src/components/Feedback/ErrorBoundary/` (novo)
Captura erros que acontecem durante a renderização de componentes (ex: tentar
ler uma propriedade de `undefined` no JSX) e mostra uma tela de "algo deu
errado" com botão de recarregar, em vez da tela ficar em branco sem
explicação nenhuma - isso já era um risco real na `PerfilPage.jsx`, que
chama `JSON.parse(localStorage.getItem("usuario"))` várias vezes sem
verificar se o valor existe.

Importante: Error Boundaries só pegam erro de **renderização**. Erros de
requisição (axios) continuam tratados com try/catch + `getErrorMessage` +
toast, como sempre foi.

### 4. `App.jsx`
Agora envolve toda a aplicação com `<ErrorBoundary>` e `<ToastProvider>`.

### 5. `Formulario.jsx`, `Ranking.jsx`, `Novidades.jsx`
- Removidos todos os `alert()`.
- Erros agora usam `getErrorMessage` + `showToast`, e mantêm também uma
  mensagem inline discreta (sem bloquear o resto da tela).
- `Formulario.module.css` ganhou a classe `.errorText` que faltava (o JSX já
  referenciava essa classe, mas ela não existia no CSS - o texto de erro
  aparecia sem destaque nenhum).

## Como aplicar no seu projeto

1. Copie as pastas novas:
   - `src/utils/apiError.js`
   - `src/context/ToastContext.jsx` + `.module.css`
   - `src/components/Feedback/Toast/`
   - `src/components/Feedback/ErrorBoundary/`
2. Substitua: `App.jsx`, `Formulario.jsx`, `Formulario.module.css`,
   `Ranking.jsx`, `Novidades.jsx`.
3. Rode `npm run dev` e teste: deixe o backend desligado e tente
   cadastrar/logar - deve aparecer um toast vermelho não-bloqueante em vez
   do `alert()` de antes.

## Não fiz (mas pode valer a pena depois)

- `PerfilPage.jsx` ainda tem vários `JSON.parse(localStorage.getItem(...))`
  repetidos sem tratamento - funciona porque o `ErrorBoundary` agora pega
  se isso quebrar, mas o ideal seria fazer o parse uma vez só no topo do
  componente com um fallback (`try/catch` retornando `{}`).
- `MultiplayerLobby`/multiplayer real ainda são placeholders (como já era).
