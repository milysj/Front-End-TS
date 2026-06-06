"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick?: () => void;
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  onClick,
  href,
  label = "Voltar",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleGoBack}
      className={`group flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] hover:border-purple-500/50 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-200 active:scale-95 font-bold shadow-sm cursor-pointer text-sm w-fit ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
      <span>{label}</span>
    </button>
  );
}
