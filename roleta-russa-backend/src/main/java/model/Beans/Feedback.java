package model.Beans;

import java.time.LocalDateTime;

/**
 * Comentário, sugestão ou denúncia enviado por um jogador. Substitui o
 * antigo bean {@code Novidade} (mural de novidades escrito só pelo dono do
 * projeto) - agora o mural na Home é alimentado pelos próprios jogadores.
 */
public class Feedback {
    private String id;
    // "COMENTARIO" | "SUGESTAO" | "DENUNCIA"
    private String tipo;
    private String mensagem;
    private String autor;
    // Pode ser null (feedback enviado como convidado, sem login).
    private String usuarioId;
    // "ABERTO" | "EM_ANALISE" | "RESOLVIDO" | "ARQUIVADO"
    private String status;
    private LocalDateTime dataCriacao;
    private boolean ativo;

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getTipo() {
        return tipo;
    }
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    public String getMensagem() {
        return mensagem;
    }
    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }
    public String getAutor() {
        return autor;
    }
    public void setAutor(String autor) {
        this.autor = autor;
    }
    public String getUsuarioId() {
        return usuarioId;
    }
    public void setUsuarioId(String usuarioId) {
        this.usuarioId = usuarioId;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
    public boolean isAtivo() {
        return ativo;
    }
    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }
}
