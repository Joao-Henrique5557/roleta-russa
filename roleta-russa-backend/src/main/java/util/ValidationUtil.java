package util;

import java.util.regex.Pattern;

/**
 * Validações simples reutilizadas pelos servlets. Nada sofisticado - o
 * objetivo é rejeitar entradas obviamente inválidas antes de chegar no
 * o banco (chamadas desnecessárias ao MySQL não deveriam ser usadas como
 * validador de formulário).
 */
public final class ValidationUtil {

	private static final Pattern EMAIL_PATTERN =
			Pattern.compile("^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$");

	private ValidationUtil() {
	}

	public static boolean isBlank(String valor) {
		return valor == null || valor.trim().isEmpty();
	}

	public static boolean isValidEmail(String email) {
		return email != null && EMAIL_PATTERN.matcher(email.trim()).matches();
	}

	/** Regra simples: pelo menos 4 caracteres. Ajuste conforme sua necessidade. */
	public static boolean isValidSenha(String senha) {
		return senha != null && senha.length() >= 4;
	}

	public static boolean isValidNome(String nome) {
		return nome != null && nome.trim().length() >= 2 && nome.trim().length() <= 60;
	}
}
