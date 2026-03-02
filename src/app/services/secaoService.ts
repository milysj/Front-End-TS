import api from "./api";
import { API_ENDPOINTS } from "@/app/config/api.config";

export interface Secao {
  _id?: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  trilhaId: string;
}

/**
 * Busca seções por trilha
 * @param {string} trilhaId - ID da trilha
 * @returns {Promise<Secao[]>} Lista de seções
 */
export const buscarSecoesPorTrilha = async (trilhaId: string): Promise<Secao[]> => {
  try {
    const response = await api.get(API_ENDPOINTS.SECOES.POR_TRILHA(trilhaId));
    return response.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao buscar seções");
  }
};

/**
 * Busca uma seção por ID
 * @param {string} id - ID da seção
 * @returns {Promise<Secao>} Seção encontrada
 */
export const buscarSecaoPorId = async (id: string): Promise<Secao> => {
  try {
    const response = await api.get(API_ENDPOINTS.SECOES.POR_ID(id));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao buscar seção");
  }
};

/**
 * Cria uma nova seção
 * @param {Object} secaoData - Dados da seção { trilhaId, titulo, descricao, ordem }
 * @returns {Promise<Secao>} Seção criada
 */
export const criarSecao = async (secaoData: Omit<Secao, "_id">): Promise<Secao> => {
  try {
    const response = await api.post(API_ENDPOINTS.SECOES.LISTAR, secaoData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao criar seção");
  }
};

/**
 * Atualiza uma seção existente
 * @param {string} id - ID da seção
 * @param {Object} secaoData - Dados atualizados da seção
 * @returns {Promise<Secao>} Seção atualizada
 */
export const atualizarSecao = async (
  id: string,
  secaoData: Partial<Omit<Secao, "_id">>
): Promise<Secao> => {
  try {
    const response = await api.put(API_ENDPOINTS.SECOES.POR_ID(id), secaoData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao atualizar seção");
  }
};

/**
 * Deleta uma seção
 * @param {string} id - ID da seção
 * @returns {Promise<void>}
 */
export const deletarSecao = async (id: string): Promise<void> => {
  try {
    await api.delete(API_ENDPOINTS.SECOES.POR_ID(id));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erro ao deletar seção");
  }
};

