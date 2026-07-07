package controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import dao.UsuarioDAO;
import util.JsonResponse;
import util.ValidationUtil;

@WebServlet("/GanharPontos")
public class GanharPontos extends HttpServlet {
	private static final long serialVersionUID = 1L;

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		String id = request.getParameter("id");
		String forma = request.getParameter("forma");

		if (ValidationUtil.isBlank(id) || ValidationUtil.isBlank(forma)) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Parâmetros 'id' e 'forma' são obrigatórios.");
			return;
		}
		if (!"bot".equals(forma) && !"player".equals(forma)) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Parâmetro 'forma' deve ser 'bot' ou 'player'.");
			return;
		}

		UsuarioDAO dao = new UsuarioDAO();
		boolean sucesso = dao.ganharPontos(id, forma);

		if (sucesso) {
			JsonResponse.message(response, HttpServletResponse.SC_OK, "Pontos atualizados.");
		} else {
			JsonResponse.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
					"Não foi possível atualizar os pontos (id inexistente ou erro no MySQL).");
		}
	}
}
