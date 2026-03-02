"use client";

import Feedback from "@/app/components/Feedback"; // Componente de feedback
import Footer from "@/app/components/Footer";     // Componente do rodapé
import Topo from "@/app/components/Topo";         // Componente do topo/navegação
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function FeedbackPage() {
  const backgroundImage = useBackgroundImage("pages");
  useKeyboardNavigation();
  
  return (
    <PageWrapper 
      title="Feedback" 
      description="Envie seu feedback sobre a plataforma Estude.My"
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

            <section className="flex flex-1" aria-labelledby="feedback-title">
              <h1 id="feedback-title" className="sr-only">Enviar Feedback</h1>
              <Feedback />
            </section>

            <Footer />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

