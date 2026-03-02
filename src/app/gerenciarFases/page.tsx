"use client";

import React, { Suspense } from "react";
// Componente para criar trilhas
import Footer from "@/app/components/Footer"; // Componente do rodapé
import Topo from "@/app/components/Topo"; // Componente do topo/navegação
import GerenciarFasesConteudo from "@/app/components/GerenciarFases"; // Componente para criar trilhas
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function GerenciarFasesPage() {
  const backgroundImage = useBackgroundImage("pages");
  useKeyboardNavigation();
  
  return (
    <PageWrapper 
      title="Gerenciar Fases" 
      description="Gerencie as fases das suas trilhas de aprendizado"
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
          <div className="flex flex-col min-h-screen">
            <Topo />

            <section className="flex flex-1 justify-center items-start px-2 sm:px-4 md:px-6 py-4 sm:py-6 w-full overflow-x-hidden" aria-labelledby="gerenciar-fases-title">
              <h1 id="gerenciar-fases-title" className="sr-only">Gerenciar Fases</h1>
              <Suspense fallback={<p className="text-center" role="status" aria-live="polite">Carregando...</p>}>
                <GerenciarFasesConteudo />
              </Suspense>
            </section>

            <Footer />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
