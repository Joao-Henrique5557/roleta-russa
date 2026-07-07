package controller;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import util.JsonResponse;

/**
 * Além de liberar CORS, esse filtro agora também funciona como uma rede de
 * segurança contra exceções não tratadas nos servlets.
 *
 * Problema original: quando um servlet lançava uma exceção não tratada, o
 * Tomcat processava o erro com sua própria página padrão e, ao fazer isso,
 * descartava os headers que este filtro já tinha setado (incluindo
 * Access-Control-Allow-Origin). O resultado no navegador era um erro de
 * CORS, mesmo o problema real sendo outra coisa (ex: MySQL não
 * inicializado) - o que gerou bastante confusão de diagnóstico neste
 * projeto.
 *
 * Correção: este filtro agora envolve chain.doFilter(...) num try/catch. Se
 * algo não tratado escapar de um servlet, o filtro mesmo devolve uma
 * resposta JSON 500 (com os headers de CORS já setados antes), em vez de
 * deixar o Tomcat truncar tudo.
 */
@WebFilter("/*")
public class CorsFilter implements Filter {

	// Origens sempre liberadas, além do que vier de ALLOWED_ORIGINS.
	private static final String LOCALHOST_DEV = "http://localhost:5173";

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {

		request.setCharacterEncoding("UTF-8");
		HttpServletRequest req = (HttpServletRequest) request;
		HttpServletResponse res = (HttpServletResponse) response;

		String origin = req.getHeader("Origin");
		if (isOriginPermitida(origin)) {
			res.setHeader("Access-Control-Allow-Origin", origin);
		}

		res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

		// Responde de imediato ao Preflight enviado pelo Axios do React
		if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
			res.setStatus(HttpServletResponse.SC_OK);
			return;
		}

		try {
			chain.doFilter(request, response);
		} catch (Exception e) {
			System.err.println("[CorsFilter] Exceção não tratada em " + req.getRequestURI() + ": " + e);
			e.printStackTrace();
			if (!res.isCommitted()) {
				JsonResponse.error(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
						"Erro interno no servidor. Verifique os logs.");
			}
		}
	}

	private boolean isOriginPermitida(String origin) {
		if (origin == null) {
			return false;
		}
		if (origin.equals(LOCALHOST_DEV)) {
			return true;
		}
		// Permite adicionar outras origens (ex: domínio de produção do front-end)
		// sem precisar recompilar - só configurar a env var no Docker/Render.
		String extras = System.getenv("ALLOWED_ORIGINS");
		if (extras != null && !extras.isBlank()) {
			for (String permitida : extras.split(",")) {
				if (origin.equals(permitida.trim())) {
					return true;
				}
			}
		}
		return false;
	}

	@Override
	public void destroy() {
	}
}
