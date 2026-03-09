"use client";

import Login from "@/app/components/Login"; // Componente de login do usuário
import Script from "next/script";
import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function LoginPage() {
    const router = useRouter();
    useKeyboardNavigation();

    // useLayoutEffect executa antes da pintura, garantindo que o título seja definido cedo
    useLayoutEffect(() => {
        document.title = "Login - Estude.My";
    }, []);

    useEffect(() => {
        const verificarAutenticacao = async () => {
            const token = localStorage.getItem("token");
            
            if (!token) {
                return; // Não está autenticado, pode ver a página de login
            }

            // Verificar se o token é válido
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                const res = await fetch(`${API_URL}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    // Token válido, usuário já está autenticado, redirecionar para home
                    router.push("/home");
                } else {
                    // Token inválido, remover e permitir acesso à página de login
                    localStorage.removeItem("token");
                }
            } catch (error) {
                console.error("Erro ao verificar autenticação:", error);
                // Em caso de erro, remover token e permitir acesso
                localStorage.removeItem("token");
            }
        };

        verificarAutenticacao();
    }, [router]);

    
    return (
        <PageWrapper 
            title="Login" 
            description="Faça login na sua conta Estude.My para continuar aprendendo"
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
            <div className="flex min-h-screen flex-col transition-all duration-300 justify-space-between bg-gray-50">
                <Login/>
            </div>
        </PageWrapper>
    );

}
