package controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Beans.Novidade;
import java.io.IOException;
import java.time.LocalDateTime;
import dao.NovidadeDAO;
import util.JsonResponse;
import util.ValidationUtil;

@WebServlet("/CadastrarNovidade")
public class CadastrarNovidade extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		request.setCharacterEncoding("UTF-8");

		String titulo = request.getParameter("titulo");
		String descricao = request.getParameter("descricao");
		String tipo = request.getParameter("tipo");
		String autor = request.getParameter("autor");
		String versao = request.getParameter("versao");
		String ativoParam = request.getParameter("ativo");

		if (ValidationUtil.isBlank(titulo) || ValidationUtil.isBlank(descricao) || ValidationUtil.isBlank(tipo)) {
			JsonResponse.error(response, HttpServletResponse.SC_BAD_REQUEST,
					"Campos obrigatórios ausentes ou vazios (titulo, descricao, tipo).");
			return;
		}

		Novidade novidade = new Novidade();
		novidade.setTitulo(titulo);
		novidade.setDescricao(descricao);
		novidade.setTipo(tipo.toUpperCase());
		novidade.setAutor(autor != null && !autor.trim().isEmpty() ? autor : "Anônimo");
		novidade.setVersao(versao != null && !versao.trim().isEmpty() ? versao : "1.0.0");
		novidade.setDataPublicacao(LocalDateTime.now());

		// Se o parâmetro 'ativo' não for enviado, assume 'true' por padrão
		boolean ativo = ativoParam == null || Boolean.parseBoolean(ativoParam);
		novidade.setAtivo(ativo);

		NovidadeDAO dao = new NovidadeDAO();
		boolean sucesso = dao.cadastrar(novidade);

		if (sucesso) {
			JsonResponse.message(response, HttpServletResponse.SC_CREATED, "Novidade criada com sucesso!");
		} else {
			JsonResponse.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
					"Erro ao salvar no banco de dados.");
		}
	}
}
