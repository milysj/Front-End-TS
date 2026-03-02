"use client";

import React from "react";
import Link from "next/link";

/**
 * Componente SkipLink - Permite pular para o conteúdo principal
 * Melhora a navegação para usuários de leitores de tela e teclado
 */
export const SkipLink: React.FC = () => {
  return (
    <>
      <Link
        href="#main-content"
        className="skip-link"
        aria-label="Pular para o conteúdo principal"
      >
        Pular para o conteúdo principal
      </Link>
      <style jsx>{`
        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: var(--primary);
          color: var(--primary-foreground);
          padding: 8px 16px;
          text-decoration: none;
          z-index: 10000;
          border-radius: 0 0 4px 0;
          font-weight: 600;
          transition: top 0.3s;
        }

        .skip-link:focus {
          top: 0;
          outline: 3px solid var(--ring);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

