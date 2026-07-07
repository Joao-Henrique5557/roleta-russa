# ---------- Etapa 1: build do .war com Maven ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- Etapa 2: runtime com Tomcat ----------
FROM tomcat:10-jdk17-openjdk-slim

RUN rm -rf /usr/local/tomcat/webapps/*

# ROOT.war faz o projeto responder na raiz do domínio (ex: Render)
COPY --from=build /app/target/roleta-russa-backend.war /usr/local/tomcat/webapps/ROOT.war

# Credenciais do banco NÃO vão dentro da imagem - configure DB_URL / DB_USER /
# DB_PASSWORD como variáveis de ambiente (veja docker-compose.yml na raiz).

EXPOSE 8080
CMD ["catalina.sh", "run"]
