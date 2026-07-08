# Guia Completo: Roleta Russa (Frontend + Backend + MySQL)

Este projeto é composto por três serviços, **todos containerizados**:

- **Backend**: Java/Jakarta EE (Servlets) + MySQL, empacotado como `.war`
- **Frontend**: React/Vite, SPA interativo
- **Banco de dados**: MySQL, rodando em container Docker (não precisa instalar nada na sua máquina)

Zero contas em nuvem, zero credenciais de terceiros, zero instalação manual
de banco de dados. Um comando sobe o projeto inteiro.

## Pré-requisito único: Docker

Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/)
(Windows/Mac) ou o Docker Engine + Compose v2 (Linux). Confirme que está
tudo certo:

```bash
docker compose version
# precisa mostrar "Docker Compose version v2.x.x" (sem hífen no comando)
```

Se você tem `docker-compose` (com hífen, v1) em vez de `docker compose`
(sem hífen, v2), veja [Instalando o Docker Compose v2](#instalando-o-docker-compose-v2)
no fim deste guia — o v1 está descontinuado e tem bugs conhecidos.

> **Porta 3306 ocupada?** Se você já tem um MySQL instalado direto na sua
> máquina e rodando na porta padrão, vai dar conflito ao subir o container
> do banco. Pare o serviço local antes:
>
> ```bash
> sudo systemctl stop mysql      # Linux/systemd
> sudo systemctl disable mysql   # opcional: não voltar a subir sozinho no boot
> ```

## Rodando o projeto

```bash
# 1. Clone o repositório
git clone <seu-repo>
cd roleta_russa

# 2. Suba tudo (banco + backend + frontend)
docker compose up --build
```

Pronto. Na primeira vez, o container do MySQL cria o banco `roleta_russa`
e as tabelas automaticamente (usando `db/schema.sql`) — não precisa rodar
nenhum comando SQL manual.

- Frontend: **http://localhost:5173**
- Backend: **http://localhost:8080**
- Checagem rápida do banco: **http://localhost:8080/Status** → deve
  retornar `"bancoConectado": true`

Pra parar tudo: `Ctrl+C` no terminal, ou `docker compose down` em outro.
Os dados do banco persistem entre execuções (ficam num volume Docker); se
quiser resetar o banco do zero: `docker compose down -v`.

## Trocar a senha do MySQL (opcional)

Por padrão a senha é `NovaSenhaForte123!` (definida em `.env` na raiz).
Se quiser trocar, edite o `.env`:

```env
DB_PASSWORD=sua_senha_aqui
```

Se você for rodar o backend fora do Docker (seção abaixo), lembre de
atualizar a mesma senha em
`roleta-russa-backend/src/main/resources/.env` também — os dois arquivos
precisam bater.

---

## Alternativa: rodando o backend fora do Docker (Eclipse)

Se você quer debugar o backend direto no Eclipse (em vez de dentro do
container), isso também funciona, **desde que o banco continue rodando no
Docker**:

```bash
# Sobe só o banco (deixa ele rodando em background)
docker compose up -d db
```

Isso publica o MySQL em `localhost:3306`, acessível normalmente da sua
máquina. O backend já vem configurado para isso em
`roleta-russa-backend/src/main/resources/.env`:

```env
DB_URL=jdbc:mysql://localhost:3306/roleta_russa?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USER=root
DB_PASSWORD=NovaSenhaForte123!
```

No Eclipse: importe `roleta-russa-backend` como projeto Maven existente,
adicione um servidor Tomcat 10.0.x (Jakarta EE 9) no "Servers" view, e
rode. Se você editar o `.env` acima, rode **Maven → Update Project** antes
de reiniciar o servidor (senão o arquivo não entra no build).

O frontend, nesse cenário, também pode rodar fora do Docker:

```bash
cd roleta-russa-frontend
npm install
echo "VITE_API_URL=http://localhost:8080" > .env.local
npm run dev
```

> **Nota sobre versão do Node**: o Vite exige Node **20.19+ ou 22.12+**.
> Rodando com Node 18 mais antigo, `npm run dev` quebra com
> `ReferenceError: CustomEvent is not defined`. Confira com `node -v`.

---

## Fluxo da Aplicação

```
Frontend (React/Vite)
    ↓
[Login/Cadastro]
    ↓
Backend (Java/Servlets)
    ↓
ConnectionFactory abre conexão JDBC
    ↓
Query no MySQL (container "db")
    ↓
Valida e retorna usuário/token
    ↓
Frontend armazena em localStorage
```

## Estrutura de Dados (MySQL)

Veja o schema completo em `db/schema.sql`. Resumo:

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

## Dicas de Segurança

1. **Nunca commite o `.env`** com credenciais reais — o `.gitignore` já
   ignora `.env`/`.env.local` em todos os subprojetos.
2. **Senhas são hashed** — o backend nunca armazena senhas em texto puro;
   usamos SHA-256 (`PasswordUtil.java`). Além de estudo, considere migrar
   pra bcrypt/argon2 (SHA-256 puro é rápido demais contra força bruta).
3. **CORS** — o `CorsFilter` só libera `http://localhost:5173` por padrão.
   Ajuste via variável `ALLOWED_ORIGINS` (lista separada por vírgula) se
   for expor o frontend em outra porta/host local.

---

## Troubleshooting

### `port is already allocated` (porta 3306)

Você já tem um MySQL local rodando nessa porta. Pare o serviço do sistema
(`sudo systemctl stop mysql` no Linux) antes de `docker compose up`.

### `docker: unknown command: docker compose`

Falta o plugin Compose v2. Veja [Instalando o Docker Compose v2](#instalando-o-docker-compose-v2).

### `permission denied while trying to connect to the docker API`

Seu usuário não está no grupo `docker`:

```bash
sudo usermod -aG docker $USER
```

Depois **faça logout e login de novo** (o grupo só é aplicado numa sessão
nova). Confirme com `groups` — se `docker` aparecer na lista, funcionou.

### `KeyError: 'ContainerConfig'` ao rodar `up`

Bug conhecido do `docker-compose` v1 (descontinuado). Migre pro Compose v2
(abaixo). Contorno rápido sem migrar:

```bash
docker rm -f roleta-russa-frontend
docker-compose up
```

### `ReferenceError: CustomEvent is not defined` no frontend

Alguma imagem base do Node no `Dockerfile.dev` está desatualizada (precisa
Node 20.19+/22.12+). Depois de corrigir, rebuilde sem cache:

```bash
docker compose build --no-cache frontend
docker compose up
```

### Backend não conecta ao MySQL (`bancoConectado: false`)

Com o banco containerizado, isso normalmente significa que o container
`db` ainda não terminou de subir. O `docker-compose.yml` já tem um
healthcheck que faz o backend esperar o banco ficar pronto — mas na
primeira execução (criando o volume do zero) isso pode levar alguns
segundos a mais. Espera um pouco e testa `GET http://localhost:8080/Status`
de novo. Se persistir, roda `docker compose logs db` e `docker compose logs backend`
e confira as duas saídas.

### `net::ERR_NAME_NOT_RESOLVED` em `backend:8080` no console do navegador

`VITE_API_URL` está configurada como `http://backend:8080`. O nome
`backend` só é resolvível **dentro da rede interna do Docker** — quem faz
as chamadas de API é o seu **navegador**, rodando fora do Docker. O
`docker-compose.yml` deste projeto já vem correto com
`VITE_API_URL: http://localhost:8080`.

### Frontend não consegue chamar o backend (erro de CORS)

Ajuste `roleta-russa-backend/src/main/java/controller/CorsFilter.java`
para incluir a origem real do seu frontend, ou defina `ALLOWED_ORIGINS`
sem precisar recompilar.

---

## Instalando o Docker Compose v2

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
docker compose version
```

Se você tiver o `docker-compose` (v1, com hífen) instalado via `apt`, pode
removê-lo pra evitar confusão entre os dois comandos:

```bash
sudo apt remove docker-compose
```

---

## Próximos Passos

- [ ] Testar login/cadastro localmente
- [ ] Testar endpoints do ranking e pontos
- [ ] Implementar multiplayer (WebSocket) no backend
- [ ] Adicionar testes unitários (JUnit no backend, Vitest no frontend)

---

## Contato & Suporte

Veja os READMEs individuais:

- Backend: `roleta-russa-backend/README.md`
- Frontend: `roleta-russa-frontend/README.md`
