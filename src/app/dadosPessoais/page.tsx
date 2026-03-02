"use client";

import React, { useEffect, useLayoutEffect } from "react";
import DadosPessoais from "@/app/components/DadosPessoais"; // Componente de dados pessoais do usuário
import Footer from "@/app/components/Footer";               // Componente do rodapé
import Topo from "@/app/components/Topo";                   // Componente do topo/navegação
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function DadosPessoaisPage() {
    const backgroundImage = useBackgroundImage("pages");
    useKeyboardNavigation();
    
    useLayoutEffect(() => {
        document.title = "Dados Pessoais - Estude.My";
    }, []);

    return (
      <PageWrapper 
        title="Dados Pessoais" 
        description="Gerencie suas informações pessoais e de contato"
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

              <section className="pt-3 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-4" aria-labelledby="dados-pessoais-title">
                <h1 id="dados-pessoais-title" className="sr-only">Dados Pessoais</h1>
                <DadosPessoais />
              </section>

              <Footer />
            </div>
          </div>
        </div>
      </PageWrapper>
    );
}
