"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import Footer from "@/app/components/Footer";
import Topo from "@/app/components/Topo";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation, useAccessibleLoading } from "@/app/hooks/useAccessibility";

interface UserData {
  _id: string;
  nome: string;
  email: string;
  username: string;
  personagem: string;
  fotoPerfil: string;
}

const CLASSES = [
  { nome: "Guerreiro", imagem: "/img/guerreiro.png", descricao: "Um guerreiro corajoso e forte" },
  { nome: "Mago", imagem: "/img/mago.png", descricao: "Um mago sábio e poderoso" },
  { nome: "Samurai", imagem: "/img/samurai.png", descricao: "Um samurai ágil e honrado" },
];

// Skins disponíveis para cada classe (por enquanto usando as mesmas imagens, mas pode ser expandido)
const SKINS = {
  Guerreiro: [
    { nome: "Padrão", imagem: "/img/guerreiro.png" },
    { nome: "Elite", imagem: "/img/guerreiro.png" },
    { nome: "Lendário", imagem: "/img/guerreiro.png" },
  ],
  Mago: [
    { nome: "Padrão", imagem: "/img/mago.png" },
    { nome: "Arcano", imagem: "/img/mago.png" },
    { nome: "Místico", imagem: "/img/mago.png" },
  ],
  Samurai: [
    { nome: "Padrão", imagem: "/img/samurai.png" },
    { nome: "Mestre", imagem: "/img/samurai.png" },
    { nome: "Lendário", imagem: "/img/samurai.png" },
  ],
};

