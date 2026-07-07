package util;

import java.io.IOException;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Centraliza a montagem de respostas JSON dos servlets. Antes, cada servlet
 * escrevia strings JSON "na mão" (out.write("{\"error\": \"...\"}")), o que é
 * frágil (fácil de gerar JSON inválido com aspas/acentos) e inconsistente.
 *
 * Com isso, todo endpoint devolve sempre o mesmo formato:
 *   sucesso: {"data": ...}
 *   erro:    {"error": "mensagem"}
 */
public final class JsonResponse {

	private static final Gson GSON = new Gson();

	private JsonResponse() {
	}

	public static void error(HttpServletResponse response, int statusCode, String mensagem) throws IOException {
		response.setStatus(statusCode);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		JsonObject json = new JsonObject();
		json.addProperty("error", mensagem);
		response.getWriter().write(GSON.toJson(json));
	}

	public static void message(HttpServletResponse response, int statusCode, String mensagem) throws IOException {
		response.setStatus(statusCode);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		JsonObject json = new JsonObject();
		json.addProperty("message", mensagem);
		response.getWriter().write(GSON.toJson(json));
	}

	public static void ok(HttpServletResponse response, Object data) throws IOException {
		response.setStatus(HttpServletResponse.SC_OK);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(GSON.toJson(data));
	}
}
