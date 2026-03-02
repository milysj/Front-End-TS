"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Edit2,
  Trash2,
  Plus,
  Save,
  X,
  FileText,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  buscarSecoesPorTrilha,
  criarSecao,
  atualizarSecao,
  deletarSecao,
  type Secao,
} from "@/app/services/secaoService";
import {
  buscarFasesPorSecao,
  criarFase,
  atualizarFase,
  deletarFase,
} from "@/app/services/faseService";

interface Fase {
  _id?: string;
  titulo: string;
  descricao?: string;
  conteudo?: string;
  ordem: number;
  perguntas?: any[];
  secaoId?: string;
  tipo?: "perguntas" | "conteudo"; // Tipo da fase
}

export default function GerenciarFasesConteudo() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const titulo = searchParams.get("titulo");
  const trilhaId = searchParams.get("trilhaId");

  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [fasesPorSecao, setFasesPorSecao] = useState<{ [secaoId: string]: Fase[] }>({});
  const [secoesExpandidas, setSecoesExpandidas] = useState<{ [secaoId: string]: boolean }>({});
  
  const [novaSecao, setNovaSecao] = useState({
    titulo: "",
    descricao: "",
    ordem: 1,
  });
  
  // Removido estado novaFase - agora redireciona para página de criar fase
  
  const [secaoEditando, setSecaoEditando] = useState<string | null>(null);
  const [secaoEditada, setSecaoEditada] = useState<Secao | null>(null);
  const [faseEditando, setFaseEditando] = useState<string | null>(null);
  const [faseEditada, setFaseEditada] = useState<Fase | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string>("");

  useLayoutEffect(() => {
    document.title = "Gerenciar Fases - Estude.My";
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    if (!trilhaId) return;

    const carregarSecoes = async () => {
      if (!trilhaId || !isMounted) return;

      setLoading(true);
      setErro("");
      try {
        const token = localStorage.getItem("token");
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const response = await fetch(
          `${API_URL}/api/secoes/trilha/${trilhaId}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            signal: abortController.signal,
          }
        );

        if (!isMounted) return;

        if (!response.ok) {
          throw new Error(
            `Erro ao buscar seções da trilha: ${response.statusText}`
          );
        }

        const data = await response.json();

        if (isMounted) {
          const secoesOrdenadas = (data || []).sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));
          setSecoes(secoesOrdenadas);
          
          // Expandir primeira seção por padrão
          if (secoesOrdenadas.length > 0) {
            setSecoesExpandidas({ [secoesOrdenadas[0]._id!]: true });
          }
          
          // Carregar fases de cada seção
          for (const secao of secoesOrdenadas) {
            if (secao._id) {
              await carregarFasesSecao(secao._id);
            }
          }
        }
      } catch (error: any) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro ao carregar seções:", error);
        setErro(error.message || "Erro ao carregar seções");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarSecoes();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [trilhaId]);

  const carregarFasesSecao = async (secaoId: string) => {
    try {
      const fases = await buscarFasesPorSecao(secaoId);
      setFasesPorSecao((prev) => ({
        ...prev,
        [secaoId]: (fases || []).sort((a: Fase, b: Fase) => a.ordem - b.ordem),
      }));
    } catch (error: any) {
      console.error(`Erro ao carregar fases da seção ${secaoId}:`, error);
    }
  };

  const toggleSecao = (secaoId: string) => {
    setSecoesExpandidas((prev) => ({
      ...prev,
      [secaoId]: !prev[secaoId],
    }));
  };

  const handleCriarSecao = async () => {
    if (!trilhaId) {
      setErro("Nenhuma trilha selecionada!");
      return;
    }

    if (!novaSecao.titulo.trim()) {
      setErro("O título da seção é obrigatório!");
      return;
    }

    setLoading(true);
    setErro("");
    try {
      const secaoData = {
        trilhaId,
        titulo: novaSecao.titulo,
        descricao: novaSecao.descricao || "",
        ordem: novaSecao.ordem || secoes.length + 1,
      };

      const secaoCriada = await criarSecao(secaoData);
      const secoesOrdenadas = [...secoes, secaoCriada].sort((a, b) => a.ordem - b.ordem);
      setSecoes(secoesOrdenadas);
      setNovaSecao({ titulo: "", descricao: "", ordem: secoes.length + 2 });
      setSecoesExpandidas((prev) => ({ ...prev, [secaoCriada._id!]: true }));
    } catch (error: any) {
      console.error("Erro ao criar seção:", error);
      setErro(error.message || "Erro ao criar seção");
    } finally {
      setLoading(false);
    }
  };

  // Removido handleCriarFase - agora redireciona para página de criar fase

  const handleIniciarEdicaoSecao = (secao: Secao) => {
    setSecaoEditando(secao._id!);
    setSecaoEditada({ ...secao });
  };

  const handleCancelarEdicaoSecao = () => {
    setSecaoEditando(null);
    setSecaoEditada(null);
  };

  const handleSalvarEdicaoSecao = async () => {
    if (!secaoEditada || !secaoEditada._id) return;

    if (!secaoEditada.titulo.trim()) {
      setErro("O título da seção é obrigatório!");
      return;
    }

    setLoading(true);
    setErro("");
    try {
      const secaoAtualizada = await atualizarSecao(secaoEditada._id, {
        titulo: secaoEditada.titulo,
        descricao: secaoEditada.descricao || "",
        ordem: secaoEditada.ordem,
      });

      setSecoes(
        secoes.map((s) => (s._id === secaoAtualizada._id ? secaoAtualizada : s)).sort((a, b) => a.ordem - b.ordem)
      );
      setSecaoEditando(null);
      setSecaoEditada(null);
    } catch (error: any) {
      console.error("Erro ao atualizar seção:", error);
      setErro(error.message || "Erro ao atualizar seção");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarSecao = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta seção? Todas as fases dentro dela também serão deletadas.")) return;

    setLoading(true);
    setErro("");
    try {
      await deletarSecao(id);
      setSecoes(secoes.filter((s) => s._id !== id));
      setFasesPorSecao((prev) => {
        const novo = { ...prev };
        delete novo[id];
        return novo;
      });
    } catch (error: any) {
      console.error("Erro ao deletar seção:", error);
      setErro(error.message || "Erro ao deletar seção");
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarEdicaoFase = (fase: Fase) => {
    setFaseEditando(fase._id!);
    setFaseEditada({ ...fase });
  };

  const handleCancelarEdicaoFase = () => {
    setFaseEditando(null);
    setFaseEditada(null);
  };

  const handleSalvarEdicaoFase = async () => {
    if (!faseEditada || !faseEditada._id) return;

    if (!faseEditada.titulo.trim()) {
      setErro("O título da fase é obrigatório!");
      return;
    }

    // Validar se a ordem não está duplicada na mesma seção
    if (faseEditada.secaoId) {
      const fasesExistentes = fasesPorSecao[faseEditada.secaoId] || [];
      const ordemDuplicada = fasesExistentes.some(
        (f) => f._id !== faseEditada._id && f.ordem === faseEditada.ordem
      );
      
      if (ordemDuplicada) {
        setErro(`A ordem ${faseEditada.ordem} já está em uso nesta seção. Escolha outra ordem.`);
        return;
      }
    }

    setLoading(true);
    setErro("");
    try {
      const faseAtualizada = await atualizarFase(faseEditada._id, {
        titulo: faseEditada.titulo,
        descricao: faseEditada.descricao || "",
        conteudo: faseEditada.conteudo || "",
        ordem: faseEditada.ordem,
        perguntas: faseEditada.perguntas || [],
      });

      if (faseEditada.secaoId) {
        await carregarFasesSecao(faseEditada.secaoId);
      }
      setFaseEditando(null);
      setFaseEditada(null);
    } catch (error: any) {
      console.error("Erro ao atualizar fase:", error);
      setErro(error.message || "Erro ao atualizar fase");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarFase = async (id: string, secaoId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta fase?")) return;

    setLoading(true);
    setErro("");
    try {
      await deletarFase(id);
      await carregarFasesSecao(secaoId);
    } catch (error: any) {
      console.error("Erro ao deletar fase:", error);
      setErro(error.message || "Erro ao deletar fase");
    } finally {
      setLoading(false);
    }
  };

  if (!trilhaId) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-500 dark:text-red-400">Erro: Nenhuma trilha selecionada!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-4 md:p-6 bg-[var(--bg-card)] rounded-lg shadow-lg overflow-x-hidden border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
        <div className="flex-1 min-w-0">
          <Button
            variant="outline"
            onClick={() => router.push("/gerenciarTrilha")}
            className="flex items-center gap-2 w-full sm:w-auto shrink-0 mb-2"
            disabled={loading}
          >
            <ArrowLeft size={16} />
            <span className="whitespace-nowrap">Voltar</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold mb-2 break-words text-[var(--text-primary)]" style={{ color: 'var(--text-primary)' }}>
            Gerenciar Fases da Trilha
          </h1>
          {titulo && (
            <p className="text-sm sm:text-base text-[var(--text-secondary)] break-words" style={{ color: 'var(--text-secondary)' }}>
              {titulo}
            </p>
          )}
        </div>
      </div>

      {erro && (
        <div className="mb-4 p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded text-sm sm:text-base transition-colors duration-300">
          {erro}
        </div>
      )}

      {/* Formulário para criar nova seção */}
      <div className="mb-8 p-3 sm:p-4 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]" style={{ color: 'var(--text-primary)' }}>
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="break-words">Criar Nova Seção</span>
        </h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Título da seção *"
            value={novaSecao.titulo}
            onChange={(e) =>
              setNovaSecao({ ...novaSecao, titulo: e.target.value })
            }
            className="border border-[var(--border-color)] rounded p-2 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            disabled={loading}
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={novaSecao.descricao}
            onChange={(e) =>
              setNovaSecao({ ...novaSecao, descricao: e.target.value })
            }
            className="border border-[var(--border-color)] rounded p-2 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full resize-none transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            rows={2}
            disabled={loading}
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--text-secondary)] whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
              Ordem:
            </label>
            <input
              type="number"
              min="1"
              value={novaSecao.ordem}
              onChange={(e) =>
                setNovaSecao({
                  ...novaSecao,
                  ordem: parseInt(e.target.value) || 1,
                })
              }
              className="border border-[var(--border-color)] rounded p-2 w-20 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleCriarSecao}
            disabled={loading || !novaSecao.titulo.trim()}
            className="w-full text-sm sm:text-base"
          >
            {loading ? "Criando..." : "Criar Seção"}
          </Button>
        </div>
      </div>

      {/* Lista de seções */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold mb-4 text-[var(--text-primary)]" style={{ color: 'var(--text-primary)' }}>
          Seções ({secoes.length})
        </h2>
        {loading && secoes.length === 0 ? (
          <p className="text-[var(--text-secondary)]" style={{ color: 'var(--text-secondary)' }}>Carregando seções...</p>
        ) : secoes.length === 0 ? (
          <p className="text-[var(--text-secondary)]" style={{ color: 'var(--text-secondary)' }}>Nenhuma seção cadastrada ainda.</p>
        ) : (
          secoes.map((secao) => (
            <div
              key={secao._id}
              className="border border-[var(--border-color)] rounded-lg bg-[var(--bg-card)] transition-all duration-300 overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              {/* Header da seção */}
              <div
                className="p-3 sm:p-4 cursor-pointer hover:bg-[var(--bg-input)] transition-colors duration-300 flex items-center justify-between"
                onClick={() => toggleSecao(secao._id!)}
                style={{ backgroundColor: secoesExpandidas[secao._id!] ? 'var(--bg-input)' : undefined }}
              >
                <div className="flex-1 min-w-0">
                  {secaoEditando === secao._id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={secaoEditada?.titulo || ""}
                        onChange={(e) =>
                          setSecaoEditada({
                            ...secaoEditada!,
                            titulo: e.target.value,
                          })
                        }
                        className="w-full border border-[var(--border-color)] rounded p-2 text-sm sm:text-base font-bold bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        disabled={loading}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <textarea
                        value={secaoEditada?.descricao || ""}
                        onChange={(e) =>
                          setSecaoEditada({
                            ...secaoEditada!,
                            descricao: e.target.value,
                          })
                        }
                        className="w-full border border-[var(--border-color)] rounded p-2 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors duration-300"
                        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        rows={2}
                        disabled={loading}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-[var(--text-secondary)] whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                          Ordem:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={secaoEditada?.ordem || 1}
                          onChange={(e) =>
                            setSecaoEditada({
                              ...secaoEditada!,
                              ordem: parseInt(e.target.value) || 1,
                            })
                          }
                          className="border border-[var(--border-color)] rounded p-2 w-20 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                          disabled={loading}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSalvarEdicaoSecao();
                          }}
                          disabled={loading}
                          size="sm"
                          className="flex-1 w-full sm:w-auto text-sm sm:text-base"
                        >
                          <Save size={16} className="mr-2" />
                          Salvar
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelarEdicaoSecao();
                          }}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                          className="flex-1 w-full sm:w-auto text-sm sm:text-base"
                        >
                          <X size={16} className="mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                          Ordem: {secao.ordem}
                        </span>
                        <span className="text-xs sm:text-sm text-[var(--text-secondary)]" style={{ color: 'var(--text-secondary)' }}>
                          • {fasesPorSecao[secao._id!]?.length || 0} fase(s)
                        </span>
                      </div>
                      <h3 className="font-bold text-base sm:text-lg mb-1 break-words text-[var(--text-primary)]" style={{ color: 'var(--text-primary)' }}>
                        {secao.titulo}
                      </h3>
                      {secao.descricao && (
                        <p className="text-sm sm:text-base text-[var(--text-secondary)] break-words" style={{ color: 'var(--text-secondary)' }}>
                          {secao.descricao}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {secaoEditando !== secao._id && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIniciarEdicaoSecao(secao);
                        }}
                        disabled={loading}
                        className="flex-shrink-0"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletarSecao(secao._id!);
                        }}
                        disabled={loading}
                        className="flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                      {secoesExpandidas[secao._id!] ? (
                        <ChevronUp size={20} className="text-[var(--text-secondary)]" style={{ color: 'var(--text-secondary)' }} />
                      ) : (
                        <ChevronDown size={20} className="text-[var(--text-secondary)]" style={{ color: 'var(--text-secondary)' }} />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Conteúdo da seção (fases) */}
              {secoesExpandidas[secao._id!] && (
                <div className="p-3 sm:p-4 border-t border-[var(--border-color)]" style={{ borderColor: 'var(--border-color)' }}>
                  {/* Formulário para criar nova fase */}
                  <div className="mb-4 p-3 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    <h4 className="text-sm font-semibold mb-3 text-[var(--text-primary)]" style={{ color: 'var(--text-primary)' }}>
                      Criar Nova Fase
                    </h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            router.push(
                              `/criarFase?secaoId=${secao._id}&trilhaId=${trilhaId}&tipo=conteudo`
                            );
                          }}
                          className="flex-1"
                          disabled={loading}
                        >
                          <BookOpen size={16} className="mr-2" />
                          Criar Fase com Conteúdo
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            router.push(
                              `/criarFase?secaoId=${secao._id}&trilhaId=${trilhaId}&tipo=perguntas`
                            );
                          }}
                          className="flex-1"
                          disabled={loading}
                        >
                          <HelpCircle size={16} className="mr-2" />
                          Criar Fase com Perguntas
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de fases */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]" style={{ color: 'var(--text-primary)' }}>
                      Fases ({fasesPorSecao[secao._id!]?.length || 0})
                    </h4>
                    {loading && (!fasesPorSecao[secao._id!] || fasesPorSecao[secao._id!].length === 0) ? (
                      <p className="text-[var(--text-secondary)] text-sm" style={{ color: 'var(--text-secondary)' }}>Carregando fases...</p>
                    ) : !fasesPorSecao[secao._id!] || fasesPorSecao[secao._id!].length === 0 ? (
                      <p className="text-[var(--text-secondary)] text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhuma fase cadastrada nesta seção.</p>
                    ) : (
                      fasesPorSecao[secao._id!].map((fase) => (
                        <div
                          key={fase._id}
                          className="border border-[var(--border-color)] p-3 rounded-lg bg-[var(--bg-card)] hover:shadow-md transition-all duration-300"
                          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                        >
                          {faseEditando === fase._id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={faseEditada?.titulo || ""}
                                onChange={(e) =>
                                  setFaseEditada({
                                    ...faseEditada!,
                                    titulo: e.target.value,
                                  })
                                }
                                className="w-full border border-[var(--border-color)] rounded p-2 text-sm sm:text-base font-bold bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                disabled={loading}
                              />
                              <textarea
                                value={faseEditada?.descricao || ""}
                                onChange={(e) =>
                                  setFaseEditada({
                                    ...faseEditada!,
                                    descricao: e.target.value,
                                  })
                                }
                                className="w-full border border-[var(--border-color)] rounded p-2 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors duration-300"
                                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                rows={2}
                                disabled={loading}
                              />
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-[var(--text-secondary)] whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                                  Ordem:
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={faseEditada?.ordem || 1}
                                  onChange={(e) =>
                                    setFaseEditada({
                                      ...faseEditada!,
                                      ordem: parseInt(e.target.value) || 1,
                                    })
                                  }
                                  className="border border-[var(--border-color)] rounded p-2 w-20 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                                  style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                                  disabled={loading}
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  onClick={handleSalvarEdicaoFase}
                                  disabled={loading}
                                  size="sm"
                                  className="flex-1 w-full sm:w-auto text-sm sm:text-base"
                                >
                                  <Save size={16} className="mr-2" />
                                  Salvar
                                </Button>
                                <Button
                                  onClick={handleCancelarEdicaoFase}
                                  disabled={loading}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 w-full sm:w-auto text-sm sm:text-base"
                                >
                                  <X size={16} className="mr-2" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                              <div className="flex-1 min-w-0 w-full sm:w-auto">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                                    Ordem: {fase.ordem}
                                  </span>
                                  {fase.tipo === "perguntas" ? (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 dark:bg-purple-500/30 text-purple-600 dark:text-purple-300 rounded text-xs font-semibold whitespace-nowrap">
                                      <HelpCircle size={12} />
                                      Quiz ({fase.perguntas?.length || 0} pergunta{(fase.perguntas?.length || 0) !== 1 ? 's' : ''})
                                    </span>
                                  ) : fase.tipo === "conteudo" ? (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 dark:bg-blue-500/30 text-blue-600 dark:text-blue-300 rounded text-xs font-semibold whitespace-nowrap">
                                      <BookOpen size={12} />
                                      Conteúdo
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 dark:bg-gray-500/30 text-gray-600 dark:text-gray-300 rounded text-xs font-semibold whitespace-nowrap">
                                      Sem tipo definido
                                    </span>
                                  )}
                                </div>
                                <h5 className="font-bold text-sm sm:text-base mb-1 break-words text-[var(--text-primary)]" style={{ color: 'var(--text-primary)' }}>
                                  {fase.titulo}
                                </h5>
                                <p className="text-xs sm:text-sm text-[var(--text-secondary)] break-words" style={{ color: 'var(--text-secondary)' }}>
                                  {fase.descricao || "Sem descrição"}
                                </p>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto sm:ml-4 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/criarFase?faseId=${fase._id}&secaoId=${secao._id}&trilhaId=${trilhaId}&tipo=${fase.tipo || "conteudo"}`
                                    )
                                  }
                                  disabled={loading}
                                  title="Editar fase e conteúdo/perguntas"
                                  className="flex-1 sm:flex-none"
                                >
                                  <FileText size={16} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleIniciarEdicaoFase(fase)}
                                  disabled={loading}
                                  title="Editar informações básicas"
                                  className="flex-1 sm:flex-none"
                                >
                                  <Edit2 size={16} />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeletarFase(fase._id!, secao._id!)}
                                  disabled={loading}
                                  className="flex-1 sm:flex-none"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
