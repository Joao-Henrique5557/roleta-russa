package controller;

import java.io.IOException;
import java.util.Set;

import dao.FeedbackDAO;
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
 * POST /ModerarFeedback
 * Body: usuarioId (de quem está moderando, precisa ser cargo DEV),
 *       feedbackId, acao ("status" ou "ocultar"), status? (se acao="status")
 *
 * Fluxo simples de moderação para denúncias/comentários: um usuário DEV
 * pode mudar o status (ABERTO/EM_ANALISE/RESOLVIDO/ARQUIVADO) ou ocultar
 * (soft delete) um feedback problemático. Segue o mesmo padrão de
 * verificação de cargo do DevSqlServlet - nunca confia no front-end,
 * sempre confirma no banco.
 */
@WebServlet("/ModerarFeedback")
public class ModerarFeedback extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private static final Set<String> STATUS_VALIDOS =
			Set.of("ABERTO", "EM_ANALISE", "RESOLVIDO", "ARQUIVADO");

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		request.setCharacterEncoding("UTF-8");

		String usuarioId = request.getParameter("usuarioId");
		String feedbackId = request.getParameter("feedbackId");
		String acao = request.getParameter("acao");
		String status = request.getParameter("status");

		if (ValidationUtil.isBlank(usuarioId) || ValidationUtil.isBlank(feedbackId) || ValidationUtil.isBlank(acao)) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Campos 'usuarioId', 'feedbackId' e 'acao' são obrigatórios.");
			return;
		}

		UsuarioDAO usuarioDAO = new UsuarioDAO();
		Usuario usuario = usuarioDAO.buscarPorId(usuarioId);
		if (usuario == null || !"DEV".equals(usuario.getCargo())) {
			JsonResponse.error(response, HttpServletResponse.SC_FORBIDDEN,
					"Acesso negado: apenas usuários com cargo DEV podem moderar feedbacks.");
			return;
		}

		FeedbackDAO dao = new FeedbackDAO();
		boolean sucesso;

		switch (acao) {
			case "status" -> {
				if (ValidationUtil.isBlank(status) || !STATUS_VALIDOS.contains(status.trim().toUpperCase())) {
					JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
							"Campo 'status' deve ser ABERTO, EM_ANALISE, RESOLVIDO ou ARQUIVADO.");
					return;
				}
				sucesso = dao.atualizarStatus(feedbackId, status.trim().toUpperCase());
			}
			case "ocultar" -> sucesso = dao.desativar(feedbackId);
			default -> {
				JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
						"Campo 'acao' deve ser 'status' ou 'ocultar'.");
				return;
			}
		}

		if (sucesso) {
			JsonResponse.message(response, HttpServletResponse.SC_OK, "Feedback atualizado.");
		} else {
			JsonResponse.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
					"Não foi possível atualizar o feedback (id inexistente ou erro no MySQL).");
		}
	}
}
