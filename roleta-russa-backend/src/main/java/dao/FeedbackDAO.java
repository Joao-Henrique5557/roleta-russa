package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import model.Beans.Feedback;
import util.ConnectionFactory;

/**
 * Acesso à tabela "feedbacks" (comentários, sugestões e denúncias enviados
 * pelos jogadores). Substitui o antigo NovidadeDAO - ver
 * db/migration_002_feedbacks.sql para o schema.
 */
public class FeedbackDAO {

	private static final String SQL_INSERIR =
			"INSERT INTO feedbacks (tipo, mensagem, autor, usuario_id, status, data_criacao, ativo) "
					+ "VALUES (?, ?, ?, ?, 'ABERTO', ?, TRUE)";

	private static final String SQL_LISTAR_TODOS =
			"SELECT * FROM feedbacks WHERE ativo = TRUE ORDER BY data_criacao DESC LIMIT 50";

	private static final String SQL_LISTAR_POR_TIPO =
			"SELECT * FROM feedbacks WHERE ativo = TRUE AND tipo = ? ORDER BY data_criacao DESC LIMIT 50";

	private static final String SQL_ATUALIZAR_STATUS =
			"UPDATE feedbacks SET status = ? WHERE id = ?";

	private static final String SQL_DESATIVAR =
			"UPDATE feedbacks SET ativo = FALSE WHERE id = ?";

	public boolean cadastrar(Feedback feedback) {
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_INSERIR)) {

			stmt.setString(1, feedback.getTipo());
			stmt.setString(2, feedback.getMensagem());
			stmt.setString(3, feedback.getAutor());

			if (feedback.getUsuarioId() != null) {
				stmt.setInt(4, Integer.parseInt(feedback.getUsuarioId()));
			} else {
				stmt.setNull(4, java.sql.Types.INTEGER);
			}

			LocalDateTime data = feedback.getDataCriacao() != null
					? feedback.getDataCriacao()
					: LocalDateTime.now();
			stmt.setTimestamp(5, Timestamp.valueOf(data));

			stmt.executeUpdate();
			return true;
		} catch (SQLException | NumberFormatException e) {
			logErro("cadastrar", e);
			return false;
		}
	}

	/**
	 * Lista os feedbacks mais recentes. Se {@code tipoFiltro} for
	 * null/vazio, lista todos os tipos juntos; caso contrário, filtra só
	 * pelo tipo informado (COMENTARIO, SUGESTAO ou DENUNCIA).
	 */
	public List<Feedback> listar(String tipoFiltro) {
		boolean temFiltro = tipoFiltro != null && !tipoFiltro.isBlank();
		String sql = temFiltro ? SQL_LISTAR_POR_TIPO : SQL_LISTAR_TODOS;

		List<Feedback> lista = new ArrayList<>();
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(sql)) {

			if (temFiltro) {
				stmt.setString(1, tipoFiltro.toUpperCase());
			}

			try (ResultSet rs = stmt.executeQuery()) {
				while (rs.next()) {
					lista.add(toFeedback(rs));
				}
			}
		} catch (SQLException e) {
			logErro("listar", e);
		}
		return lista;
	}

	public boolean atualizarStatus(String id, String novoStatus) {
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_ATUALIZAR_STATUS)) {
			stmt.setString(1, novoStatus);
			stmt.setInt(2, Integer.parseInt(id));
			return stmt.executeUpdate() > 0;
		} catch (SQLException | NumberFormatException e) {
			logErro("atualizarStatus", e);
			return false;
		}
	}

	/** Soft delete/moderação - some da listagem pública sem apagar a linha. */
	public boolean desativar(String id) {
		try (Connection conn = ConnectionFactory.getConnection();
				PreparedStatement stmt = conn.prepareStatement(SQL_DESATIVAR)) {
			stmt.setInt(1, Integer.parseInt(id));
			return stmt.executeUpdate() > 0;
		} catch (SQLException | NumberFormatException e) {
			logErro("desativar", e);
			return false;
		}
	}

	private Feedback toFeedback(ResultSet rs) throws SQLException {
		Feedback f = new Feedback();
		f.setId(String.valueOf(rs.getInt("id")));
		f.setTipo(rs.getString("tipo"));
		f.setMensagem(rs.getString("mensagem"));
		f.setAutor(rs.getString("autor"));

		int usuarioId = rs.getInt("usuario_id");
		f.setUsuarioId(rs.wasNull() ? null : String.valueOf(usuarioId));

		f.setStatus(rs.getString("status"));

		Timestamp ts = rs.getTimestamp("data_criacao");
		if (ts != null) {
			f.setDataCriacao(ts.toLocalDateTime());
		}

		f.setAtivo(rs.getBoolean("ativo"));
		return f;
	}

	private void logErro(String metodo, Exception e) {
		System.err.println("[FeedbackDAO." + metodo + "] Falha ao acessar o MySQL: " + e);
		e.printStackTrace();
	}
}
