package controller;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Beans.Usuario;
import util.ConnectionFactory;
import util.JsonResponse;
import util.ValidationUtil;
import dao.UsuarioDAO;

/**
 * POST /DevSql
 *
 * Backend do "Terminal SQL" que aparece na Área de DEV Vip da tela de
 * Perfil (PerfilPage.jsx). Este é o backend PRINCIPAL do projeto, então
 * essa funcionalidade tem que existir aqui - a versão em
 * roleta-russa-backend-node/src/routes/dev.js é só o espelho de estudo.
 *
 * Body esperado (JSON): {"usuarioId": "3", "sql": "SELECT * FROM usuarios"}
 *
 * ====================== AVISO DE SEGURANÇA ======================
 * Executar SQL arbitrário vindo do cliente é perigoso por natureza - é
 * literalmente um "SQL Injection de propósito", já que o próprio texto
 * digitado pela pessoa DEV vira o comando executado no banco. Isso só é
 * aceitável neste projeto porque:
 *   1. Ele roda 100% local, nada exposto na internet;
 *   2. O acesso exige cargo = 'DEV', verificado aqui no SERVIDOR (nunca
 *      confie só na checagem que o React faz na tela - qualquer pessoa
 *      pode abrir o DevTools e "forjar" esse valor no front-end);
 *   3. O objetivo é aprender como um painel administrativo simples se
 *      conecta direto no banco - não é uma feature pensada pra produção.
 * Se este projeto algum dia for exposto publicamente, ESTE SERVLET DEVE
 * SER REMOVIDO (ou protegido por autenticação forte + rede interna).
 * ==================================================================
 */
