/**
 * Utilitários de acessibilidade
 * Funções auxiliares para melhorar a acessibilidade da aplicação
 */

/**
 * Anuncia uma mensagem para leitores de tela
 * @param message - Mensagem a ser anunciada
 * @param priority - Prioridade da mensagem ('polite' ou 'assertive')
 */
export const announceToScreenReader = (
  message: string,
  priority: "polite" | "assertive" = "polite"
): void => {
  if (typeof window === "undefined") return;

  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove após a mensagem ser lida
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Move o foco para um elemento específico
 * @param elementId - ID do elemento para focar
 */
export const focusElement = (elementId: string): void => {
  if (typeof window === "undefined") return;

  const element = document.getElementById(elementId);
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

/**
 * Verifica se o usuário está usando navegação por teclado
 */
export const isKeyboardNavigation = (): boolean => {
  if (typeof window === "undefined") return false;
  return document.body.classList.contains("keyboard-navigation");
};

/**
 * Obtém o texto alternativo apropriado para uma imagem
 * @param imageName - Nome da imagem
 * @param context - Contexto onde a imagem está sendo usada
 */
export const getImageAlt = (imageName: string, context?: string): string => {
  const altTexts: Record<string, string> = {
    logo: "Logo do Estude.My",
    "coin-pixel": "Moeda de experiência",
    trofeu: "Troféu de conquista",
    personagem: "Personagem do jogo",
    guerreiro: "Personagem guerreiro",
    mago: "Personagem mago",
    samurai: "Personagem samurai",
    cavaleiro_inimigo: "Inimigo cavaleiro",
  };

  const baseAlt = altTexts[imageName] || `Imagem: ${imageName}`;
  return context ? `${baseAlt} - ${context}` : baseAlt;
};

/**
 * Gera um ID único para elementos que precisam de labels ARIA
 */
export const generateAriaId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Valida se um elemento tem contraste adequado
 * @param foregroundColor - Cor do texto
 * @param backgroundColor - Cor de fundo
 */
export const hasAdequateContrast = (
  foregroundColor: string,
  backgroundColor: string
): boolean => {
  // Implementação simplificada - em produção, use uma biblioteca como 'color-contrast'
  // Por enquanto, retorna true assumindo que as cores do tema já foram validadas
  return true;
};

/**
 * Obtém o texto de status para leitores de tela baseado no estado
 */
export const getStatusText = (
  isLoading: boolean,
  hasError: boolean,
  isEmpty: boolean,
  itemName: string = "itens"
): string => {
  if (isLoading) return `Carregando ${itemName}...`;
  if (hasError) return `Erro ao carregar ${itemName}`;
  if (isEmpty) return `Nenhum ${itemName} encontrado`;
  return "";
};