export default function PersonagemPage() {
  const backgroundImage = useBackgroundImage("pages");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [classeSelecionada, setClasseSelecionada] = useState<string>("");
  const [skinSelecionada, setSkinSelecionada] = useState<string>("Padrão");
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const router = useRouter();
  useKeyboardNavigation();

  useAccessibleLoading(loading, false, !userData && !loading, "dados do personagem");

  useLayoutEffect(() => {
    document.title = "Personalizar Personagem - Estude.My";
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

        const userRes = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        });

        if (!isMounted) return;

        if (!userRes.ok) {
          if (userRes.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Erro ao buscar dados do usuário");
        }

        const userDataFull = await userRes.json();

        if (isMounted) {
          setUserData(userDataFull);
          setClasseSelecionada(userDataFull.personagem || "Guerreiro");
          setSkinSelecionada("Padrão"); // Por enquanto sempre começa com Padrão
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro ao buscar dados do usuário:", error);
        setMensagem({ tipo: "erro", texto: "Erro ao carregar dados do usuário" });
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

  const handleSalvar = async () => {
    if (!classeSelecionada) {
      setMensagem({ tipo: "erro", texto: "Selecione uma classe" });
      return;
    }

    setSalvando(true);
    setMensagem(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Atualizar personagem no backend
      // Tentar endpoint específico primeiro, depois endpoint genérico
      let res = await fetch(`${API_URL}/api/users/atualizar-personagem`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          personagem: classeSelecionada,
          // skin: skinSelecionada, // Quando o backend suportar skins
        }),
      });

      // Se o endpoint específico não existir, tentar endpoint genérico de atualização
      if (!res.ok && res.status === 404) {
        res = await fetch(`${API_URL}/api/users/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            personagem: classeSelecionada,
          }),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao atualizar personagem");
      }

      setMensagem({ tipo: "sucesso", texto: "Personagem atualizado com sucesso!" });
      
      // Atualizar dados locais
      if (userData) {
        setUserData({ ...userData, personagem: classeSelecionada });
      }

      // Redirecionar após 1.5 segundos
      setTimeout(() => {
        router.push("/perfil");
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar personagem:", error);
      setMensagem({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Erro ao atualizar personagem",
      });
    } finally {
      setSalvando(false);
    }
  };

  const skinsDisponiveis = SKINS[classeSelecionada as keyof typeof SKINS] || SKINS.Guerreiro;

  if (loading) {
    return (
      <PageWrapper title="Personalizar Personagem" description="Carregando dados do personagem">
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-page)' }}>
          <p className="text-lg text-[var(--text-secondary)]" role="status" aria-live="polite">
            Carregando...
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (!userData) {
    return (
      <PageWrapper title="Personalizar Personagem" description="Erro ao carregar dados do personagem">
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-page)' }}>
          <p className="text-lg text-red-600 dark:text-red-400" role="alert" aria-live="assertive">
            Erro ao carregar dados do usuário.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="Personalizar Personagem" 
      description="Escolha e personalize seu personagem"
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

          {/* Container principal */}
          <main className="flex-1 flex items-start justify-center px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-6 w-full" aria-labelledby="personagem-title">
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-[var(--bg-card)] rounded-lg shadow-md p-4 sm:p-6 md:p-8 border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-[var(--text-primary)]" id="personagem-title">
                  Personalizar Personagem
                </h1>

                {/* Mensagem de sucesso/erro */}
                {mensagem && (
                  <div
                    className={`mb-4 p-3 rounded-lg transition-colors duration-300 ${
                      mensagem.tipo === "sucesso"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                    }`}
                    role={mensagem.tipo === "erro" ? "alert" : "status"}
                    aria-live={mensagem.tipo === "erro" ? "assertive" : "polite"}
                  >
                    {mensagem.texto}
                  </div>
                )}

                {/* Seleção de Classe */}
                <section className="mb-8" aria-labelledby="selecao-classe">
                  <h2 id="selecao-classe" className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Escolha sua Classe</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="radiogroup" aria-label="Seleção de classe do personagem">
                    {CLASSES.map((classe) => (
                      <button
                        key={classe.nome}
                        type="button"
                        onClick={() => {
                          setClasseSelecionada(classe.nome);
                          setSkinSelecionada("Padrão");
                        }}
                        className={`cursor-pointer rounded-xl border-4 transition-all transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${
                          classeSelecionada === classe.nome
                            ? "border-blue-600 shadow-lg"
                            : "border-transparent hover:border-[var(--border-color)]"
                        }`}
                        aria-pressed={classeSelecionada === classe.nome}
                        aria-label={`Selecionar classe ${classe.nome}: ${classe.descricao}`}
                      >
                        <div className="p-4 flex flex-col items-center bg-[var(--bg-input)] rounded-lg transition-colors duration-300" style={{ backgroundColor: 'var(--bg-input)' }}>
                          <Image
                            src={classe.imagem}
                            alt={classe.nome}
                            width={120}
                            height={120}
                            className="rounded-xl mb-2"
                          />
                          <p
                            className={`font-semibold text-lg ${
                              classeSelecionada === classe.nome
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-[var(--text-primary)]"
                            }`}
                          >
                            {classe.nome}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)] text-center mt-1">
                            {classe.descricao}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Seleção de Skin */}
                {classeSelecionada && (
                  <section className="mb-8" aria-labelledby="selecao-skin">
                    <h2 id="selecao-skin" className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
                      Skins de {classeSelecionada}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="radiogroup" aria-label={`Seleção de skin para ${classeSelecionada}`}>
                      {skinsDisponiveis.map((skin, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSkinSelecionada(skin.nome)}
                          className={`cursor-pointer rounded-xl border-4 transition-all transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${
                            skinSelecionada === skin.nome
                              ? "border-blue-600 shadow-lg"
                              : "border-transparent hover:border-[var(--border-color)]"
                          }`}
                          aria-pressed={skinSelecionada === skin.nome}
                          aria-label={`Selecionar skin ${skin.nome}`}
                        >
                          <div className="p-4 flex flex-col items-center bg-[var(--bg-input)] rounded-lg transition-colors duration-300" style={{ backgroundColor: 'var(--bg-input)' }}>
                            <Image
                              src={skin.imagem}
                              alt={skin.nome}
                              width={100}
                              height={100}
                              className="rounded-xl mb-2"
                            />
                            <p
                              className={`font-medium ${
                                skinSelecionada === skin.nome
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-[var(--text-primary)]"
                              }`}
                            >
                              {skin.nome}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Preview do Personagem Selecionado */}
                {classeSelecionada && (
                  <div className="mb-6 p-6 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    <h3 className="text-lg font-semibold mb-4 text-center text-[var(--text-primary)]">Preview</h3>
                    <div className="flex flex-col items-center">
                      <Image
                        src={
                          skinsDisponiveis.find((s) => s.nome === skinSelecionada)?.imagem ||
                          CLASSES.find((c) => c.nome === classeSelecionada)?.imagem ||
                          "/img/personagem.png"
                        }
                        alt="Preview"
                        width={150}
                        height={150}
                        className="rounded-xl mb-2"
                      />
                      <p className="font-semibold text-lg text-[var(--text-primary)]">{classeSelecionada}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{skinSelecionada}</p>
                    </div>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleSalvar}
                    disabled={salvando || !classeSelecionada}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                    aria-busy={salvando}
                    aria-disabled={salvando || !classeSelecionada}
                  >
                    {salvando ? "Salvando..." : "Salvar Alterações"}
                  </button>
                  <button
                    onClick={() => router.push("/perfil")}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                    aria-label="Cancelar e voltar ao perfil"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </main>

          <Footer />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

