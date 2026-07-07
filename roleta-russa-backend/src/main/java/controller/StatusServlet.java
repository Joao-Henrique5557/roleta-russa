package controller;

import java.io.IOException;

import com.google.gson.JsonObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import util.ConnectionFactory;
import util.JsonResponse;

/**
 * GET /Status
 *
 * Endpoint de diagnóstico rápido: "o backend subiu? o MySQL conectou?" sem
 * precisar interpretar um 500 de outro endpoint. Útil especialmente depois
 * de trocar a senha do banco ou mudar de ambiente (Docker vs Eclipse local).
 */
@WebServlet("/Status")
public class StatusServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		JsonObject json = new JsonObject();
		json.addProperty("status", "ok");
		json.addProperty("service", "roleta-russa-backend");

		boolean bancoConectado = ConnectionFactory.testarConexao();
		json.addProperty("bancoConectado", bancoConectado);

		if (!bancoConectado) {
			json.addProperty("bancoErro",
					"Não foi possível conectar ao MySQL. Verifique se o serviço está rodando, "
							+ "se o database 'roleta_russa' foi criado (db/schema.sql) e se as "
							+ "variáveis DB_URL / DB_USER / DB_PASSWORD estão corretas.");
		}

		JsonResponse.ok(response, json);
	}
}
