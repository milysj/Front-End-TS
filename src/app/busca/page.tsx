"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Topo from "@/app/components/Topo";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation, useAccessibleLoading } from "@/app/hooks/useAccessibility";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"; 

interface Trilha {
  _id: string;
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: string;
  imagem?: string;
  pagamento: string;
  usuario?: {
    _id: string;
    nome: string;
    username: string;
  };
}

// Lista de matérias disponíveis para filtro
const MATERIAS = [
  "Todas",
  "Matemática",
  "Português",
  "História",
  "Geografia",
  "Ciências",
  "Biologia",
  "Física",
  "Química",
  "Inglês",
  "Espanhol",
  "Artes",
  "Educação Física",
  "Filosofia",
  "Sociologia",
  "Literatura",
];

function BuscaContent() {
  const backgroundImage = useBackgroundImage("pages");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [termoBusca, setTermoBusca] = useState("");
  const [materiaFiltro, setMateriaFiltro] = useState("Todas");
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useKeyboardNavigation();

  useAccessibleLoading(loading, !!error, trilhas.length === 0 && !loading, "trilhas");

  useLayoutEffect(() => {
    document.title = "Busca - Estude.My";
  }, []);

  const buscarTrilhas = useCallback(async (termo: string, materia?: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Adicionar token se existir (opcional)
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Construir URL com parâmetros de busca
      let url = `${API_URL}/api/trilhas/buscar?q=${encodeURIComponent(termo)}`;
      if (materia && materia !== "Todas") {
        url += `&materia=${encodeURIComponent(materia)}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erro na resposta:", response.status, errorData);
        throw new Error(errorData.message || "Erro ao buscar trilhas");
      }

      const data = await response.json();
      console.log("Trilhas encontradas:", data);
      setTrilhas(data || []);
    } catch (err) {
      console.error("Erro ao buscar trilhas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao buscar trilhas. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const materiaParam = searchParams.get("materia");
    setTermoBusca(q);
    if (materiaParam) {
      setMateriaFiltro(materiaParam);
      buscarTrilhas(q, materiaParam);
    } else {
      buscarTrilhas(q);
    }
  }, [searchParams, buscarTrilhas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = `/busca?q=${encodeURIComponent(termoBusca.trim())}`;
    if (materiaFiltro && materiaFiltro !== "Todas") {
      url += `&materia=${encodeURIComponent(materiaFiltro)}`;
    }
    router.push(url);
  };

  const handleMateriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novaMateria = e.target.value;
    setMateriaFiltro(novaMateria);
    // Buscar mesmo sem termo de busca, apenas com filtro de matéria
    let url = `/busca?q=${encodeURIComponent(termoBusca.trim())}`;
    if (novaMateria && novaMateria !== "Todas") {
      url += `&materia=${encodeURIComponent(novaMateria)}`;
    }
    router.push(url);
  };

  return (
    <PageWrapper 
      title="Busca" 
      description={`Buscar trilhas${termoBusca ? ` para "${termoBusca}"` : ""}`}
    >
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundColor: "var(--bg-page)",
          backgroundAttachment: "local",
        }}
      >
        <div className="relative z-10">
          <div className="flex flex-col min-h-screen">
            <Topo />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl" aria-labelledby="busca-title">
              <h1 id="busca-title" className="sr-only">Buscar Trilhas</h1>
              
              {/* Barra de busca e filtro */}
              <section
                className="mb-8 bg-[var(--bg-card)] p-4 rounded-lg shadow-md border border-[var(--border-color)] transition-colors duration-300"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
                aria-label="Formulário de busca"
              >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                    <label htmlFor="termo-busca" className="sr-only">
                      Pesquisar trilhas
                    </label>
                    <input
                      id="termo-busca"
                      type="text"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      placeholder="Pesquisar trilhas..."
                      className="flex-1 w-full md:w-auto px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                      style={{
                        backgroundColor: "var(--bg-input)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-color)",
                        maxWidth: "100%",
                      }}
                      aria-label="Termo de busca"
                    />
                    <button
                      type="submit"
                      className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 dark:hover:bg-blue-500 transition rounded-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                      aria-label="Buscar trilhas"
                    >
                      Buscar
                    </button>
                  </div>
                  {/* Filtro de matéria */}
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="materia-filtro"
                      className="text-sm font-medium text-[var(--text-primary)] whitespace-nowrap"
                    >
                      Filtrar por matéria:
                    </label>
                    <select
                      id="materia-filtro"
                      value={materiaFiltro}
                      onChange={handleMateriaChange}
                      className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                      style={{
                        backgroundColor: "var(--bg-input)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-color)",
                        maxWidth: "200px",
                        minWidth: "200px",
                      }}
                      aria-label="Filtrar por matéria"
                    >
                      {MATERIAS.map((materia) => (
                        <option key={materia} value={materia}>
                          {materia}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </section>

              {/* Resultados */}
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-[var(--text-secondary)]" role="status" aria-live="polite">
                    Buscando...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 dark:text-red-400" role="alert" aria-live="assertive">
                    {error}
                  </p>
                </div>
              ) : trilhas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[var(--text-secondary)]" role="status" aria-live="polite">
                    {termoBusca.trim() !== ""
                      ? `Nenhuma trilha encontrada para "${termoBusca}"`
                      : materiaFiltro !== "Todas"
                      ? `Nenhuma trilha encontrada para a matéria "${materiaFiltro}"`
                      : "Nenhuma trilha encontrada"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                      {trilhas.length}{" "}
                      {trilhas.length === 1
                        ? "trilha encontrada"
                        : "trilhas encontradas"}
                      {termoBusca.trim() !== "" && ` para "${termoBusca}"`}
                      {materiaFiltro !== "Todas" && (
                        <>
                          {termoBusca.trim() !== "" ? " em " : " em "}
                          {materiaFiltro}
                        </>
                      )}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" role="list">
                    {trilhas.map((trilha) => (
                      <article
                        key={trilha._id}
                        role="listitem"
                        className="bg-[var(--bg-card)] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border border-[var(--border-color)] transition-colors duration-300"
                        style={{
                          backgroundColor: "var(--bg-card)",
                          borderColor: "var(--border-color)",
                        }}
                      >
                        <Link
                          href={`/trilha?trilhaId=${trilha._id}`}
                          className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                          aria-label={`Ver trilha: ${trilha.titulo}`}
                        >
                          {trilha.imagem && (
                            <img
                              src={trilha.imagem}
                              alt={`Imagem da trilha ${trilha.titulo}`}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-[var(--text-primary)]">
                              {trilha.titulo}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-3">
                              {trilha.descricao}
                            </p>
                            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                              <span>{trilha.materia}</span>
                              <span className="capitalize">
                                {trilha.dificuldade === "Facil"
                                  ? "Fácil"
                                  : trilha.dificuldade === "Medio"
                                  ? "Médio"
                                  : "Difícil"}
                              </span>
                            </div>
                            {trilha.usuario && (
                              <p className="text-xs text-[var(--text-muted)] mt-2">
                                Por {trilha.usuario.nome}
                              </p>
                            )}
                            {trilha.pagamento === "Paga" && (
                              <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded transition-colors duration-300" aria-label="Trilha paga">
                                Paga
                              </span>
                            )}
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function Busca() {
  const backgroundImage = useBackgroundImage("pages");

  return (
    <Suspense
      fallback={
        <PageWrapper title="Busca" description="Carregando página de busca">
          <div
            className="min-h-screen bg-cover bg-center bg-no-repeat relative"
            style={{
              backgroundImage: `url('${backgroundImage}')`,
              backgroundColor: "var(--bg-page)",
              backgroundAttachment: "local",
            }}
          >
            <div className="relative z-10">
              <div className="flex flex-col min-h-screen">
                <Topo />
                <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                  <div className="text-center py-12">
                    <p className="text-[var(--text-secondary)]" role="status" aria-live="polite">
                      Carregando...
                    </p>
                  </div>
                </div>
                <Footer />
              </div>
            </div>
          </div>
        </PageWrapper>
      }
    >
      <BuscaContent />
    </Suspense>
  );
}
