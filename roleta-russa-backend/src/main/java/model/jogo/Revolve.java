package model.jogo;

import java.util.Arrays;

public class Revolve {
    private int quantBalas = 0;
    private boolean[] balas;
    private int quantBalasVerdadeiras;
    private int tempPosBalaAtual = 0;

    public boolean isVazio(String dificuldade) {
        if (this.balas == null || this.tempPosBalaAtual >= this.balas.length) {
            System.out.println("Revólver vazio — recarregando.");
            rearmazenarBalas(dificuldade);
            mostrarInfoDoRevolve();
            return true;
        }
        return false;
    }

    public void atirar(Jogador alvo) {
        if (this.balas[this.tempPosBalaAtual]) {
            System.out.println(alvo.getNome() + " levou um tiro REAL!");
            alvo.levarTiro();
        } else {
            System.out.println(alvo.getNome() + " levou um tiro falso.");
        }
        this.tempPosBalaAtual++;
    }

    public void rearmazenarBalas(String dificuldade) {
        this.tempPosBalaAtual = 0;
        this.quantBalas = (int) (Math.random() * 5) + 2; // 2–6

        switch (dificuldade) {
            case "facil":
                this.quantBalasVerdadeiras = 1;
                if (this.quantBalas > 3) this.quantBalas = 3;
                break;
            case "medio":
                this.quantBalasVerdadeiras = 2;
                if (this.quantBalas <= 4 && this.quantBalas < 6) this.quantBalas++;
                break;
            case "dificil":
                this.quantBalasVerdadeiras = 3;
                // [BUG FIX] Era "||" — com quantBalas entre 2 e 6, a condição "< 6"
                // era sempre verdadeira, somando +1 em 100% dos casos.
                // Trocado para "&&" para somar só quando também é <= 3.
                if (this.quantBalas <= 3 && this.quantBalas < 6) this.quantBalas++;
                break;
            default:
                this.quantBalasVerdadeiras = 1;
        }

        this.balas = new boolean[this.quantBalas];
        for (int i = 0; i < this.quantBalasVerdadeiras; i++) {
            sortearBalaVerdadeira();
        }
    }

    private void sortearBalaVerdadeira() {
        int pos = (int) (Math.random() * this.quantBalas);
        if (this.balas[pos]) {
            sortearBalaVerdadeira();
        } else {
            this.balas[pos] = true;
        }
    }

    public void mostrarInfoDoRevolve() {
        System.out.println("Câmaras: " + this.quantBalas + " | Balas reais: " + this.quantBalasVerdadeiras);
        System.out.println("--------------------");
    }

    public void mostrarInfoDoRevolve(String lista) {
        mostrarInfoDoRevolve();
        if ("lista".equals(lista)) {
            System.out.println("Balas: " + Arrays.toString(balas));
        }
    }

    public boolean[] getBalas() { return balas.clone(); }
    public int getTempPosBalaAtual() { return tempPosBalaAtual; }
    public int getQuantBalas() { return quantBalas; }
    public int getQuantBalasVerdadeiras() { return quantBalasVerdadeiras; }
    public void setBalas(boolean[] balas) { this.balas = balas; }
    public void setTempPosBalaAtual(int pos) { this.tempPosBalaAtual = pos; }
}
