"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";

interface AccessibleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

/**
 * Componente de input acessível
 * Inclui label, mensagens de erro e suporte completo a ARIA
 */
export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      id,
      className = "",
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId, ariaDescribedBy]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="accessible-input-wrapper">
        <label htmlFor={inputId} className="accessible-label">
          {label}
          {required && <span className="required-indicator" aria-label="obrigatório">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`accessible-input ${error ? "error" : ""} ${className}`}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={describedBy || undefined}
          {...props}
        />
        {helperText && (
          <span id={helperId} className="helper-text" role="note">
            {helperText}
          </span>
        )}
        {error && (
          <span id={errorId} className="error-text" role="alert" aria-live="polite">
            {error}
          </span>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = "AccessibleInput";

