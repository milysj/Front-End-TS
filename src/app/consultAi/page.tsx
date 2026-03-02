"use client";

import React from "react";
import Footer from "@/app/components/Footer"; // Componente do rodapé
import Topo from "@/app/components/Topo"; // Componente do topo/navegação
import ConsultAi from "@/app/components/ConsultAi";
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function DadosPessoaisPage() {
  const backgroundImage = useBackgroundImage("pages");
  useKeyboardNavigation();
  
  return (
    <PageWrapper 
      title="ConsultAI" 
      description="Assistente de inteligência artificial para ajudar no seu aprendizado"
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
          <div className="flex min-h-screen flex-col justify-between transition-all duration-300">
            <Topo />

            <section className="pt-3 w-7xl max-w-11/12 mx-auto px-4" aria-labelledby="consultai-title">
              <h1 id="consultai-title" className="sr-only">ConsultAI - Assistente de IA</h1>
              <ConsultAi />
            </section>

            <Footer />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
