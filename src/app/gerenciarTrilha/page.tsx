"use client";

import React, { useEffect, useLayoutEffect } from "react";
import CriarTrilha from "@/app/components/CriarTrilha"; // Componente para criar trilhas
import Footer from "@/app/components/Footer";           // Componente do rodapé
import Topo from "@/app/components/Topo";               // Componente do topo/navegação
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function CriarTrilhaPage() {
    const backgroundImage = useBackgroundImage("pages");
    useKeyboardNavigation();
    
    useLayoutEffect(() => {
        document.title = "Gerenciar Trilha - Estude.My";
    }, []);

    return (
        <PageWrapper 
            title="Gerenciar Trilha" 
            description="Crie e gerencie trilhas de aprendizado"
        >
            <div
                className="min-h-screen bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('${backgroundImage}')`,
                    backgroundColor: 'var(--bg-page)',
                    backgroundAttachment: "local",
                }}
            >
                <div className="relative z-10">
                    <div className="flex flex-col min-h-screen">
                        <Topo/>

                        <section className="flex flex-6 justify-center items-center mx-auto" aria-labelledby="gerenciar-trilha-title">
                            <h1 id="gerenciar-trilha-title" className="sr-only">Gerenciar Trilha</h1>
                            <CriarTrilha/>
                        </section>

                        <Footer/>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
