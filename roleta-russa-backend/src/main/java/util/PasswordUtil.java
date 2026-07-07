package util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Utilitário simples de hashing de senha (SHA-256 + hex).
 * Nunca armazenamos a senha em texto puro no banco.
 *
 * Nota de estudo: SHA-256 puro é rápido demais para hash de senha em um
 * cenário de ataque de força bruta real. Para produção de verdade, o ideal
 * seria bcrypt/argon2 (que são propositalmente lentos). Mantido em SHA-256
 * aqui por simplicidade, já que é um projeto de estudo.
 */
public class PasswordUtil {

    private PasswordUtil() {
    }

    public static String hash(String senhaPura) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(senhaPura.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Algoritmo SHA-256 indisponivel", e);
        }
    }

    public static boolean matches(String senhaPura, String hashArmazenado) {
        if (senhaPura == null || hashArmazenado == null) {
            return false;
        }
        return hash(senhaPura).equals(hashArmazenado);
    }
}
