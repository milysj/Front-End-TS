"use client";

import React, { useEffect } from "react";
import { useKeyboardNavigation } from "../../hooks/useAccessibility";

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

/**
 * Wrapper de página acessível
 * Garante estrutura semântica adequada e configurações de acessibilidade
 */
export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  description,
  className = "",
}) => {
  useKeyboardNavigation();

  useEffect(() => {
    // Atualiza o título da página
    document.title = `${title} - Estude.My`;
    
    // Anuncia mudança de página para leitores de tela
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = `Página: ${title}${description ? `. ${description}` : ""}`;
    document.body.appendChild(announcement);

    return () => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    };
  }, [title, description]);

  return (
    <main id="main-content" role="main" className={className} tabIndex={-1}>
      <div className="sr-only">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </main>
  );
};

