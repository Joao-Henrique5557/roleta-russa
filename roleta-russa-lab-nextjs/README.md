# 🧪 roleta-russa-lab-nextjs (laboratório — NÃO é produção)

Este diretório é um **laboratório separado**, sem nenhum vínculo com o
`docker-compose.yml` da raiz nem com os backends "de verdade" do projeto.
Ele existe só pra praticar **Next.js** e **Prisma** do zero, sem arriscar
quebrar nada do que já funciona (backend principal continua sendo o Java -
veja `roleta-russa-backend/README.md`).

> ⚠️ **Não rode isso em produção.** Não há autenticação, não há
> `docker-compose`, e o Prisma aqui só faz LEITURA (ranking). É só um
> playground de estudo.

## O que tem aqui

- **Prisma** (`prisma/schema.prisma`): um ORM (Object-Relational Mapper).
  Em vez de escrever SQL na mão (como o `UsuarioDAO.java` ou o
  `usuarios.js` do backend Node fazem), você descreve as tabelas como
  "modelos" TypeScript-friendly, e o Prisma gera um cliente JS tipado pra
  consultar o banco.
- **Next.js** (`pages/index.js`): framework React com **SSR**
  (Server-Side Rendering) - diferente do front-end principal (Vite +
  React puro, que roda 100% no navegador/CSR), aqui o HTML da página já
  vem PRONTO do servidor, com os dados do banco já embutidos.

## Conceitos pra comparar com o resto do projeto

| | Front-end principal (Vite) | Este laboratório (Next.js) |
|---|---|---|
| Renderização | CSR (Client-Side Rendering) - HTML vazio, JS monta tudo no navegador | SSR (Server-Side Rendering) - servidor já manda o HTML pronto |
| Acesso ao banco | Nunca direto - sempre via API (axios -> backend) | Direto, via Prisma, dentro do próprio servidor Next.js |
| Roteamento | Manual (troca de `view` em `App.jsx`) | Baseado em arquivos (`pages/index.js` = rota `/`) |

| | Acesso ao banco nos backends "de verdade" | Este laboratório |
|---|---|---|
| Java | JDBC + SQL escrito à mão (`UsuarioDAO.java`) | - |
| Node | `mysql2` + SQL escrito à mão (`usuarios.js`) | Prisma (SQL gerado automaticamente a partir do "schema") |

## Como rodar (fora do Docker, só localmente)

```bash
cd roleta-russa-lab-nextjs
cp .env.example .env          # ajuste a senha se você mudou o padrão
npm install
npx prisma generate           # gera o Prisma Client a partir do schema.prisma
npm run dev                   # abre em http://localhost:3002
```

Pré-requisito: o MySQL do `docker-compose.yml` da raiz precisa estar de pé
(`docker compose up -d db`, na raiz do projeto) - este laboratório lê da
MESMA tabela `usuarios` que os outros dois backends usam.

## Arquivos

- `prisma/schema.prisma` - descreve as tabelas `usuarios` e `novidades`
  (espelhando `db/schema.sql` da raiz do projeto).
- `lib/prisma.js` - cria UMA instância do PrismaClient e reaproveita
  entre requisições (evita o erro clássico "too many connections" que
  acontece se cada hot-reload do Next.js criar um cliente novo).
- `pages/index.js` - página que usa `getServerSideProps` (roda NO
  SERVIDOR, a cada requisição) pra buscar o ranking via Prisma e já
  renderizar a tabela pronta.
