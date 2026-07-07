package controller;

import java.io.IOException;

import dao.UsuarioDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Beans.Usuario;
import util.JsonResponse;
import util.ValidationUtil;

/**
 * Novo endpoint: GET /BuscarUsuario?id=xxx
 *
 * A página de Perfil do front-end hoje lê tudo direto do localStorage, que
 * fica desatualizado assim que o usuário ganha pontos em outra aba/sessão.
 * Esse endpoint permite buscar os dados atuais do usuário direto do
 * MySQL quando a página de Perfil carregar.
 */
@WebServlet("/BuscarUsuario")
public class BuscarUsuario extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String id = request.getParameter("id");

		if (ValidationUtil.isBlank(id)) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST, "Parâmetro 'id' é obrigatório.");
			return;
		}

		UsuarioDAO dao = new UsuarioDAO();
		Usuario usuario = dao.buscarPorId(id.trim());

		if (usuario == null) {
			JsonResponse.error(response, HttpServletResponse.SC_NOT_FOUND, "Usuário não encontrado.");
			return;
		}

		JsonResponse.ok(response, usuario);
	}
}
