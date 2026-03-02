"use client";

import Faq from "@/app/components/Faq";         // Componente de perguntas frequentes
import Footer from "@/app/components/Footer";   // Componente do rodapé
import Topo from "@/app/components/Topo";       // Componente do topo/navegação
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function Home() {
    const backgroundImage = useBackgroundImage("pages");
    useKeyboardNavigation();
    
    return (
        <PageWrapper 
            title="Perguntas Frequentes" 
            description="Encontre respostas para as dúvidas mais comuns sobre o Estude.My"
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
                    <Topo/>

                    <div className="flex min-h-screen flex-col transition-all duration-300 justify-space-between">
                        <section aria-labelledby="faq-title">
                            <h1 id="faq-title" className="sr-only">Perguntas Frequentes</h1>
                            <Faq/>
                        </section>
                    </div>
                    <Footer />
                </div>
            </div>
        </PageWrapper>
    );
}
