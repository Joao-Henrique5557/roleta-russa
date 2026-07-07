package controller;

import java.io.IOException;

import dao.UsuarioDAO;
import dao.UsuarioDAO.ResultadoCadastro;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Beans.Usuario;
import util.JsonResponse;
import util.ValidationUtil;

@WebServlet("/CadastrarServlet")
public class CadastrarServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		request.setCharacterEncoding("UTF-8");

		String nomeDado = request.getParameter("nome");
		String emailDado = request.getParameter("email");
		String senhaDada = request.getParameter("senha");

		if (!ValidationUtil.isValidNome(nomeDado)) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Nome inválido. Use entre 2 e 60 caracteres.");
			return;
		}
		if (!ValidationUtil.isValidEmail(emailDado)) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"E-mail inválido.");
			return;
		}
		if (!ValidationUtil.isValidSenha(senhaDada)) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Senha muito curta (mínimo 4 caracteres).");
			return;
		}

		Usuario user = new Usuario();
		user.setNome(nomeDado.trim());
		user.setEmail(emailDado.trim());
		user.setSenha(senhaDada); // o DAO transforma em hash antes de salvar
		user.setPoints(0);

		UsuarioDAO dao = new UsuarioDAO();
		ResultadoCadastro resultado = dao.inserirUsuario(user);

		switch (resultado) {
			case SUCESSO -> JsonResponse.message(response, HttpServletResponse.SC_CREATED,
					"Usuário cadastrado com sucesso!");
			case EMAIL_DUPLICADO -> JsonResponse.error(response, HttpServletResponse.SC_CONFLICT,
					"Não foi possível cadastrar. Esse e-mail já pode estar em uso.");
			case ERRO_INTERNO -> JsonResponse.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
					"Erro interno ao cadastrar. Verifique os logs do servidor "
							+ "(provável falha de conexão com o MySQL).");
		}
	}
}
