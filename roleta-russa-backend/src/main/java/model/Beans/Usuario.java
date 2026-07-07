package model.Beans;

public class Usuario {
	// No banco (MySQL) o id é um inteiro auto-incrementado. Aqui fica como
	// String só para manter compatibilidade com o front-end existente.
	private String id;
	private String nome;
	private String senha; // hash SHA-256, nunca texto puro
	private String email;
	private int pontos = 0;
	private String cargo;
	private String dataCadastro;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getSenha() {
		return senha;
	}

	public void setSenha(String senha) {
		this.senha = senha;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public int getPoints() {
		return pontos;
	}

	public void setPoints(int pontos) {
		this.pontos = pontos;
	}

	public int getPontos() {
		return pontos;
	}

	public void setPontos(int pontos) {
		this.pontos = pontos;
	}

	public String getCargo() {
		return cargo;
	}

	public void setCargo(String cargo) {
		this.cargo = cargo;
	}

	public String getDataCadastro() {
		return dataCadastro;
	}

	public void setDataCadastro(String dataCadastro) {
		this.dataCadastro = dataCadastro;
	}

	public Usuario(String id, String nome, String senha, String email, int pontos, String cargo,
			String dataCadastro) {
		super();
		this.id = id;
		this.nome = nome;
		this.senha = senha;
		this.email = email;
		this.pontos = pontos;
		this.cargo = cargo;
		this.dataCadastro = dataCadastro;
	}

	public Usuario() {
		super();
	}
}
