# Backend Node.js/Express - equivalente de estudo ao backend Java, mais o
# servidor de lobby multiplayer (Socket.IO). Veja README.md desta pasta.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "./bin/www"]
