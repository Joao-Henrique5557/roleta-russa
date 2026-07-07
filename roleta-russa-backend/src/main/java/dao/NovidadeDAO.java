package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import model.Beans.Novidade;
import util.ConnectionFactory;

public class NovidadeDAO {

	private static final String SQL_INSERIR =
			"INSERT INTO novidades (titulo, descricao, tipo, autor, versao, data_publicacao, ativo) "
					+ "VALUES (?, ?, ?, ?, ?, ?, ?)";
	private static final String SQL_LISTAR_ATIVAS =
			"SELECT * FROM novidades WHERE ativo = TRUE ORDER BY data_publicacao DESC LIMIT 10";
	private static final String SQL_DESATIVAR = "UPDATE novidades SET ativo = FALSE WHERE id = ?";

	public boolean cadastrar(Novidade novidade) {
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_INSERIR)) {

			stmt.setString(1, novidade.getTitulo());
			stmt.setString(2, novidade.getDescricao());
			stmt.setString(3, novidade.getTipo());
			stmt.setString(4, novidade.getAutor());
			stmt.setString(5, novidade.getVersao());

			LocalDateTime data = novidade.getDataPublicacao() != null
					? novidade.getDataPublicacao()
					: LocalDateTime.now();
			stmt.setTimestamp(6, Timestamp.valueOf(data));
			stmt.setBoolean(7, novidade.isAtivo());

			stmt.executeUpdate();
			return true;
		} catch (SQLException e) {
			logErro("cadastrar", e);
			return false;
		}
	}

	public List<Novidade> listarTodas() {
		List<Novidade> lista = new ArrayList<>();
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_LISTAR_ATIVAS);
				ResultSet rs = stmt.executeQuery()) {

			while (rs.next()) {
				Novidade n = new Novidade();
				n.setId(String.valueOf(rs.getInt("id")));
				n.setTitulo(rs.getString("titulo"));
				n.setDescricao(rs.getString("descricao"));
				n.setTipo(rs.getString("tipo"));
				n.setAutor(rs.getString("autor"));
				n.setVersao(rs.getString("versao"));

				Timestamp ts = rs.getTimestamp("data_publicacao");
				if (ts != null) {
					n.setDataPublicacao(ts.toLocalDateTime());
				}

				n.setAtivo(rs.getBoolean("ativo"));
				lista.add(n);
			}
		} catch (SQLException e) {
			logErro("listarTodas", e);
		}
		return lista;
	}

	public boolean desativar(String id) {
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_DESATIVAR)) {
			stmt.setInt(1, Integer.parseInt(id));
			return stmt.executeUpdate() > 0;
		} catch (NumberFormatException e) {
			return false;
		} catch (SQLException e) {
			logErro("desativar", e);
			return false;
		}
	}

	private void logErro(String metodo, Exception e) {
		System.err.println("[NovidadeDAO." + metodo + "] Falha ao acessar o MySQL: " + e);
		e.printStackTrace();
	}
}
