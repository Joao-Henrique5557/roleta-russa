package util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Fábrica de conexões JDBC com o MySQL local. Substitui o antigo
 * FirebaseConfig/Firestore - o projeto agora usa um banco relacional
 * instalado direto na máquina de desenvolvimento, sem depender de
 * credenciais de serviços de terceiros.
 *
 * Cada chamada a {@link #getConnection()} abre uma conexão nova (padrão
 * simples, sem pool - adequado para um projeto de estudo rodando local).
 * Os DAOs devem sempre usar try-with-resources para garantir o fechamento:
 *
 * <pre>
 * try (Connection conn = ConnectionFactory.getConnection();
 *      PreparedStatement stmt = conn.prepareStatement(sql)) {
 *     ...
 * }
 * </pre>
 *
 * A conexão é configurável via variáveis de ambiente, todas opcionais
 * (se ausentes, assume um MySQL local padrão, sem senha):
 *
 * - DB_URL      (padrão: jdbc:mysql://localhost:3306/roleta_russa?...)
 * - DB_USER     (padrão: root)
 * - DB_PASSWORD (padrão: vazio)
 */
public final class ConnectionFactory {

    private static final String DEFAULT_URL =
            "jdbc:mysql://localhost:3306/roleta_russa"
                    + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "";

    private ConnectionFactory() {
    }

    /**
     * Abre e retorna uma nova conexão com o MySQL. Lança SQLException se o
     * banco não estiver acessível (não rodando, credenciais erradas,
     * database "roleta_russa" ainda não criado com db/schema.sql, etc.).
     */
    public static Connection getConnection() throws SQLException {
        String url = env("DB_URL", DEFAULT_URL);
        String user = env("DB_USER", DEFAULT_USER);
        String password = env("DB_PASSWORD", DEFAULT_PASSWORD);

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException(
                    "Driver JDBC do MySQL (mysql-connector-j) não encontrado no classpath. "
                            + "Confira a dependência no pom.xml.", e);
        }

        return DriverManager.getConnection(url, user, password);
    }

    /**
     * Testa a conexão rapidamente - usado pelo endpoint GET /Status para
     * diagnóstico, sem precisar interpretar um 500 de outro endpoint.
     */
    public static boolean testarConexao() {
        try (Connection conn = getConnection()) {
            return conn.isValid(3);
        } catch (SQLException e) {
            System.err.println("[ConnectionFactory] Falha ao conectar no MySQL: " + e.getMessage());
            return false;
        }
    }

    private static String env(String chave, String padrao) {
        String valor = System.getenv(chave);
        return (valor != null && !valor.isBlank()) ? valor : padrao;
    }
}
