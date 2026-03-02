"use client";

import Form from "@/app/components/Forms";     // Componente de formulário
import Footer from "@/app/components/Footer";  // Componente do rodapé
import Topo from "@/app/components/Topo";      // Componente do topo/navegação
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function Home() {
  const backgroundImage = useBackgroundImage("pages");
  useKeyboardNavigation();
  
  return (
    <PageWrapper 
      title="Fale Conosco" 
      description="Entre em contato conosco através do formulário"
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

            <section className="flex flex-1" aria-labelledby="fale-conosco-title">
              <h1 id="fale-conosco-title" className="sr-only">Fale Conosco</h1>
              <Form />
            </section>

            <Footer />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}