@WebServlet("/DevSql")
public class DevSqlServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		request.setCharacterEncoding("UTF-8");

		// [SEGURANÇA] Este endpoint executa SQL arbitrário e ficou acessível
		// publicamente quando o backend foi implantado no Render - a checagem
		// de cargo == "DEV" abaixo protege quem pode USAR o terminal, mas não
		// impede que o endpoint em si seja descoberto e sondado por qualquer
		// pessoa na internet. Por isso ele agora também exige que a variável
		// de ambiente ENABLE_DEV_SQL esteja setada como "true" no servidor.
		// Em produção (Render), NÃO defina essa variável - o servlet responde
		// 404 (não 403, para não revelar nem que a rota existe). Em
		// desenvolvimento local, defina ENABLE_DEV_SQL=true no seu .env.
		if (!devSqlHabilitado()) {
			response.sendError(HttpServletResponse.SC_NOT_FOUND);
			return;
		}

		// O corpo chega como JSON (e não como application/x-www-form-urlencoded,
		// diferente dos outros servlets), então lemos e parseamos manualmente.
		StringBuilder corpo = new StringBuilder();
		try (var reader = request.getReader()) {
			String linha;
			while ((linha = reader.readLine()) != null) {
				corpo.append(linha);
			}
		}

		String usuarioId;
		String sql;
		try {
			JsonObject json = JsonParser.parseString(corpo.toString()).getAsJsonObject();
			usuarioId = json.has("usuarioId") ? json.get("usuarioId").getAsString() : null;
			sql = json.has("sql") ? json.get("sql").getAsString() : null;
		} catch (Exception e) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST, "Corpo JSON inválido.");
			return;
		}

		if (ValidationUtil.isBlank(usuarioId) || ValidationUtil.isBlank(sql)) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Campos 'usuarioId' e 'sql' são obrigatórios.");
			return;
		}

		// Confirma no banco (não confia no front-end) que o usuário é DEV.
		UsuarioDAO usuarioDAO = new UsuarioDAO();
		Usuario usuario = usuarioDAO.buscarPorId(usuarioId);
		if (usuario == null || !"DEV".equals(usuario.getCargo())) {
			JsonResponse.error(response, HttpServletResponse.SC_FORBIDDEN,
					"Acesso negado: apenas usuários com cargo DEV podem usar o terminal SQL.");
			return;
		}

		// Bloqueia múltiplos comandos separados por ";" numa única chamada -
		// reduz o risco de colar um script inteiro sem querer.
		String[] comandos = sql.split(";");
		int comandosNaoVazios = 0;
		String comandoUnico = null;
		for (String c : comandos) {
			if (!c.trim().isEmpty()) {
				comandosNaoVazios++;
				comandoUnico = c.trim();
			}
		}
		if (comandosNaoVazios > 1) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Execute um comando SQL por vez (sem ';' entre comandos).");
			return;
		}
		if (comandosNaoVazios == 0) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST, "Comando SQL vazio.");
			return;
		}

		long inicio = System.currentTimeMillis();
		boolean ehSelect = comandoUnico.trim().toUpperCase().startsWith("SELECT")
				|| comandoUnico.trim().toUpperCase().startsWith("SHOW")
				|| comandoUnico.trim().toUpperCase().startsWith("DESCRIBE");

		try (Connection conn = ConnectionFactory.getConnection()) {
			if (ehSelect) {
				try (PreparedStatement stmt = conn.prepareStatement(comandoUnico);
						ResultSet rs = stmt.executeQuery()) {
					ResultSetMetaData meta = rs.getMetaData();
					int colunas = meta.getColumnCount();
					List<String> nomesColunas = new ArrayList<>();
					for (int i = 1; i <= colunas; i++) {
						nomesColunas.add(meta.getColumnLabel(i));
					}

					List<Map<String, Object>> linhas = new ArrayList<>();
					while (rs.next()) {
						Map<String, Object> linha = new LinkedHashMap<>();
						for (int i = 1; i <= colunas; i++) {
							linha.put(nomesColunas.get(i - 1), converterValorParaJson(rs.getObject(i)));
						}
						linhas.add(linha);
					}

					JsonObject resultado = new JsonObject();
					resultado.addProperty("tipo", "select");
					resultado.add("colunas", util.JsonResponse.toJsonElement(nomesColunas));
					resultado.add("linhas", util.JsonResponse.toJsonElement(linhas));
					resultado.addProperty("totalLinhas", linhas.size());
					resultado.addProperty("duracaoMs", System.currentTimeMillis() - inicio);
					JsonResponse.ok(response, resultado);
				}
			} else {
				try (Statement stmt = conn.createStatement()) {
					int linhasAfetadas = stmt.executeUpdate(comandoUnico);
					JsonObject resultado = new JsonObject();
					resultado.addProperty("tipo", "escrita");
					resultado.addProperty("linhasAfetadas", linhasAfetadas);
					resultado.addProperty("duracaoMs", System.currentTimeMillis() - inicio);
					JsonResponse.ok(response, resultado);
				}
			}
		} catch (SQLException e) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Erro ao executar SQL: " + e.getMessage());
		}
	}

	/**
	 * Colunas DATETIME/DATE/TIME do MySQL chegam via {@code rs.getObject(i)}
	 * como {@code java.time.LocalDateTime}/{@code LocalDate}/{@code LocalTime}
	 * (não como String). O Gson "puro" usado em {@link util.JsonResponse}
	 * (sem TypeAdapter customizado) serializa objetos desconhecidos via
	 * reflection nos campos privados deles - e o Java 17 bloqueia esse
	 * acesso por padrão (o módulo java.base não abre java.time pro
	 * classloader da aplicação), lançando InaccessibleObjectException e
	 * derrubando a requisição inteira com 500.
	 *
	 * Convertendo aqui pra String evita esse problema pra qualquer tabela/
	 * coluna de data, sem precisar configurar um Gson customizado só pra
	 * este endpoint. BLOBs (byte[]) também são tratados, já que exibir
	 * bytes crus como número por número não ajudaria em nada no terminal.
	 */
	private static Object converterValorParaJson(Object valor) {
		if (valor instanceof java.time.temporal.Temporal) {
			return valor.toString(); // ex: "2026-07-13T09:12:56"
		}
		if (valor instanceof byte[] bytes) {
			return "<binário: " + bytes.length + " bytes>";
		}
		return valor;
	}

	/**
	 * Lê ENABLE_DEV_SQL priorizando variável de ambiente real do sistema
	 * (Docker/Render) e caindo para o .env do classpath (Eclipse local),
	 * igual ao padrão já usado em {@link util.ConnectionFactory}. Qualquer
	 * valor diferente de "true" (case-insensitive) mantém o endpoint
	 * desativado - o padrão é sempre seguro (desligado).
	 */
	private static boolean devSqlHabilitado() {
		String valor = System.getenv("ENABLE_DEV_SQL");
		if (valor == null || valor.isBlank()) {
			valor = util.EnvLoader.get("ENABLE_DEV_SQL");
		}
		return "true".equalsIgnoreCase(valor != null ? valor.trim() : null);
	}
}