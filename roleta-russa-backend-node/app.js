// app.js
//
// Ponto central do Express. Igual ao web.xml + os @WebServlet/@WebFilter
// do backend Java: aqui é onde "plugamos" cada rota (equivalente a cada
// Servlet) e cada middleware (equivalente a um Filter, como o
// CorsFilter.java).
"use strict";

require("dotenv").config(); // lê o .env (se existir) ANTES de tudo que depende dele

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var indexRouter = require("./routes/index");
var statusRouter = require("./src/routes/status");
var usuariosRouter = require("./src/routes/usuarios");
var novidadesRouter = require("./src/routes/novidades");
var devRouter = require("./src/routes/dev");

var app = express();

// view engine setup (mantido do scaffold original, não usado pelas rotas de API)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));

// ---- CORS ----
// Equivalente ao CorsFilter.java: libera o front-end (localhost:5173 em
// dev) a chamar esta API a partir de outra origem/porta. Sem isso, o
// navegador bloqueia a resposta por política de mesma origem.
var allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map(function (s) { return s.trim(); })
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // requisições sem "origin" (ex: curl, apps mobile) são sempre liberadas
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error("Origem não permitida pelo CORS: " + origin));
    },
  }),
);

app.use(express.json()); // corpo JSON (usado pelo terminal SQL, por exemplo)
app.use(express.urlencoded({ extended: false })); // corpo application/x-www-form-urlencoded (usado pelo front, via axios+URLSearchParams)
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ---- Rotas de API (equivalentes aos Servlets do backend Java) ----
app.use("/", statusRouter); // GET /Status
app.use("/", usuariosRouter); // /CadastrarServlet, /AutenticarServlet, /ListarUsuarios, /BuscarUsuario, /GanharPontos
app.use("/", novidadesRouter); // /ListarNovidades, /CadastrarNovidade

app.use("/", indexRouter); // rota "/" original do scaffold (só uma página informativa)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Para rotas de API (tudo que não seja "/"), devolvemos JSON em vez da
  // página de erro do Jade - é o que o front-end (axios) espera.
  if (req.path !== "/") {
    return res.status(err.status || 500).json({ error: err.message || "Erro interno." });
  }

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
