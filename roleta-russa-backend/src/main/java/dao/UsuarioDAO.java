package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import model.Beans.Usuario;
import util.ConnectionFactory;
import util.PasswordUtil;

public class UsuarioDAO {

	/**
	 * Resultado detalhado de uma tentativa de cadastro. Separar isso de um
	 * simples "true/false" evita que uma falha de conexão com o banco
	 * (MySQL fora do ar, credencial errada, etc.) seja mal-interpretada
	 * como "e-mail já cadastrado" pelo servlet.
	 */
	public enum ResultadoCadastro {
		SUCESSO,
		EMAIL_DUPLICADO,
		ERRO_INTERNO
	}

	private static final String SQL_INSERIR =
			"INSERT INTO usuarios (nome, email, senha, pontos, cargo) VALUES (?, ?, ?, 0, 'usuario')";
	private static final String SQL_BUSCAR_POR_EMAIL = "SELECT * FROM usuarios WHERE email = ? LIMIT 1";
	private static final String SQL_BUSCAR_POR_NOME = "SELECT * FROM usuarios WHERE nome = ? LIMIT 1";
	private static final String SQL_BUSCAR_POR_ID = "SELECT * FROM usuarios WHERE id = ?";
	private static final String SQL_LISTAR_TOP10 = "SELECT * FROM usuarios ORDER BY pontos DESC LIMIT 10";
	private static final String SQL_GANHAR_PONTOS = "UPDATE usuarios SET pontos = pontos + ? WHERE id = ?";

	/**
	 * Insere um novo usuário. A senha chega em texto puro e é transformada
	 * em hash SHA-256 antes de ser persistida. A coluna "email" tem
	 * constraint UNIQUE no schema (db/schema.sql) - por isso não
	 * precisamos fazer um SELECT manual antes do INSERT para checar
	 * duplicidade, o próprio banco garante isso de forma atômica.
	 */
	public ResultadoCadastro inserirUsuario(Usuario usuario) {
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_INSERIR)) {

			stmt.setString(1, usuario.getNome());
			stmt.setString(2, usuario.getEmail());
			stmt.setString(3, PasswordUtil.hash(usuario.getSenha()));
			stmt.executeUpdate();
			return ResultadoCadastro.SUCESSO;
		} catch (SQLIntegrityConstraintViolationException e) {
			// Único jeito de violar essa constraint é email duplicado.
			return ResultadoCadastro.EMAIL_DUPLICADO;
		} catch (SQLException e) {
			logErro("inserirUsuario", e);
			return ResultadoCadastro.ERRO_INTERNO;
		}
	}

	private Usuario buscarPorEmail(String email) throws SQLException {
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_BUSCAR_POR_EMAIL)) {
			stmt.setString(1, email);
			try (ResultSet rs = stmt.executeQuery()) {
				return rs.next() ? toUsuario(rs) : null;
			}
		}
	}

	private Usuario buscarPorNome(String nome) throws SQLException {
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_BUSCAR_POR_NOME)) {
			stmt.setString(1, nome);
			try (ResultSet rs = stmt.executeQuery()) {
				return rs.next() ? toUsuario(rs) : null;
			}
		}
	}

	/** Busca por ID (chave primária inteira) - usado pela página de Perfil. */
	public Usuario buscarPorId(String id) {
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_BUSCAR_POR_ID)) {
			stmt.setInt(1, Integer.parseInt(id));
			try (ResultSet rs = stmt.executeQuery()) {
				if (!rs.next()) {
					return null;
				}
				Usuario u = toUsuario(rs);
				u.setSenha(null);
				return u;
			}
		} catch (NumberFormatException e) {
			return null; // id não numérico nunca vai existir no MySQL
		} catch (SQLException e) {
			logErro("buscarPorId", e);
			return null;
		}
	}

	/**
	 * Autentica por nome de usuário OU e-mail + senha. Retorna o Usuario
	 * (sem o hash da senha) se as credenciais forem válidas, ou null caso
	 * contrário - tanto para credenciais erradas quanto para erro interno.
	 */
	public Usuario autenticar(String loginInformado, String senhaInformada) {
		try {
			Usuario usuario = buscarPorEmail(loginInformado);
			if (usuario == null) {
				usuario = buscarPorNome(loginInformado);
			}
			if (usuario == null) {
				return null;
			}
			if (!PasswordUtil.matches(senhaInformada, usuario.getSenha())) {
				return null;
			}
			usuario.setSenha(null); // nunca devolve o hash pro cliente
			return usuario;
		} catch (SQLException e) {
			logErro("autenticar", e);
			return null;
		}
	}

	public List<Usuario> listarTodos() {
		List<Usuario> lista = new ArrayList<>();
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_LISTAR_TOP10);
				ResultSet rs = stmt.executeQuery()) {

			while (rs.next()) {
				Usuario u = toUsuario(rs);
				u.setSenha(null); // nunca expõe o hash na listagem pública
				lista.add(u);
			}
		} catch (SQLException e) {
			logErro("listarTodos", e);
		}
		return lista;
	}

	public boolean ganharPontos(String id, String forma) {
		int incremento;
		if ("bot".equals(forma)) {
			incremento = 10;
		} else if ("player".equals(forma)) {
			incremento = 40;
		} else {
			return false;
		}

		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_GANHAR_PONTOS)) {
			stmt.setInt(1, incremento);
			stmt.setInt(2, Integer.parseInt(id));
			return stmt.executeUpdate() > 0;
		} catch (NumberFormatException e) {
			return false;
		} catch (SQLException e) {
			logErro("ganharPontos", e);
			return false;
		}
	}

	private Usuario toUsuario(ResultSet rs) throws SQLException {
		Usuario u = new Usuario();
		u.setId(String.valueOf(rs.getInt("id")));
		u.setNome(rs.getString("nome"));
		u.setEmail(rs.getString("email"));
		u.setSenha(rs.getString("senha"));
		u.setPoints(rs.getInt("pontos"));
		u.setCargo(rs.getString("cargo"));
		Timestamp ts = rs.getTimestamp("data_cadastro");
		u.setDataCadastro(ts != null ? ts.toLocalDateTime().toString() : null);
		return u;
	}

	private void logErro(String metodo, Exception e) {
		System.err.println("[UsuarioDAO." + metodo + "] Falha ao acessar o MySQL "
				+ "(verifique se ele está rodando e as variáveis DB_URL/DB_USER/DB_PASSWORD): " + e);
		e.printStackTrace();
	}
}
