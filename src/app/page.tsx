"use client";
// Necessário para renderizar este componente no lado do cliente (usa animações e interatividade)

import CoinRain from "@/app/components/CoinRain"; // Efeito visual de moedas caindo

import {motion} from "framer-motion"; // Biblioteca para animações
import Image from "next/image";
import Script from "next/script";
import { useEffect, useLayoutEffect, useState } from "react";
import { useTheme } from "next-themes";
import ThemeToggle from "@/app/components/ThemeToggle";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

// Componente principal da Landing Page
export default function LandingPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useKeyboardNavigation();

    useEffect(() => {
        setMounted(true);
    }, []);
    
    useLayoutEffect(() => {
        document.title = "Estude.My - Aprenda Jogando";
    }, []);

    // Determinar a imagem de fundo baseada no tema
    const backgroundImage = resolvedTheme === "dark" 
        ? "/img/backgrounds/backgroun_lp_darkmode.jpg"
        : "/img/backgrounds/background_lp_ligthmode.png";

    if (!mounted) {
        return null;
    }
    
    return (
        <PageWrapper 
            title="Estude.My - Aprenda Jogando" 
            description="Plataforma de aprendizado gamificado. Comece sua jornada de aprendizado agora!"
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
                className="h-screen flex flex-col text-white relative overflow-hidden bg-cover bg-center"
                style={{backgroundImage: `url('${backgroundImage}')`}}
                role="banner"
                aria-label="Página inicial Estude.My"
            >
                <ThemeToggle />
                <CoinRain/>

                {/* Conteúdo principal (logo + botões) */}
                <div
                    className="flex-grow flex flex-col justify-center items-center px-4 py-6 overflow-hidden relative z-10"
                    role="region"
                    aria-label="Área principal de conteúdo"
                >
                    <section className="text-center max-w-3xl mb-12" aria-labelledby="landing-title">
                        {/* Logo */}
                        <div className="mb-6">
                            <Image
                                width={550}
                                height={128}
                                src="/svg/EstudeMyLogo.svg"
                                alt="Logo Estude.My - Plataforma de aprendizado gamificado"
                                className="m-auto h-32 drop-shadow-[4px_4px_0_#000]"
                                priority
                            />
                        </div>

                        <h1 id="landing-title" className="sr-only">
                            Estude.My - Aprenda Jogando
                        </h1>

                        {/* Botões principais (Cadastro / Login) */}
                        <nav aria-label="Navegação principal" className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-10">
                            <motion.a
                                href="/cadastro"
                                whileHover={{scale: 1.05}}
                                className="bg-green-600 text-white px-8 py-4 border-4 border-[#1b1b1b] shadow-[8px_8px_0_0_#000000] rounded-xl font-extrabold text-1xl transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                aria-label="Começar agora - Criar nova conta"
                            >
                                Começar agora!
                            </motion.a>

                            <motion.a
                                href="/login"
                                whileHover={{scale: 1.05}}
                                className="bg-yellow-600 text-white px-8 py-4 border-4 border-[#1b1b1b] shadow-[8px_8px_0_0_#000000] rounded-xl font-extrabold text-1xl transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                aria-label="Entrar - Fazer login na plataforma"
                            >
                                Entrar
                            </motion.a>
                        </nav>
                    </section>
                </div>
            </div>
        </PageWrapper>
    );
}
