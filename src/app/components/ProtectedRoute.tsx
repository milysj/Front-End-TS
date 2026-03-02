"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ["/", "/login", "/cadastro", "/recuperar-senha"];

// Rotas que não precisam de perfil criado (além das públicas)
const ROUTES_WITHOUT_PROFILE = ["/criarPerfil"];

// Rotas restritas para PROFESSOR e ADMINISTRADOR (ALUNO não pode acessar)
const PROFESSOR_ROUTES = [
  "/gerenciarTrilha",
  "/gerenciarFases",
  "/criarFase",
  "/gerenciarPerguntas",
];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, loading } = useAuth();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    // Não faz nada enquanto o contexto de autenticação está carregando os dados iniciais.
    if (loading) {
      return;
    }

    const needsProfile = !ROUTES_WITHOUT_PROFILE.includes(pathname);
    const isProfessorRoute = PROFESSOR_ROUTES.includes(pathname);

    // Se não está autenticado e a rota não é pública, redireciona para o login.
    if (!isAuthenticated && !isPublic) {
      router.push("/login");
      return;
    }

    // Se está autenticado...
    if (isAuthenticated) {
      // Se o usuário está autenticado e tenta acessar /login ou /cadastro, redireciona para /home
      if (pathname === '/login' || pathname === '/cadastro') {
        router.push("/home");
        return;
      }
      
      // e o perfil do usuário não foi criado E a rota atual exige um perfil...
      const perfilCriado = user?.personagem && user?.username;
      if (!perfilCriado && needsProfile && !isPublic) {
        router.push("/criarPerfil");
        return;
      }
      
      // e o usuário é um ALUNO tentando acessar uma rota de professor...
      if (user?.tipoUsuario === 'ALUNO' && isProfessorRoute) {
        router.push("/home");
        return;
      }
    }

  }, [pathname, isAuthenticated, user, loading, router]);

  // Enquanto o AuthContext carrega, exibe uma tela de "Verificando..."
  // para evitar piscar o conteúdo ou redirecionamentos prematuros.
  if (loading && !isPublic) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] transition-colors duration-300" 
        style={{ minHeight: '100vh', width: '100%' }}
      >
        <div className="text-[var(--text-secondary)]">Verificando...</div>
      </div>
    );
  }

  // Se o usuário está autenticado e tem as permissões corretas, ou a rota é pública, renderiza o conteúdo.
  return <>{children}</>;
}
