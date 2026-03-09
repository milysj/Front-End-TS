"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Redireciona para a página de confirmação de e-mail (/confirmar) com o mesmo token.
 * Mantido para compatibilidade com links antigos que apontam para /verificarEmail?token=...
 */
export default function VerificarEmailRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      router.replace(`/confirmar?token=${encodeURIComponent(token)}`);
    } else {
      router.replace("/confirmar");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--text-secondary)]">Redirecionando...</p>
    </div>
  );
}
