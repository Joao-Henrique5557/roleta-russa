package controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSerializer;

import dao.FeedbackDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Beans.Feedback;

/**
 * GET /ListarFeedbacks
 * GET /ListarFeedbacks?tipo=COMENTARIO|SUGESTAO|DENUNCIA
 *
 * Lista os comentários/sugestões/denúncias mais recentes enviados pelos
 * jogadores. Substitui o antigo GET /ListarNovidades.
 */
@WebServlet("/ListarFeedbacks")
public class ListarFeedbacks extends HttpServlet {
	private static final long serialVersionUID = 1L;

	// Igual ao antigo ListarNovidades: Gson não serializa java.time.LocalDateTime
	// nativamente, então registramos um adaptador simples pra ISO-8601.
	private final Gson gson = new GsonBuilder()
			.registerTypeAdapter(LocalDateTime.class,
					(JsonSerializer<LocalDateTime>) (src, typeOfSrc, context) ->
							src == null ? null : new com.google.gson.JsonPrimitive(src.toString()))
			.create();

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");

		String tipo = request.getParameter("tipo");

		FeedbackDAO dao = new FeedbackDAO();
		List<Feedback> feedbacks = dao.listar(tipo);

		response.getWriter().write(gson.toJson(feedbacks));
	}
}
