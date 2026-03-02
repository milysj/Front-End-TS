"use client";

import React, { useEffect, useLayoutEffect } from "react";
import Topo from "@/app/components/Topo"; // Componente do topo/navegação
import Footer from "@/app/components/Footer"; // Componente do rodapé
import Ranking from "@/app/components/Ranking"; // Componente que exibe o ranking de usuários
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function RankingPage() {
  const backgroundImage = useBackgroundImage("pages");
  useKeyboardNavigation();
  
  useLayoutEffect(() => {
    document.title = "Ranking - Estude.My";
  }, []);

  return (
    <PageWrapper 
      title="Ranking" 
      description="Veja o ranking dos usuários com mais experiência e conquistas"
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
          <div className="">
            <Topo />

            <section className="flex items-center justify-center min-h-screen" aria-labelledby="ranking-title">
              <h1 id="ranking-title" className="sr-only">Ranking de Usuários</h1>
              <Ranking />
            </section>

            <Footer />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
