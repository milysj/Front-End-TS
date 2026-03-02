"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import Footer from "@/app/components/Footer";
import Topo from "@/app/components/Topo";
import Link from "next/link";
import Image from "next/image";
import ExperienceBar from "@/app/components/ExperienceBar";
import { useRouter } from "next/navigation";
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation, useAccessibleLoading } from "@/app/hooks/useAccessibility";

interface UserData {
  usuario: {
    _id: string;
    nome: string;
    email: string;
    username: string;
    personagem: string;
    fotoPerfil: string;
    materiaFavorita: string;
    xpTotal: number;
    telefone?: string;
    endereco?: string;
  };
  nivel: number;
  xpAtual: number;
  xpNecessario: number;
  xpAcumulado: number;
}

export default function PerfilPage() {
  const backgroundImage = useBackgroundImage("pages");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useKeyboardNavigation();

  useAccessibleLoading(loading, false, !userData && !loading, "dados do perfil");

  useLayoutEffect(() => {
    document.title = "Perfil - Estude.My";
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !isMounted) {
          if (!token) router.push("/login");
          return;
        }

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // Buscar dados de progresso e dados pessoais em paralelo
        const [progressoRes, userRes] = await Promise.all([
          fetch(`${API_URL}/api/progresso/usuario`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: abortController.signal,
          }),
          fetch(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: abortController.signal,
          }),
        ]);

        if (!isMounted) return;

        if (!progressoRes.ok || !userRes.ok) {
          if (progressoRes.status === 401 || userRes.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Erro ao buscar dados do usuário");
        }

        const progressoData = await progressoRes.json();
        const userDataFull = await userRes.json();

        if (!isMounted) return;

        // Mesclar dados
        setUserData({
          ...progressoData,
          usuario: {
            ...progressoData.usuario,
            telefone: userDataFull.telefone,
            endereco: userDataFull.endereco,
          },
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [router]);

  // Obter imagem do personagem
  const getPersonagemImage = (personagem: string) => {
    const personagemLower = personagem?.toLowerCase() || "";
    if (personagemLower === "guerreiro") return "/img/personagem.png";
    if (personagemLower === "mago") return "/img/personagem.png";
    if (personagemLower === "samurai") return "/img/personagem.png";
    return "/img/personagem.png";
  };

  if (loading) {
    return (
      <PageWrapper title="Perfil" description="Carregando dados do perfil">
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-[var(--text-secondary)]" role="status" aria-live="polite">
            Carregando...
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (!userData) {
    return (
      <PageWrapper title="Perfil" description="Erro ao carregar dados do perfil">
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-red-600" role="alert" aria-live="assertive">
            Erro ao carregar dados do usuário.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="Perfil" 
      description={`Perfil do usuário ${userData.usuario.username || userData.usuario.nome || "Usuário"}`}
    >
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundColor: "var(--bg-page)",
          backgroundAttachment: "local",
        }}
      >
        <div className="relative z-0">
          <div className="flex flex-col min-h-screen">
            <Topo />

            <section className="flex-1 flex items-start justify-center px-2 sm:px-4 md:px-6 lg:px-20 py-4 sm:py-6 w-full overflow-x-hidden" aria-labelledby="perfil-title">
              <div className="w-full max-w-6xl mx-auto my-auto min-w-0">
                <div className="pt-3 sm:pt-4 md:pt-6 w-full bg-[var(--bg-card)] rounded-lg shadow-md px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 overflow-hidden border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <h1 id="perfil-title" className="sr-only">
                    Perfil de {userData.usuario.username || userData.usuario.nome || "Usuário"}
                  </h1>
                  
                  <div className="text-3xl p-3 rounded-xl flex justify-center">
                    <Image
                      className="mx-auto"
                      src={
                        userData.usuario.fotoPerfil ||
                        getPersonagemImage(userData.usuario.personagem)
                      }
                      alt={`Imagem do personagem ${
                        userData.usuario.personagem || "Personagem"
                      }`}
                      width={90}
                      height={90}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getPersonagemImage(
                          userData.usuario.personagem
                        );
                      }}
                    />
                  </div>

                  <div className="character text-center mb-4">
                    <p className="font-bold text-lg md:text-xl">
                      {userData.usuario.username ||
                        userData.usuario.nome ||
                        "Usuário"}
                    </p>
                    {userData.usuario.personagem && (
                      <p className="text-sm text-[var(--text-secondary)]">
                        {userData.usuario.personagem}
                      </p>
                    )}
                  </div>

                  <div className="w-full mb-4" role="progressbar" aria-valuenow={userData.xpAtual} aria-valuemin={0} aria-valuemax={userData.xpNecessario} aria-label={`Nível ${userData.nivel}, ${userData.xpAtual} de ${userData.xpNecessario} pontos de experiência`}>
                    <ExperienceBar
                      currentLevel={userData.nivel}
                      currentXp={userData.xpAtual}
                      xpToNextLevel={userData.xpNecessario}
                    />
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-sm text-[var(--text-secondary)]">
                      XP Total: {userData.usuario.xpTotal || 0}
                    </p>
                  </div>

                  <nav className="buttons-container flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center mb-4 pb-4 px-2 sm:px-0 w-full overflow-hidden" aria-label="Navegação do perfil">
                    <Link
                      className="blue-btn w-full sm:w-auto text-center min-w-0 px-3 sm:px-4 md:px-5 lg:px-6 text-xs sm:text-sm md:text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                      href={"/personagem"}
                      aria-label="Gerenciar personagem"
                    >
                      <span className="whitespace-nowrap">PERSONAGEM</span>
                    </Link>
                    <Link
                      className="blue-btn w-full sm:w-auto text-center min-w-0 px-3 sm:px-4 md:px-5 lg:px-6 text-xs sm:text-sm md:text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                      href={"/conta"}
                      aria-label="Gerenciar conta"
                    >
                      <span className="whitespace-nowrap">CONTA</span>
                    </Link>
                  </nav>
                </div>
              </div>
            </section>

            <Footer />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
