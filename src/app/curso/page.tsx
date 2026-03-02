"use client";

import { useLayoutEffect, Suspense } from "react";
import Footer from "@/app/components/Footer"; // Componente do rodapé
import Topo from "@/app/components/Topo";     // Componente do topo/navegação
import Questao from "@/app/components/Questao"; // Componente de questão do curso
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function Curso() {
    const backgroundImage = useBackgroundImage("pages");
    useKeyboardNavigation();
    
    useLayoutEffect(() => {
        document.title = "Quiz - Estude.My";
    }, []);

    return (
        <PageWrapper 
            title="Quiz" 
            description="Responda as questões do quiz para testar seus conhecimentos"
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
                    <Topo/>

                    <main className="min-h-screen bg-transparent" aria-labelledby="quiz-title">
                        <h1 id="quiz-title" className="sr-only">Quiz de Questões</h1>
                        <Suspense
                            fallback={
                                <div className="flex items-center justify-center min-h-screen">
                                    <p className="text-[var(--text-secondary)]" role="status" aria-live="polite">
                                        Carregando quiz...
                                    </p>
                                </div>
                            }
                        >
                            <Questao/>
                        </Suspense>
                    </main>

                    <Footer/>
                </div>
            </div>
        </PageWrapper>
    );
}
