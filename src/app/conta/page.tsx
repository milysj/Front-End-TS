"use client";

import { useLayoutEffect } from "react";
import Conta from "@/app/components/Conta";   // Componente de informações da conta do usuário
import Footer from "@/app/components/Footer"; // Componente do rodapé
import Topo from "@/app/components/Topo";     // Componente do topo/navegação
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function ContaPage() {
  const backgroundImage = useBackgroundImage("pages");
  useKeyboardNavigation();
  
  useLayoutEffect(() => {
    document.title = "Conta - Estude.My";
  }, []);

  return (
    <PageWrapper 
      title="Conta" 
      description="Gerencie as configurações da sua conta"
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

            <section className="flex flex-1" aria-labelledby="conta-title">
              <h1 id="conta-title" className="sr-only">Configurações da Conta</h1>
              <Conta />
            </section>

            <Footer />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
