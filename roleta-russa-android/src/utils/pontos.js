import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";
import { getErrorMessage } from "./apiError";

/**
 * POST /GanharPontos - mesma rota usada pelo web (10 pts contra o bot,
 * 40 pts contra outro jogador - regra decidida pelo backend, veja
 * UsuarioDAO.ganharPontos no roleta-russa-backend).
 * @param {"bot"|"player"} forma
 * @param {(msg: string, tipo?: string) => void} showToast
 */
export async function ganharPontos(forma, showToast) {
  const bruto = await AsyncStorage.getItem("usuario");
  if (!bruto) return;
  let usuario;
  try {
    usuario = JSON.parse(bruto);
  } catch {
    return;
  }
  if (!usuario?.id) return;

  const dados = new URLSearchParams();
  dados.append("id", usuario.id);
  dados.append("forma", forma);

  try {
    await axios.post(`${API_URL}/GanharPontos`, dados.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 5000,
    });
  } catch (error) {
    showToast(getErrorMessage(error, "Não foi possível salvar seus pontos."), "error");
  }
}
