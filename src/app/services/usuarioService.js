import api from "./api";
import { API_ENDPOINTS } from "../config/api.config";

/**
 * Lista todos os usuários
 * @returns {Promise<Array>} Lista de usuários
 */
export const listarUsuarios = async () => {
  const response = await api.get(API_ENDPOINTS.USERS.LISTAR);
  return response.data;
};

/**
 * Cria um novo usuário
 * @param {Object} usuario - Dados do usuário
 * @returns {Promise<Object>} Usuário criado
 */
export const criarUsuario = async (usuario) => {
  const response = await api.post(API_ENDPOINTS.USERS.LISTAR, usuario);
  return response.data;
};
