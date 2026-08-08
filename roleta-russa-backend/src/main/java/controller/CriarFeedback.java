package controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Set;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import dao.FeedbackDAO;
import model.Beans.Feedback;
import util.JsonResponse;
import util.ValidationUtil;

/**
 * POST /CriarFeedback
 * Body (application/x-www-form-urlencoded): tipo, mensagem, autor?, usuarioId?
 *
 * Recebe um comentário, sugestão ou denúncia enviado por um jogador (logado
 * ou convidado). Substitui o antigo POST /CadastrarNovidade.
 */
@WebServlet("/CriarFeedback")
public class CriarFeedback extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private static final Set<String> TIPOS_VALIDOS = Set.of("COMENTARIO", "SUGESTAO", "DENUNCIA");
	private static final int TAMANHO_MAXIMO_MENSAGEM = 2000;

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		request.setCharacterEncoding("UTF-8");

		String tipo = request.getParameter("tipo");
		String mensagem = request.getParameter("mensagem");
		String autor = request.getParameter("autor");
		String usuarioId = request.getParameter("usuarioId");

		if (ValidationUtil.isBlank(tipo) || !TIPOS_VALIDOS.contains(tipo.trim().toUpperCase())) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Campo 'tipo' deve ser COMENTARIO, SUGESTAO ou DENUNCIA.");
			return;
		}
		if (ValidationUtil.isBlank(mensagem)) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Campo 'mensagem' é obrigatório.");
			return;
		}
		if (mensagem.trim().length() > TAMANHO_MAXIMO_MENSAGEM) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Mensagem muito longa (máximo " + TAMANHO_MAXIMO_MENSAGEM + " caracteres).");
			return;
		}

		Feedback feedback = new Feedback();
		feedback.setTipo(tipo.trim().toUpperCase());
		feedback.setMensagem(mensagem.trim());
		feedback.setAutor(!ValidationUtil.isBlank(autor) ? autor.trim() : "Anônimo");
		feedback.setUsuarioId(!ValidationUtil.isBlank(usuarioId) ? usuarioId.trim() : null);
		feedback.setDataCriacao(LocalDateTime.now());

		FeedbackDAO dao = new FeedbackDAO();
		boolean sucesso = dao.cadastrar(feedback);

		if (sucesso) {
			String mensagemSucesso = "DENUNCIA".equals(feedback.getTipo())
					? "Denúncia enviada. Nossa equipe vai analisar em breve."
					: "Obrigado pelo feedback!";
			JsonResponse.message(response, HttpServletResponse.SC_CREATED, mensagemSucesso);
		} else {
			JsonResponse.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
					"Erro ao salvar no banco de dados.");
		}
	}
}
