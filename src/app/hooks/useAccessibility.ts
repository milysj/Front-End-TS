"use client";

import { useEffect, useState } from "react";
import { announceToScreenReader } from "../utils/accessibility";

/**
 * Hook para gerenciar navegação por teclado
 */
export const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detecta quando o usuário usa Tab (navegação por teclado)
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-navigation");
      }
    };

    const handleMouseDown = () => {
      // Remove a classe quando o usuário usa o mouse
      document.body.classList.remove("keyboard-navigation");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);
};

/**
 * Hook para gerenciar foco em elementos
 */
export const useFocusManagement = () => {
  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return { focusElement };
};

/**
 * Hook para anunciar mudanças de estado para leitores de tela
 */
export const useScreenReaderAnnouncement = () => {
  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    announceToScreenReader(message, priority);
  };

  return { announce };
};

/**
 * Hook para gerenciar estados de carregamento com acessibilidade
 */
export const useAccessibleLoading = (
  isLoading: boolean,
  hasError: boolean,
  isEmpty: boolean,
  itemName: string = "conteúdo"
) => {
  const { announce } = useScreenReaderAnnouncement();

  useEffect(() => {
    if (isLoading) {
      announce(`Carregando ${itemName}...`, "polite");
    } else if (hasError) {
      announce(`Erro ao carregar ${itemName}`, "assertive");
    } else if (isEmpty) {
      announce(`Nenhum ${itemName} encontrado`, "polite");
    }
  }, [isLoading, hasError, isEmpty, itemName, announce]);
};

/**
 * Hook para detectar preferências de movimento reduzido
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
};

