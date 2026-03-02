import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { API_CONFIG } from "../config/api.config";

/**
 * Instância do axios configurada para comunicação com a API Java
 * 
 * Esta instância inclui:
 * - URL base configurada
 * - Interceptors para autenticação
 * - Tratamento de erros
 * - Timeout configurável
 */
const api: AxiosInstance = axios.create(API_CONFIG);

/**
 * Interceptor de requisição
 * Adiciona o token de autenticação automaticamente em todas as requisições
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obter token do localStorage (apenas no cliente)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de resposta
 * Trata erros comuns e gerencia tokens expirados
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Se for erro 401 (Não autorizado), remover token e redirecionar
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      
      // Redirecionar para login apenas se não estiver na página de login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    // Log de erros em desenvolvimento (ignorar requisições canceladas)
    if (process.env.NODE_ENV === "development") {
      // Ignorar erros de requisições canceladas (comum em React Strict Mode)
      if (error.message !== "canceled" && error.code !== "ERR_CANCELED") {
        console.error("Erro na requisição:", {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Re-exporta funções de autenticação do módulo authHelpers
export { getToken, setToken, removeToken, isAuthenticated } from './authHelpers';

