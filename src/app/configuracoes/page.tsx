"use client";

import React, { useLayoutEffect } from "react";
import Configuracoes from "@/app/components/Configurações"; // Componente de configurações do usuário
import Footer from "@/app/components/Footer";                // Componente do rodapé
import Topo from "@/app/components/Topo";                    // Componente do topo/navegação
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function ConfiguracoesPage() {
    const backgroundImage = useBackgroundImage("pages");
    useKeyboardNavigation();
    
    useLayoutEffect(() => {
        document.title = "Configurações - Estude.My";
    }, []);

    return (
        <PageWrapper 
            title="Configurações" 
            description="Configure suas preferências de tema, idioma e outras opções"
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

                        <section className="flex flex-6" aria-labelledby="configuracoes-title">
                            <h1 id="configuracoes-title" className="sr-only">Configurações</h1>
                            <Configuracoes/>
                        </section>

                        <Footer/>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
