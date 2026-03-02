"use client";

import { useState, useEffect, useLayoutEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { buscarFasePorId } from "@/app/services/faseService";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation, useAccessibleLoading } from "@/app/hooks/useAccessibility";
import apiClient from "@/app/services/api";

interface Fase {
  _id: string;
  titulo: string;
  descricao: string;
  conteudo?: string;
  tipo?: "conteudo" | "perguntas";
}

function ConteudoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const faseIdParam = searchParams.get("faseId");
  const trilhaIdParam = searchParams.get("trilhaId");

  const [fase, setFase] = useState<Fase | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  useKeyboardNavigation();

  useAccessibleLoading(loading, !!erro, !fase && !loading, "conteúdo da fase");

  useLayoutEffect(() => {
    document.title = "Conteúdo - Estude.My";
  }, []);

  useEffect(() => {
    const carregarConteudo = async () => {
      try {
        if (!faseIdParam) {
          setErro("Nenhuma fase selecionada.");
          setLoading(false);
          return;
        }

        const faseData = (await buscarFasePorId(faseIdParam)) as Fase;
        setFase(faseData);

        // Se não há conteúdo e não é tipo conteúdo, redirecionar
        if (faseData.tipo !== "conteudo" && (!faseData.conteudo || !faseData.conteudo.trim())) {
          if (trilhaIdParam) {
            router.push(`/trilha?trilhaId=${trilhaIdParam}`);
          } else {
            router.back();
          }
          return;
        }
      } catch (error) {
        console.error("Erro ao carregar conteúdo:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao carregar o conteúdo da fase.";
        setErro(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    carregarConteudo();
  }, [faseIdParam, router, trilhaIdParam]);

  const handleContinuar = async () => {
    if (!faseIdParam) return;
    
    setSalvando(true);
    setErro("");
    
    try {
      // Marcar a fase como concluída (pontuação 0, acertos 0, erros 0 para fases de conteúdo)
      await apiClient.post("/api/fases/concluir", {
        faseId: faseIdParam,
        pontuacao: 0,
        acertos: 0,
        erros: 0,
      });
      
      // Redirecionar de volta para a trilha
      if (trilhaIdParam) {
        window.location.href = `/trilha?trilhaId=${trilhaIdParam}`;
      } else {
        router.back();
      }
    } catch (error) {
      console.error("Erro ao marcar fase como concluída:", error);
      setErro("Erro ao salvar progresso. Tente novamente.");
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Conteúdo" description="Carregando conteúdo da fase">
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="text-lg text-[var(--text-secondary)]" role="status" aria-live="polite">
            Carregando conteúdo...
          </div>
        </main>
      </PageWrapper>
    );
  }

  if (erro || !fase) {
    return (
      <PageWrapper title="Conteúdo" description="Erro ao carregar conteúdo">
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <section className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              {erro || "Fase não encontrada"}
            </h2>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              aria-label="Voltar para página anterior"
            >
              Voltar
            </button>
          </section>
        </main>
      </PageWrapper>
    );
  }

  // Se não há conteúdo, não deveria chegar aqui (já redirecionou), mas por segurança:
  if (!fase.conteudo || !fase.conteudo.trim()) {
    if (trilhaIdParam) {
      router.push(`/trilha?trilhaId=${trilhaIdParam}`);
    } else {
      router.back();
    }
    return null;
  }

  return (
    <PageWrapper 
      title="Conteúdo" 
      description={`Conteúdo da fase: ${fase.titulo || "Aula"}`}
    >
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <article className="w-full max-w-3xl bg-[var(--bg-card)] p-8 rounded-xl shadow-lg border border-[var(--border-color)] mx-4 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} aria-labelledby="conteudo-title">
          <div className="mb-6">
            <h1 id="conteudo-title" className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ color: 'var(--text-primary)' }}>
              {fase.titulo || "Conteúdo da Aula"}
            </h1>
            {fase.descricao && (
              <p className="text-sm text-[var(--text-secondary)] mb-4" style={{ color: 'var(--text-secondary)' }}>{fase.descricao}</p>
            )}
          </div>

          {/* Conteúdo da aula */}
          <section className="mb-6" aria-labelledby="aula-title">
            <h2 id="aula-title" className="text-lg font-semibold text-[var(--text-primary)] mb-3" style={{ color: 'var(--text-primary)' }}>
              Aula
            </h2>
            <div
              className="prose max-w-none text-[var(--text-primary)] whitespace-pre-wrap bg-[var(--bg-input)] p-6 rounded-lg border border-[var(--border-color)] max-h-96 overflow-y-auto transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', minHeight: "200px" }}
              role="article"
              aria-label="Conteúdo da aula"
            >
              {fase.conteudo}
            </div>
          </section>

          {/* Mensagem de erro */}
          {erro && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {erro}
            </div>
          )}

          {/* Botão Continuar */}
          <nav className="flex gap-3 justify-end" aria-label="Navegação do conteúdo">
            <button
              onClick={handleContinuar}
              disabled={salvando}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              aria-label="Continuar e marcar fase como concluída"
            >
              {salvando ? "Salvando..." : "Continuar"}
            </button>
          </nav>
        </article>
      </main>
    </PageWrapper>
  );
}

export default function ConteudoPage() {
  return (
    <Suspense
      fallback={
        <PageWrapper title="Conteúdo" description="Carregando conteúdo">
          <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-lg text-[var(--text-secondary)]" role="status" aria-live="polite">
              Carregando conteúdo...
            </div>
          </main>
        </PageWrapper>
      }
    >
      <ConteudoContent />
    </Suspense>
  );
}
