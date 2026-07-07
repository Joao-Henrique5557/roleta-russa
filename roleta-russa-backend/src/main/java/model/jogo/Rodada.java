package model.jogo;

import java.util.Scanner;

public class Rodada {
    private String vezde;
    private int numRodada = 1;
    private String dificuldade;
    private Jogador eu;
    private Jogador voce;
    private Revolve rvv;
    private Scanner tc;

    public void iniciarRodada(String dificuldade, Jogador eu, Jogador voce, Revolve rvv, Scanner tc) {
        this.eu = eu;
        this.voce = voce;
        this.dificuldade = dificuldade;
        this.rvv = rvv;
        this.tc = tc;
        // A vez começa com "eu" (jogador humano)
        this.vezde = this.eu.getNome();

        while (eu.isAlive() && voce.isAlive()) {
            iniciarTurno();
        }

        // Resultado final
        if (!eu.isAlive()) {
            System.out.println("💀 Você perdeu! " + voce.getNome() + " venceu.");
        } else {
            System.out.println("🏆 Você venceu! " + eu.getNome() + " é o campeão.");
        }
    }

    private void iniciarTurno() {
        // [BUG FIX] isVazio() foi chamado antes de cada turno para recarregar
        // quando necessário, NÃO ao final do turno (que causava recarga dupla).
        if (rvv.isVazio(this.dificuldade)) {
            this.numRodada++;
        }

        if (!eu.isAlive() || !voce.isAlive()) return;

        System.out.println("--- Rodada " + this.numRodada + " | Vez de: " + this.vezde + " ---");
        System.out.print("Atirar em você mesmo (1) ou no oponente (2)? ");
        int resp = tc.nextInt();

        // [BUG FIX] TODAS as comparações de String trocadas de == para .equals()
        // O operador == compara referências de objeto, não conteúdo da String.
        if (this.vezde.equals(this.eu.getNome())) {
            if (resp == 1) {
                boolean eraVerdadeira = rvv.getBalas().length > 0
                        && rvv.getBalas()[rvv.getTempPosBalaAtual()];
                rvv.atirar(this.eu);
                // [BUG FIX] Tiro falso em si mesmo → mantém a vez.
                // Tiro real em si mesmo → PERDE a vez (punição).
                if (eraVerdadeira) mudarVez();
                // Se falso, não chama mudarVez() → mantém a vez
            } else {
                rvv.atirar(this.voce);
                mudarVez(); // atirar no oponente sempre passa a vez
            }
        } else if (this.vezde.equals(this.voce.getNome())) {
            if (resp == 1) {
                boolean eraVerdadeira = rvv.getBalas().length > 0
                        && rvv.getBalas()[rvv.getTempPosBalaAtual()];
                rvv.atirar(this.voce);
                if (eraVerdadeira) mudarVez();
            } else {
                rvv.atirar(this.eu);
                mudarVez();
            }
        }

        System.out.println("--------------------");
    }

    // [BUG FIX] Método simplificado: sem parâmetros redundantes,
    // usa os campos da própria classe
    private void mudarVez() {
        if (this.vezde.equals(eu.getNome())) {
            this.vezde = voce.getNome();
        } else {
            this.vezde = eu.getNome();
        }
    }
}
