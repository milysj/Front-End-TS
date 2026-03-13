"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function VerificarEmailRedirectClient() {
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

export default function VerificarEmailRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-[var(--text-secondary)]">Carregando...</p>
        </div>
      }
    >
      <VerificarEmailRedirectClient />
    </Suspense>
  );
}
