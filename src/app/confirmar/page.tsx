import { Suspense } from "react";
import ConfirmarEmailClient from "./ConfirmarEmailClient";

export default function ConfirmarEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-[var(--text-secondary)]">Carregando...</p>
        </div>
      }
    >
      <ConfirmarEmailClient />
    </Suspense>
  );
}