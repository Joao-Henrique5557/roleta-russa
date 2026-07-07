package controller;

import java.io.IOException;

import com.google.gson.JsonObject;

import dao.UsuarioDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Beans.Usuario;
import util.JsonResponse;
import util.ValidationUtil;

@WebServlet("/AutenticarServlet")
public class AutenticarServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		request.setCharacterEncoding("UTF-8");

		// Aceita "usuario", "login" ou "email" como chave do identificador enviado
		// pelo formulário do React (compatibilidade com o front-end existente)
		String loginInformado = request.getParameter("usuario");
		if (loginInformado == null) {
			loginInformado = request.getParameter("login");
		}
		if (loginInformado == null) {
			loginInformado = request.getParameter("email");
		}

		String senhaInformada = request.getParameter("senha");

		if (ValidationUtil.isBlank(loginInformado) || ValidationUtil.isBlank(senhaInformada)) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Usuário/E-mail e senha são obrigatórios.");
			return;
		}

		UsuarioDAO dao = new UsuarioDAO();
		Usuario usuario = dao.autenticar(loginInformado.trim(), senhaInformada);

		if (usuario == null) {
			JsonResponse.error(response, HttpServletResponse.SC_UNAUTHORIZED,
					"Usuário ou senha incorretos.");
			return;
		}

		JsonObject json = new JsonObject();
		json.addProperty("id", usuario.getId());
		json.addProperty("nome", usuario.getNome());
		json.addProperty("email", usuario.getEmail());
		json.addProperty("pontos", usuario.getPoints());
		json.addProperty("dataCadastro", usuario.getDataCadastro() != null ? usuario.getDataCadastro() : "");
		json.addProperty("cargo", usuario.getCargo() != null ? usuario.getCargo() : "usuario");

		JsonResponse.ok(response, json);
	}

	@Override
	protected void doOptions(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.setStatus(HttpServletResponse.SC_OK);
	}
}
