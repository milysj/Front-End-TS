import api from "./api";
import { API_ENDPOINTS } from "../config/api.config";

// Nota: A autenticação é gerenciada automaticamente pelo interceptor em api.ts
// O token é adicionado automaticamente em todas as requisições

/**
 * Lista todas as fases (opcionalmente filtradas por trilhaId)
 * @param {string} trilhaId - ID da trilha para filtrar (opcional)
 * @returns {Promise<Array>} Lista de fases
 */
export const listarFases = async (trilhaId = null) => {
  const url = trilhaId
    ? `${API_ENDPOINTS.FASES.LISTAR}?trilhaId=${trilhaId}`
    : API_ENDPOINTS.FASES.LISTAR;
  
  const response = await api.get(url);
  return response.data;
};

/**
 * Busca fases por trilhaId
 * @param {string} trilhaId - ID da trilha
 * @returns {Promise<Array>} Lista de fases da trilha
 */
export const buscarFasesPorTrilha = async (trilhaId) => {
  const response = await api.get(API_ENDPOINTS.FASES.POR_TRILHA(trilhaId));
  return response.data;
};

/**
 * Busca fases por seçãoId
 * @param {string} secaoId - ID da seção
 * @returns {Promise<Array>} Lista de fases da seção
 */
export const buscarFasesPorSecao = async (secaoId) => {
  const response = await api.get(API_ENDPOINTS.FASES.POR_SECAO(secaoId));
  return response.data;
};

/**
 * Busca uma fase por ID
 * @param {string} id - ID da fase
 * @returns {Promise<Object>} Dados da fase
 */
export const buscarFasePorId = async (id) => {
  const response = await api.get(API_ENDPOINTS.FASES.POR_ID(id));
  return response.data;
};

/**
 * Cria uma nova fase
 * @param {Object} faseData - Dados da fase { trilhaId, titulo, descricao, ordem, perguntas }
 * @returns {Promise<Object>} Fase criada
 */
export const criarFase = async (faseData) => {
  try {
    const response = await api.post(API_ENDPOINTS.FASES.LISTAR, faseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || `Erro ao criar fase`);
  }
};

/**
 * Atualiza uma fase existente
 * @param {string} id - ID da fase
 * @param {Object} faseData - Dados atualizados da fase
 * @returns {Promise<Object>} Fase atualizada
 */
export const atualizarFase = async (id, faseData) => {
  try {
    const response = await api.put(API_ENDPOINTS.FASES.POR_ID(id), faseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || `Erro ao atualizar fase`);
  }
};

/**
 * Deleta uma fase
 * @param {string} id - ID da fase
 * @returns {Promise<Object>} Mensagem de sucesso
 */
export const deletarFase = async (id) => {
  const response = await api.delete(API_ENDPOINTS.FASES.POR_ID(id));
  return response.data;
};

