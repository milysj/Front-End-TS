"use client";

import Carrousel from "@/app/components/Carrousel";
import Footer from "@/app/components/Footer";
import Topo from "@/app/components/Topo";
import Script from "next/script";
import { useState, useEffect, useLayoutEffect } from "react";
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation, useAccessibleLoading } from "@/app/hooks/useAccessibility";

interface Trilha {
  _id: string;
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: string;
  image?: string;
  imagem?: string; // Campo do backend
}

export default function MenuTrilhas() {
  const backgroundImage = useBackgroundImage("pages");
  const [isMobile, setIsMobile] = useState(false);
  const [trilhasSalvas, setTrilhasSalvas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);
  useKeyboardNavigation();

  useAccessibleLoading(loading, false, trilhasSalvas.length === 0 && !loading, "lições salvas");

  useLayoutEffect(() => {
    document.title = "Lições Salvas - Estude.My";
  }, []);

  // Hook para detectar se está em tela mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Carregar trilhas salvas
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const carregarTrilhasSalvas = async () => {
      const token = localStorage.getItem("token");
      if (!token || !isMounted) {
        if (!token && isMounted) setLoading(false);
        return;
      }

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/licoes-salvas`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setTrilhasSalvas(Array.isArray(data) ? data : []);
          }
        } else {
          console.error("Erro ao carregar trilhas salvas");
          if (isMounted) {
            setTrilhasSalvas([]);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro ao carregar trilhas salvas:", error);
        setTrilhasSalvas([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarTrilhasSalvas();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const handleTrilhaClick = (id: string) => {
    window.location.href = `/trilha?trilhaId=${id}`;
  };

  return (
    <PageWrapper 
      title="Lições Salvas" 
      description="Visualize as trilhas que você salvou para estudar depois"
    >
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "tvolq13xii");
        `}
      </Script>

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

            <section
              className={`pt-6 w-full ${
                isMobile ? "px-4" : "max-w-5/6 mx-auto px-24"
              }`}
              aria-labelledby="licoes-salvas-title"
            >
              <h1
                id="licoes-salvas-title"
                className={`${
                  isMobile ? "text-2xl" : "text-3xl"
                } p-4 rounded-xl text-[var(--text-primary)] font-bold bg-[var(--bg-card)] bg-opacity-80 backdrop-blur-sm border border-[var(--border-color)] transition-colors duration-300`}
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              >
                Lições Salvas
              </h1>
              {loading ? (
                <p className="text-[var(--text-secondary)] p-4" role="status" aria-live="polite">
                  Carregando...
                </p>
              ) : trilhasSalvas.length === 0 ? (
                <p className="text-[var(--text-secondary)] p-4" role="status" aria-live="polite">
                  Você ainda não salvou nenhuma trilha.
                </p>
              ) : (
                <Carrousel items={trilhasSalvas} onClick={handleTrilhaClick} />
              )}
            </section>
          </div>

          <Footer />
        </div>
      </div>
    </PageWrapper>
  );
}
