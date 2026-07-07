package controller;

import java.io.IOException;
import java.util.List;

import dao.UsuarioDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Beans.Usuario;
import util.JsonResponse;

@WebServlet("/ListarUsuarios")
public class ListarUsuarios extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		UsuarioDAO dao = new UsuarioDAO();
		List<Usuario> usuarios = dao.listarTodos(); // já vem sem o hash da senha
		JsonResponse.ok(response, usuarios);
	}
}
