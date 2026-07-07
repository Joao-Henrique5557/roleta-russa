# Guia Completo: Roleta Russa (Frontend + Backend + MySQL local)

Este projeto é composto por:

- **Backend**: Java/Jakarta EE (Servlets) + MySQL, empacotado como `.war`
- **Frontend**: React/Vite, SPA interativo
- **Banco de dados**: MySQL rodando localmente na sua máquina

Tudo pensado para **desenvolvimento 100% local** — sem contas em nuvem, sem
credenciais de serviços de terceiros, sem deploy hospedado.

## 1. Configurar o MySQL local

### Passo 1: Instalar o MySQL

Baixe e instale o MySQL Community Server para o seu sistema operacional:
[dev.mysql.com/downloads](https://dev.mysql.com/downloads/mysql/).
Durante a instalação, defina uma senha para o usuário `root` (ou deixe em
branco, se preferir — o projeto funciona com qualquer um dos dois, só
precisa configurar depois).

Confirme que o serviço está rodando:

```bash
mysql -u root -p -e "SELECT VERSION();"
```

### Passo 2: Criar o banco e as tabelas

Na raiz do projeto:

```bash
mysql -u root -p < db/schema.sql
```

Isso cria o database `roleta_russa` com as tabelas `usuarios` e
`novidades` (veja `db/schema.sql` para o schema completo). Rode esse
comando só uma vez — ele usa `CREATE TABLE IF NOT EXISTS`, então é seguro
rodar de novo sem apagar dados existentes.

### Passo 3: Configurar as credenciais (só se necessário)

Por padrão, o backend assume `usuário root, sem senha, em localhost:3306`.
Se o seu MySQL usa outro usuário/senha, copie `.env.example` para `.env`
na raiz do projeto e ajuste:

```bash
cp .env.example .env
```

```env
DB_URL=jdbc:mysql://localhost:3306/roleta_russa?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USER=root
DB_PASSWORD=sua_senha_aqui
```

---

## 2. Rodando Localmente

### Opção A: Com Docker Compose (recomendado)

```bash
# 1. Clone o repositório
git clone <seu-repo>
cd roleta-russa-full

# 2. Garanta que o MySQL está rodando na sua máquina e o schema foi criado
#    (veja Seção 1 acima)

# 3. Rode tudo com o Docker Compose
docker compose up --build

# Frontend: http://localhost:5173
# Backend:  http://localhost:8080
```

> **Atenção ao comando**: use `docker compose` (sem hífen, plugin v2), não
> `docker-compose` (v1, com hífen). Veja
> [Instalando o Docker Compose v2](#instalando-o-docker-compose-v2) se seu
> sistema só tiver o v1 antigo — ele tem bugs conhecidos ao recriar
> containers (erro `KeyError: 'ContainerConfig'`) e está descontinuado.

O backend roda em container, mas o MySQL roda direto na sua máquina — o
`docker-compose.yml` já aponta para `host.docker.internal:3306` com o
`extra_hosts` necessário para isso funcionar tanto no Linux quanto no
Docker Desktop (Windows/Mac). Você não precisa mudar nada, a menos que
tenha alterado usuário/senha do MySQL (veja Seção 1, Passo 3).

Quando você alterar um `Dockerfile` (por exemplo, trocar a versão do Node),
sempre rebuilde sem cache antes de subir de novo:

```bash
docker compose build --no-cache frontend
docker compose up
```

### Opção B: Sem Docker (Java + Node.js locais)

#### Backend:

```bash
cd roleta-russa-backend

# 1. (Opcional) Configure variáveis de ambiente, se seu MySQL não for
#    root/sem-senha em localhost:
export DB_URL="jdbc:mysql://localhost:3306/roleta_russa?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
export DB_USER=root
export DB_PASSWORD=

# 2. Build com Maven
mvn clean package

# 3. Rode em um servidor Jakarta EE 9 (ex: Tomcat 10.0.x)
#    No Eclipse: importe como projeto Maven existente e adicione um
#    servidor Tomcat 10.0.x no "Servers" view.

# Fica disponível em http://localhost:8080
```

#### Frontend:

```bash
cd ../roleta-russa-frontend

# 1. Instale dependências (requer Node 20.19+ ou 22.12+ — veja nota abaixo)
npm install

# 2. Crie arquivo .env.local
echo "VITE_API_URL=http://localhost:8080" > .env.local

# 3. Rode dev server
npm run dev

# Fica disponível em http://localhost:5173
```

> **Nota sobre versão do Node**: o Vite 8 exige Node **20.19+ ou 22.12+**.
> Rodando com Node 18, o `vite`/`vite --host` quebra com
> `ReferenceError: CustomEvent is not defined`. Se for rodar fora do Docker,
> confirme sua versão com `node -v` antes de tudo.

---

## 3. Fluxo da Aplicação

```
Frontend (React/Vite)
    ↓
[Login/Cadastro]
    ↓
Envia credenciais
    ↓
Backend (Java/Servlets)
    ↓
ConnectionFactory abre conexão JDBC
    ↓
Query no MySQL local
    ↓
Valida e retorna usuário/token
    ↓
Frontend armazena em localStorage
    ↓
[Acesso a home, ranking, jogo, etc.]
```

## 4. Estrutura de Dados (MySQL)

Veja o schema completo em `db/schema.sql`. Resumo das tabelas:

### Tabela: `usuarios`

| Coluna          | Tipo                     | Observação                     |
| --------------- | ------------------------ | ------------------------------ |
| `id`            | INT (PK, auto increment) |                                |
| `nome`          | VARCHAR(60)              |                                |
| `email`         | VARCHAR(120)             | `UNIQUE`                       |
| `senha`         | VARCHAR(64)              | hash SHA-256, nunca texto puro |
| `pontos`        | INT                      | padrão `0`                     |
| `cargo`         | VARCHAR(30)              | padrão `'usuario'`             |
| `data_cadastro` | DATETIME                 | padrão `CURRENT_TIMESTAMP`     |

### Tabela: `novidades`

| Coluna            | Tipo                     | Observação                 |
| ----------------- | ------------------------ | -------------------------- |
| `id`              | INT (PK, auto increment) |                            |
| `titulo`          | VARCHAR(120)             |                            |
| `descricao`       | TEXT                     |                            |
| `tipo`            | VARCHAR(40)              |                            |
| `autor`           | VARCHAR(60)              | padrão `'Anônimo'`         |
| `versao`          | VARCHAR(20)              | padrão `'1.0.0'`           |
| `data_publicacao` | DATETIME                 | padrão `CURRENT_TIMESTAMP` |
| `ativo`           | BOOLEAN                  | padrão `TRUE`              |

---

## 5. Dicas de Segurança

1. **Nunca commite o `.env`** com credenciais reais do seu MySQL — o
   `.gitignore` já ignora `.env`/`.env.local` em todos os subprojetos.
2. **Senhas são hashed** — o backend nunca armazena senhas em texto puro;
   usamos SHA-256 (`PasswordUtil.java`). Para um projeto além de estudo,
   considere migrar para bcrypt ou argon2 (SHA-256 puro é rápido demais
   para hashing de senha em um cenário de ataque de força bruta).
3. **CORS** — o `CorsFilter` só libera `http://localhost:5173` por padrão.
   Ajuste conforme necessário via variável `ALLOWED_ORIGINS` (lista
   separada por vírgula) se for expor o front-end em outra porta/host
   local.

---

## 6. Troubleshooting

### `docker: unknown command: docker compose`

Seu Docker não tem o plugin Compose v2 instalado. Veja
[Instalando o Docker Compose v2](#instalando-o-docker-compose-v2) abaixo.

### `permission denied while trying to connect to the docker API`

Seu usuário do Linux não está no grupo `docker`, então precisa de `sudo` para
tudo. Resolva de vez:

```bash
sudo usermod -aG docker $USER
```

e depois **faça logout e login de novo** (ou reinicie a máquina) — o grupo só
é aplicado numa sessão nova. Confirme com:

```bash
groups
```

Se `docker` aparecer na lista, você já pode rodar sem `sudo`.

### `KeyError: 'ContainerConfig'` ao rodar `up`

Esse é um bug conhecido do `docker-compose` v1.29.2 (Python, descontinuado):
ele quebra ao tentar recriar um container cuja imagem foi reconstruída com
uma versão de base diferente. A causa raiz é usar a ferramenta antiga — a
solução é migrar para o Compose v2 (veja abaixo). Como contorno rápido, sem
migrar:

```bash
docker rm -f roleta-russa-frontend
docker-compose up
```

### `ReferenceError: CustomEvent is not defined` / `Vite requires Node.js version 20.19+`

O container do frontend está usando uma imagem `node:18-alpine`, mas o Vite
8 exige Node 20.19+ ou 22.12+. Confira o topo do `roleta-russa-frontend/Dockerfile.dev`:

```dockerfile
FROM node:22-alpine
```

Se você editar esse arquivo, sempre rebuilde **sem cache** antes de subir:

```bash
docker compose build --no-cache frontend
docker compose up
```

### `net::ERR_NAME_NOT_RESOLVED` em `backend:8080` (erro no console do navegador)

Isso acontece quando `VITE_API_URL` está configurada como `http://backend:8080`.
O nome `backend` só é resolvível **dentro da rede interna do Docker** — mas
quem faz essas chamadas de API é o seu **navegador**, rodando fora do Docker,
que não tem ideia do que é "backend".

- **Container → Container** (ex: um serviço chamando outro): usa o nome do
  serviço no Compose (`backend`, `db`, etc.)
- **Navegador (seu PC) → Container**: usa `localhost` + a porta publicada no
  `docker-compose.yml` (`http://localhost:8080`)

O `docker-compose.yml` deste projeto já vem configurado corretamente com
`VITE_API_URL: http://localhost:8080` para o frontend em modo dev.

### Backend não conecta ao MySQL

```
[ConnectionFactory] Falha ao conectar no MySQL: ...
Communications link failure
```

Checklist, nessa ordem:

1. O serviço do MySQL está rodando? (`mysql -u root -p -e "SELECT 1"` deve
   funcionar no seu terminal)
2. O database `roleta_russa` foi criado? (`mysql -u root -p < db/schema.sql`)
3. Se estiver usando Docker Compose: o container consegue alcançar
   `host.docker.internal`? No Linux, isso depende do `extra_hosts` no
   `docker-compose.yml` (já configurado) e de uma versão do Docker Engine
   recente o suficiente para suportar `host-gateway` (20.10+).
4. Usuário/senha corretos? Confira `DB_USER`/`DB_PASSWORD` no seu `.env`
   (ou nas variáveis de ambiente do Eclipse, se rodando sem Docker).

Use `GET http://localhost:8080/Status` para checar rapidamente:
`bancoConectado: true/false` e, se `false`, o campo `bancoErro` com a causa.

### `Access denied for user 'root'@'localhost'`

Sua senha do MySQL não é vazia. Defina `DB_PASSWORD` no `.env` (Docker) ou
como variável de ambiente (Eclipse/Maven local) com a senha real.

### Frontend não consegue chamar o backend (erro de CORS)

```
Erro: "CORS policy: Response to preflight request..."
```

**Solução**: ajuste `roleta-russa-backend/src/main/java/controller/CorsFilter.java`
para incluir a origem real do seu front-end, ou defina a variável de
ambiente `ALLOWED_ORIGINS` (lista separada por vírgula) sem precisar
recompilar.

### Build do Maven falha

```
Erro: "Could not find artifact ..."
```

**Solução**: certifique-se de ter Maven 3.8+ e conexão com a internet — o
`pom.xml` baixa as dependências (incluindo o driver JDBC do MySQL) do Maven
Central no primeiro build.

---

## Instalando o Docker Compose v2

Se `docker compose version` der erro de comando desconhecido, instale o
plugin oficial (funciona em qualquer distro, sem depender do gerenciador de
pacotes):

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

Instalar em `/usr/local/lib/docker/cli-plugins/` (em vez de
`~/.docker/cli-plugins/`) torna o plugin disponível para **todos os
usuários**, incluindo quando você roda com `sudo`.

Confirme:

```bash
docker compose version
```

Se aparecer `Docker Compose version v2.x.x` (ou mais recente), está pronto.
Se você tiver o `docker-compose` (v1, com hífen) instalado via `apt`, pode
removê-lo para evitar confusão entre os dois comandos:

```bash
sudo apt remove docker-compose
```

---

## 7. Próximos Passos

- [ ] Testar login/cadastro localmente
- [ ] Testar endpoints do ranking e pontos
- [ ] Implementar multiplayer (WebSocket) no backend
- [ ] Adicionar testes unitários (JUnit no backend, Vitest no frontend)

---

## Contato & Suporte

Veja os READMEs individuais:

- Backend: `roleta-russa-backend/README.md`
- Frontend: `roleta-russa-frontend/README.md`
