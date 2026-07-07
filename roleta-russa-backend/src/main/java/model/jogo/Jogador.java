package model.jogo;

public class Jogador {
    private String nome = "guest";
    // [BUG FIX] Vidas inicializadas como 3 (consistente com a lógica do jogo).
    // Com 2 vidas e 1 tiro real em dificuldade fácil, o jogo terminava no 1º tiro.
    private int vidas = 3;
    private boolean isAlive = true;
    private int quantCigarros = 0;

    public void levarTiro() {
        if (this.vidas > 0) {
            setVidas(getVidas() - 1);
            System.out.println("Vidas de " + this.nome + ": " + this.vidas);
            // [BUG FIX] Verificar morte imediatamente, não na próxima chamada.
            // Antes precisava de (vidas+1) tiros para realmente morrer.
            if (this.vidas <= 0) {
                this.isAlive = false;
                System.out.println(this.nome + " foi eliminado!");
            }
        }
    }

    public String getNome() { return nome; }
    public int getVidas() { return vidas; }
    public void setNome(String nome) { this.nome = nome; }
    public void setVidas(int vidas) { this.vidas = vidas; }
    public boolean isAlive() { return isAlive; }
    public void setAlive(boolean isAlive) { this.isAlive = isAlive; }

    public void fumar() {
        if (this.quantCigarros > 0) {
            this.vidas++;
            this.quantCigarros--;
            System.out.println(this.nome + " fumou um cigarro. Vidas: " + this.vidas);
        } else {
            System.out.println("Sem cigarros.");
        }
    }
}
