package controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSerializer;

import dao.NovidadeDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Beans.Novidade;

@WebServlet("/ListarNovidades")
public class ListarNovidades extends HttpServlet {
	private static final long serialVersionUID = 1L;

	// Gson não serializa java.time.LocalDateTime nativamente, então
	// registramos um adaptador simples que converte para ISO-8601.
	private final Gson gson = new GsonBuilder()
			.registerTypeAdapter(LocalDateTime.class,
					(JsonSerializer<LocalDateTime>) (src, typeOfSrc, context) ->
							src == null ? null : new com.google.gson.JsonPrimitive(src.toString()))
			.create();

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");

		NovidadeDAO dao = new NovidadeDAO();
		List<Novidade> novidades = dao.listarTodas();

		response.getWriter().write(gson.toJson(novidades));
	}
}
