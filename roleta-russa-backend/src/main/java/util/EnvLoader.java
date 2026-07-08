package util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Carrega variáveis do arquivo {@code .env} para uso como fallback quando
 * elas não existem como variáveis de ambiente reais do sistema operacional
 * (via {@code System.getenv()}).
 *
 * <p><b>Por que isso é necessário:</b> Java não lê arquivos {@code .env}
 * nativamente, e rodando via Tomcat no Eclipse WTP o diretório de trabalho
 * do processo não é previsível (normalmente é o workspace/servidor, não a
 * raiz do projeto). Por isso a estratégia principal é ler o {@code .env}
 * via <b>classpath</b>: coloque o arquivo em
 * {@code src/main/resources/.env} e o Maven vai copiá-lo automaticamente
 * para {@code WEB-INF/classes/.env} dentro do WAR - local sempre acessível
 * independente de onde o servidor foi iniciado.
 *
 * <p>Como fallback de conveniência (útil rodando via {@code mvn} direto no
 * terminal, na raiz do projeto), também tenta um {@code .env} no diretório
 * de trabalho atual.
 *
 * <p>O arquivo nunca deve ser commitado - já está no .gitignore do projeto.
 */
public final class EnvLoader {

    private static final Map<String, String> VALORES = carregar();

    private EnvLoader() {
    }

    /**
     * Retorna o valor da chave lida do .env, ou {@code null} se não
     * encontrada em nenhuma das origens tentadas.
     */
    public static String get(String chave) {
        return VALORES.get(chave);
    }

    private static Map<String, String> carregar() {
        Map<String, String> valores = new LinkedHashMap<>();

        // 1) Classpath - WEB-INF/classes/.env (via src/main/resources/.env).
        //    Funciona sempre, independente do diretório de trabalho do Tomcat.
        try (InputStream in = EnvLoader.class.getResourceAsStream("/.env")) {
            if (in != null) {
                parsear(new String(in.readAllBytes(), StandardCharsets.UTF_8), valores);
                System.out.println("[EnvLoader] .env carregado do classpath (WEB-INF/classes/.env).");
                return valores;
            }
        } catch (IOException e) {
            System.err.println("[EnvLoader] Falha ao ler .env do classpath: " + e.getMessage());
        }

        // 2) Fallback: .env no diretório de trabalho atual (útil rodando
        //    "mvn tomcat7:run" ou similar direto na raiz do projeto).
        Path candidato = Path.of(".env");
        if (Files.isRegularFile(candidato)) {
            try (BufferedReader br = Files.newBufferedReader(candidato, StandardCharsets.UTF_8)) {
                StringBuilder conteudo = new StringBuilder();
                String linha;
                while ((linha = br.readLine()) != null) {
                    conteudo.append(linha).append('\n');
                }
                parsear(conteudo.toString(), valores);
                System.out.println("[EnvLoader] .env carregado do diretório de trabalho: "
                        + candidato.toAbsolutePath());
                return valores;
            } catch (IOException e) {
                System.err.println("[EnvLoader] Falha ao ler .env do diretório de trabalho: " + e.getMessage());
            }
        }

        System.out.println("[EnvLoader] Nenhum .env encontrado (classpath ou diretório de trabalho). "
                + "Usando apenas variáveis de ambiente do sistema e/ou valores padrão.");
        return valores;
    }

    private static void parsear(String conteudo, Map<String, String> destino) {
        for (String linhaBruta : conteudo.split("\\R")) {
            String linha = linhaBruta.trim();
            if (linha.isEmpty() || linha.startsWith("#")) {
                continue;
            }
            int separador = linha.indexOf('=');
            if (separador <= 0) {
                continue;
            }
            String chave = linha.substring(0, separador).trim();
            String valor = linha.substring(separador + 1).trim();
            // Remove aspas envolventes, se houver (ex: DB_PASSWORD="abc123").
            if (valor.length() >= 2
                    && ((valor.startsWith("\"") && valor.endsWith("\""))
                        || (valor.startsWith("'") && valor.endsWith("'")))) {
                valor = valor.substring(1, valor.length() - 1);
            }
            destino.put(chave, valor);
        }
    }
}
