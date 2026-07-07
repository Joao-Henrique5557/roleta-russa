# 1.1 Histórico do React

React é uma biblioteca JavaScript de código aberto, desenvolvida pelo Facebook, usada para construir interfaces de usuário (W3SCHOOLS, 2024). O React não é um framework, e tampouco se limita ao desenvolvimento para a web. Ele é frequentemente combinado com outras bibliotecas para renderização em diferentes ambientes. Por exemplo, React Native é utilizado para a construção de aplicativos móveis nativos, enquanto React 360 é usado para criar experiências de realidade virtual. Além disso, há muitas outras possibilidades, expandindo o alcance do React para diversas plataformas e contextos.

O React permite criar componentes reutilizáveis que gerenciam seu próprio estado, facilitando a construção de interfaces dinâmicas e interativas (DULDULAO; CABAGNOT, 2021). O foco principal do React é a criação de uma experiência de usuário eficiente e performática, através do gerenciamento inteligente da atualização da interface.

Neste contexto, o React foi criado pelo engenheiro de software do Facebook, Jordan Walke, em 2011. O desenvolvimento do React começou como uma solução interna para os problemas que o Facebook enfrentava ao construir interfaces de usuário altamente dinâmicas e interativas. O desafio era principalmente relacionado ao desempenho e à complexidade da manutenção do código.

Na época, o Facebook estava lidando com grandes volumes de dados em tempo real, especialmente em componentes como o feed de notícias. A abordagem tradicional para manipular o Document Object Model (DOM) diretamente estava se mostrando ineficiente e difícil de gerenciar à medida que as interfaces se tornavam mais complexas.

Antes de ser conhecido como React, a biblioteca foi inicialmente chamada de FaxJS. Jordan Walke desenvolveu essa primeira versão experimental que utilizava o conceito de um DOM virtual para otimizar as atualizações da interface de usuário. Esse conceito de Virtual DOM foi um dos principais diferenciais que ajudou a melhorar drasticamente a performance das aplicações web.

Em 2013, o Facebook decidiu liberar o React como um projeto de código aberto durante a conferência JSConf US. O lançamento público trouxe grande interesse da comunidade de desenvolvedores devido à abordagem inovadora do React para construir interfaces de usuário.

Após o lançamento, a popularidade do React cresceu rapidamente. A simplicidade e a eficiência do paradigma declarativo, combinadas com a modularidade dos componentes, fizeram com que grandes empresas e desenvolvedores individuais adotassem o React para seus projetos.  O Facebook, que continua a manter e desenvolver o React, usa a biblioteca em seus produtos principais, incluindo Facebook, Instagram e WhatsApp. Outras grandes empresas como Netflix, Airbnb e Uber também adotaram o React.

---

## 1.4 Virtual DOM (Document Object Model)

O Virtual DOM (Document Object Model) é uma das inovações centrais do React, projetada para otimizar a atualização de interfaces de usuário e melhorar o desempenho de aplicações web (ROLDÁN, 2021). Para entender o Virtual DOM, é útil primeiro compreender o DOM real e os desafios associados à manipulação direta do DOM.

---

## 1.4.1 O Que é o DOM Real?

O DOM é uma representação estruturada dos elementos de uma página web, que permite ao JavaScript interagir e manipular o conteúdo da página (W3SCHOOLS, 2024). Cada elemento HTML é representado como um nó em uma árvore de objetos, e o navegador usa essa estrutura para renderizar a interface de usuário. Por exemplo, considere no quadro abaixo, o código para desenvolvimento de uma tabela HTML:

```html
<table>
    <tbody>
    <tr>
      <td>Shady Grove</td>
      <td>Aeolian</td>
    </tr>
    <tr>
      <td>Over the River, Charlie</td>
      <td>Dorian</td>
    </tr>
  </tbody>
</table>
```

Manipular o DOM diretamente pode ser lento e ineficiente, especialmente em interfaces de usuário complexas que exigem muitas atualizações dinâmicas. Toda vez que o DOM real é alterado, o navegador precisa recalcular o layout, aplicar as mudanças e renderizar novamente a interface, o que pode impactar significativamente o desempenho.

---

## 1.4.2 O que é o Virtual DOM?

O Virtual DOM é uma representação leve e abstrata do DOM real. Em vez de interagir diretamente com o DOM real, o React mantém uma cópia virtual em memória que é muito mais rápida de manipular. O Virtual DOM é simplesmente um objeto JavaScript que espelha a estrutura do DOM real.

