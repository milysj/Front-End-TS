"use client";

import { useLayoutEffect, Suspense } from "react";
import Footer from "@/app/components/Footer"; // Componente do rodapé da página
import Topo from "@/app/components/Topo"; // Componente do topo / barra de navegação
import Trilhas from "@/app/components/Triha"; // Componente que exibe as trilhas/cursos
import { useSearchParams } from "next/navigation";
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

function TrilhaContent() {
  const searchParams = useSearchParams();
  const trilhaId = searchParams.get("trilhaId");
  const backgroundImage = useBackgroundImage("pages");
  useKeyboardNavigation();

  useLayoutEffect(() => {
    document.title = "Trilha - Estude.My";
  }, []);

  return (
    <PageWrapper 
      title="Trilha" 
      description={trilhaId ? "Visualizando trilha de aprendizado" : "Lista de trilhas de aprendizado"}
    >
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundColor: "var(--bg-page)",
          backgroundAttachment: "local",
        }}
      >
        <div className="relative z-10">
          <div className="flex min-h-screen flex-col transition-all duration-300 justify-space-between">
            <Topo />

            <section aria-labelledby="trilha-title">
              <h1 id="trilha-title" className="sr-only">
                {trilhaId ? "Detalhes da Trilha" : "Trilhas Disponíveis"}
              </h1>
              <Trilhas trilhaId={trilhaId || undefined} />
            </section>

            <Footer />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function TrilhaPage() {
  const backgroundImage = useBackgroundImage("pages");
  
  return (
    <Suspense
      fallback={
        <PageWrapper title="Trilha" description="Carregando trilha">
          <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${backgroundImage}')`,
              backgroundColor: "var(--bg-page)",
              backgroundAttachment: "local",
            }}
          >
            <div className="text-center">
              <p className="text-[var(--text-secondary)]" role="status" aria-live="polite">
                Carregando...
              </p>
            </div>
          </div>
        </PageWrapper>
      }
    >
      <TrilhaContent />
    </Suspense>
  );
}
