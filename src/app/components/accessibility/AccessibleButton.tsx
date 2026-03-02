"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  loadingText?: string;
}

/**
 * Componente de botão acessível
 * Inclui estados de loading, variantes e suporte completo a ARIA
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      variant = "primary",
      loading = false,
      loadingText = "Carregando...",
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={`accessible-button accessible-button-${variant} ${className}`}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <span className="sr-only">{loadingText}</span>
            <span aria-hidden="true">{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