O funcionamento do Virtual DOM no React pode ser dividido em várias fases principais. Essas fases envolvem como o React gerencia as mudanças na interface do usuário e otimiza as atualizações ao DOM real. Aqui estão as fases detalhadas:

- Renderização Inicial: Quando um componente React é renderizado pela primeira vez, o React cria um Virtual DOM que representa a estrutura da interface baseada nos componentes e estado inicial. Assim, o React converte os componentes em elementos do Virtual DOM (objetos JavaScript) que refletem a estrutura do DOM real que será renderizado pelo navegador.

- Detecção de Mudanças: Quando há uma mudança no estado ou nas props de um componente, o React cria uma nova versão do Virtual DOM que reflete essas mudanças.

- Comparação (Diffing): O React compara essa nova árvore do Virtual DOM com a versão anterior (um processo conhecido como diffing). Durante essa comparação, o React identifica exatamente quais partes da árvore do Virtual DOM foram alteradas. As mudanças podem incluir a adição, remoção ou atualização de elementos.

- Aplicação das Mudanças (Patching): Após identificar as diferenças, o React aplica apenas as mudanças necessárias ao DOM real. O React minimiza as operações de manipulação do DOM real, aplicando apenas os patches (atualizações) necessários, em vez de re-renderizar toda a árvore do DOM. Isso melhora significativamente o desempenho da aplicação.
Renderização (Commit): Finalmente, as mudanças calculadas são aplicadas ao DOM real e a interface de usuário é atualizada no navegador.

Dentre os benefícios do uso do Virtual DOM podemos destacar:

- Performance Melhorada: Manipular o Virtual DOM em memória é muito mais rápido do que manipular diretamente o DOM real. Como o React minimiza as interações diretas com o DOM, o desempenho geral da aplicação é significativamente melhorado.

- Atualizações Otimizadas: Com o Virtual DOM, o React pode garantir que apenas as partes necessárias da interface sejam atualizadas. Isso evita renderizações completas e operações de manipulação de DOM que são custosas em termos de desempenho.

- Abstração Simples: Desenvolvedores não precisam se preocupar com as complexidades de manipular o DOM real. Em vez disso, eles apenas declaram como a interface de usuário deve parecer para um determinado estado, e o React cuida de atualizar o DOM de maneira eficiente.

Embora o Virtual DOM ofereça grandes benefícios, ele não é uma solução mágica para todos os problemas de desempenho:

- Complexidade Adicional: Embora abstraia as manipulações do DOM, o Virtual DOM adiciona uma camada extra de complexidade que pode resultar em custos de processamento em situações extremas.
Renderizações Complexas: Em casos muito específicos onde há muitos elementos ou atualizações muito frequentes, o processo de diffing do Virtual DOM pode se tornar uma sobrecarga.
Seguir para...

---

## 1.5 Soluções para o Desenvolvimento em React

A equipe do React recomenda diferentes soluções para cenários específicos de desenvolvimento, considerando a versão **18.3.1** do React.

## Create React App (CRA)

O Create React App é indicado para quem está começando a aprender React ou desenvolvendo uma **Single Page Application (SPA)**. Ele oferece uma configuração inicial simplificada e um ambiente pronto para uso, permitindo foco no desenvolvimento da aplicação.

O CRA utiliza o **Webpack** como ferramenta de build, configurando automaticamente a compilação e o empacotamento de arquivos JavaScript, CSS, imagens e outros recursos do projeto.

## Vite

O Vite é uma ferramenta moderna de build criada por **Evan You**, criador do Vue.js. Seu objetivo é superar limitações de ferramentas tradicionais, como o Webpack, oferecendo maior velocidade e simplicidade.

O Vite utiliza o **Esbuild**, desenvolvido em Go, que realiza compilação, empacotamento e minificação de código JavaScript e TypeScript com alto desempenho.

## Next.js

O Next.js é recomendado para projetos que necessitam de **Server-Side Rendering (SSR)** utilizando Node.js. Ele oferece:

- Melhor SEO (Search Engine Optimization);
- Carregamento mais rápido de páginas;
- Rotas dinâmicas;
- Pré-renderização de conteúdo.

## Gatsby

O Gatsby é um framework React voltado para a criação de sites rápidos e otimizados, especialmente integrados a sistemas de gerenciamento de conteúdo (CMS).

Seu principal foco é a **Static Site Generation (SSG)**, gerando páginas estáticas durante a compilação e proporcionando excelente desempenho.

## Remix

O Remix é um framework moderno baseado em React que utiliza uma abordagem híbrida de renderização:

