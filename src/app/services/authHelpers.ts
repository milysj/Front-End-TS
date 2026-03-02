/**
 * Funções auxiliares de autenticação
 * 
 * Estas funções são extraídas do api.ts para facilitar testes unitários
 * e reutilização em outros contextos.
 */

/**
 * Função auxiliar para obter o token de autenticação
 */
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * Função auxiliar para definir o token de autenticação
 */
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

/**
 * Função auxiliar para remover o token de autenticação
 */
export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

/**
 * Função auxiliar para verificar se o usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

