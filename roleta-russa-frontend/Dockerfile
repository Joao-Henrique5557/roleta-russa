# ========== Build stage ==========
# Estágio 1: usa o Node só para compilar o projeto. Essa imagem inteira
# (com Node, node_modules, código-fonte) é descartada no final — só o
# resultado final (a pasta dist/) é aproveitado no estágio seguinte.
FROM node:22-alpine AS build

# Muda o diretório de trabalho para /app dentro deste estágio
WORKDIR /app

# Copia só os manifestos de dependência primeiro (aproveita cache de camadas:
# se o código mudar mas as dependências não, não precisa reinstalar tudo)
COPY package*.json ./
RUN npm install

# Copia o restante do código-fonte do projeto
COPY . .

# ARG define uma variável disponível SÓ durante o build da imagem
# (não fica disponível em runtime, diferente do ENV).
# O valor padrão aqui é só um fallback — normalmente é sobrescrito via
# "docker build --build-arg VITE_API_URL=..." na hora de gerar a imagem
# de produção de verdade.
ARG VITE_API_URL=https://seu-backend-aqui.onrender.com

# Transforma o ARG em ENV para que o Vite consiga enxergar essa variável
# durante o "npm run build" (o Vite só expõe variáveis prefixadas com
# VITE_ e precisa que elas estejam no ambiente no momento do build,
# já que ele "grava" esse valor direto no JS final — não é lido em runtime)
ENV VITE_API_URL=$VITE_API_URL

# Gera a build de produção (vite build), criando a pasta /app/dist
# com HTML/CSS/JS estáticos e otimizados
RUN npm run build


# ========== Runtime stage ==========
# Estágio 2: imagem final, muito mais enxuta. Não tem Node, não tem
# node_modules, não tem código-fonte — só o nginx e os arquivos estáticos.
FROM nginx:alpine

# Copia apenas a pasta "dist" gerada no estágio "build" (identificado pelo
# nome "AS build" lá em cima) para a pasta padrão que o nginx serve.
# Essa é a grande vantagem do multi-stage build: a imagem final não carrega
# nada do processo de compilação, só o resultado.
COPY --from=build /app/dist /usr/share/nginx/html

# Substitui a configuração padrão do nginx pela configuração customizada
# do projeto (roleta-russa-frontend/nginx.conf), que define coisas como
# cache de arquivos estáticos e o fallback de rotas para SPA
# (try_files $uri $uri/ /index.html — necessário porque é uma SPA React
# com rotas controladas via JS, não arquivos físicos)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Porta que o serviço vai ficar (documentação — quem realmente publica é
# o "-p" no docker run ou "ports:" no docker-compose.yml)
EXPOSE 80

# Comando executado ao ligar o container: inicia o nginx mantendo-o em
# primeiro plano (daemon off), para que o Docker não encerre o container
# achando que o processo "terminou"
CMD ["nginx", "-g", "daemon off;"]