- **SSR (Server-Side Rendering)**
- **CSR (Client-Side Rendering)**

Essa combinação permite a criação de aplicações performáticas e dinâmicas.

## Expo

O Expo é um framework para desenvolvimento mobile com React Native. Ele simplifica a criação de aplicativos para Android e iOS, reduzindo a necessidade de configurações complexas ou conhecimentos avançados das plataformas nativas.

## SPA, Empacotamento e Transpilação

Neste curso serão desenvolvidas **Single Page Applications (SPA)**.

Uma SPA carrega uma única página HTML e atualiza seu conteúdo dinamicamente conforme o usuário interage com a aplicação.

Para esse cenário, as opções mais adequadas são:

- Create React App
- Vite

Ambas utilizam processos de **empacotamento (bundling)** e **transpilação**.

### Empacotamento (Bundling)

Empacotamento é o processo de combinar vários arquivos JavaScript, CSS e outros recursos em um ou mais arquivos chamados **bundles**.

Benefícios:

- Redução de requisições ao servidor;
- Melhor desempenho da aplicação;
- Organização do código em múltiplos arquivos sem impacto negativo no carregamento.

### Transpilação

Transpilação é o processo de converter código escrito em versões modernas do JavaScript (ES6+) ou em outras linguagens, como TypeScript, para versões compatíveis com diferentes navegadores.

---

## 1.5.1 Create React App

O **Create React App (CRA)** é uma ferramenta oficial desenvolvida pela equipe do React para facilitar a criação de aplicações React.

Ele fornece uma configuração pronta para uso, abstraindo ferramentas como:

- Webpack
- Babel
- ESLint

## Transpilação com Babel

O CRA utiliza o **Babel** para converter:

- JSX;
- Recursos modernos do JavaScript (ES6+);
- Arrow Functions;
- Async/Await;
- Destructuring;

em versões compatíveis com navegadores mais antigos.

Isso garante maior compatibilidade entre diferentes ambientes.

## Compilação e Empacotamento com Webpack

O CRA utiliza o **Webpack** como bundler.

Suas funções incluem:

- Analisar dependências do projeto;
- Criar gráficos de dependência;
- Empacotar JavaScript, CSS, imagens e fontes;
- Gerar bundles otimizados para produção.

Durante o desenvolvimento, o Webpack utiliza **Hot Module Replacement (HMR)** para atualizar módulos sem recarregar toda a página.

Além disso, um servidor de desenvolvimento monitora alterações no código e recompila os arquivos automaticamente.

## Limitações

Embora simplifique bastante o desenvolvimento, o Webpack realiza a compilação antecipada de todo o projeto.

Isso significa que, a cada alteração no código, grandes partes da aplicação podem precisar ser recompiladas, resultando em tempos de build mais longos.

---

## 1.5.2 Vite

O **Vite** é uma ferramenta moderna de build para aplicações front-end criada por Evan You.

Seu objetivo é substituir ferramentas tradicionais, como o Webpack, oferecendo um processo de desenvolvimento muito mais rápido.

## Transpilação com Esbuild

O Vite utiliza o **Esbuild**, escrito em Go.

Suas principais características:

- Compilação extremamente rápida;
- Suporte a JavaScript moderno (ES6+);
- Suporte a JSX;
- Desempenho superior ao Babel em velocidade.

## Compilação e Empacotamento

O Vite adota uma estratégia híbrida.

### Durante o desenvolvimento

Os módulos JavaScript são servidos diretamente ao navegador como **ES Modules (ESM)**.

Benefícios:

- Inicialização quase instantânea;
- Apenas os módulos necessários são carregados;
- Não há necessidade de recompilar toda a aplicação.

### Durante a produção

O Vite utiliza o **Rollup** para:

- Empacotamento;
- Minificação;
- Otimizações de desempenho.

## Hot Module Replacement (HMR)

O Vite implementa um sistema de HMR extremamente eficiente.

Quando um módulo é alterado:

- Apenas o módulo modificado é recompilado;
- Não é necessário recarregar toda a página;
- A atualização é praticamente instantânea.

Essa eficiência é possível graças ao uso nativo dos **ECMAScript Modules (ESM)**.

## Conclusão

Comparado ao Create React App, o Vite oferece:

- Inicialização mais rápida;
- Compilações mais rápidas;
- Melhor experiência durante o desenvolvimento;
- Menor consumo de recursos.

Por esses motivos, este curso utiliza o **Vite** como ferramenta principal para desenvolvimento de aplicações React.

Criar um projeto vite: `npm create vite@latest`
