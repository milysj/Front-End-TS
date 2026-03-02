"use client";

import { useState, useEffect, useLayoutEffect, Suspense } from "react";
import { ArrowLeft, Plus, Save, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  buscarFasePorId,
  atualizarFase,
  criarFase,
  buscarFasesPorSecao,
} from "@/app/services/faseService";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import Topo from "@/app/components/Topo";
import Footer from "@/app/components/Footer";

interface Pergunta {
  id: number;
  enunciado: string;
  alternativas: string[];
  respostaCorreta: number;
}

function CriarFaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const faseId = searchParams.get("faseId");
  const trilhaId = searchParams.get("trilhaId");
  const secaoId = searchParams.get("secaoId");
  const backgroundImage = useBackgroundImage("pages");
  useKeyboardNavigation();

  const [trilha, setTrilha] = useState<{ _id: string; titulo?: string } | null>(
    null
  );
  const [fase, setFase] = useState<{
    _id: string;
    titulo?: string;
    descricao?: string;
    conteudo?: string;
    ordem?: number;
    perguntas?: Pergunta[];
    tipo?: "conteudo" | "perguntas";
  } | null>(null);
  const [tipoFase, setTipoFase] = useState<"conteudo" | "perguntas">("conteudo");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [tituloFase, setTituloFase] = useState("");
  const [descricaoFase, setDescricaoFase] = useState("");
  const [conteudoFase, setConteudoFase] = useState("");
  const [ordemFase, setOrdemFase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useLayoutEffect(() => {
    document.title = faseId
      ? "Editar Fase - Estude.My"
      : "Criar Fase - Estude.My";
  }, [faseId]);

  // Carregar dados da trilha e fase
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Se não tiver trilhaId nos params, tentar do localStorage
        const trilhaIdFinal =
          trilhaId ||
          (() => {
            const dados = localStorage.getItem("trilha");
            if (dados) {
              const trilhaObj = JSON.parse(dados);
              return trilhaObj._id;
            }
            return null;
          })();

        // Não buscamos a trilha pois o endpoint GET /api/trilhas/:id não existe
        // Apenas armazenamos o ID para uso posterior
        if (trilhaIdFinal) {
          setTrilha({ _id: trilhaIdFinal });
        }

        // Se tiver faseId, carregar fase existente
        if (faseId) {
          const faseData = (await buscarFasePorId(faseId)) as {
            _id: string;
            titulo?: string;
            descricao?: string;
            conteudo?: string;
            ordem?: number;
            perguntas?: Pergunta[];
            tipo?: "conteudo" | "perguntas";
          };
          setFase(faseData);
          setTituloFase(faseData.titulo || "");
          setDescricaoFase(faseData.descricao || "");
          setConteudoFase(faseData.conteudo || "");
          setOrdemFase(faseData.ordem || 1);
          // Definir o tipo da fase
          const tipo = faseData.tipo || (faseData.perguntas && faseData.perguntas.length > 0 ? "perguntas" : "conteudo");
          setTipoFase(tipo);
          // Garantir que todas as perguntas tenham um id único
          const perguntasComId = (faseData.perguntas || []).map(
            (
              pergunta: Partial<Pergunta> & { _id?: string | number },
              index: number
            ) => ({
              id:
                (pergunta.id as number) ||
                (typeof pergunta._id === "number"
                  ? pergunta._id
                  : Date.now() + index),
              enunciado: pergunta.enunciado || "",
              alternativas: pergunta.alternativas || ["", "", "", ""],
              respostaCorreta: pergunta.respostaCorreta ?? 0,
            })
          );
          setPerguntas(perguntasComId);
        } else {
          // Se não tem faseId, verificar se tem tipo na URL
          const tipoParam = searchParams.get("tipo");
          if (tipoParam === "perguntas" || tipoParam === "conteudo") {
            setTipoFase(tipoParam);
          }
          
          // Se tem secaoId, calcular a próxima ordem disponível
          if (secaoId) {
            try {
              const fasesExistentes = await buscarFasesPorSecao(secaoId);
              let proximaOrdem = 1;
              
              if (fasesExistentes && fasesExistentes.length > 0) {
                const ordensExistentes = fasesExistentes
                  .map((f: any) => f.ordem)
                  .filter((o: number) => o != null)
                  .sort((a: number, b: number) => a - b);
                
                // Encontrar a primeira ordem disponível
                for (let i = 0; i < ordensExistentes.length; i++) {
                  if (ordensExistentes[i] !== i + 1) {
                    proximaOrdem = i + 1;
                    break;
                  }
                  proximaOrdem = i + 2;
                }
              }
              
              setOrdemFase(proximaOrdem);
            } catch (error) {
              console.error("Erro ao calcular ordem:", error);
              // Em caso de erro, manter ordem padrão 1
            }
          }
        }
      } catch (error: unknown) {
        console.error("Erro ao carregar dados:", error);
        setErro(
          error instanceof Error ? error.message : "Erro ao carregar dados"
        );
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [faseId, trilhaId]);

  const handleAddPergunta = () => {
    setPerguntas((prev) => [
      ...prev,
      {
        id: Date.now(),
        enunciado: "",
        alternativas: ["", "", "", ""],
        respostaCorreta: 0,
      },
    ]);
  };

  const handleRemovePergunta = (perguntaId: number) => {
    setPerguntas((prev) => prev.filter((p) => p.id !== perguntaId));
  };

  const handleChangePergunta = (
    perguntaId: number,
    campo: string,
    valor: string | number,
    altIndex?: number
  ) => {
    setPerguntas((prev) =>
      prev.map((p) =>
        p.id === perguntaId
          ? {
              ...p,
              [campo]:
                campo === "alternativas" && typeof altIndex === "number"
                  ? p.alternativas.map((alt, i) =>
                      i === altIndex ? (valor as string) : alt
                    )
                  : valor,
            }
          : p
      )
    );
  };

  const validarPerguntas = () => {
    for (const pergunta of perguntas) {
      if (!pergunta.enunciado.trim()) {
        return "Todas as perguntas devem ter um enunciado!";
      }
      if (pergunta.alternativas.some((alt) => !alt.trim())) {
        return "Todas as alternativas devem ser preenchidas!";
      }
    }
    return null;
  };

  const salvarFase = async () => {
    const trilhaIdFinal = trilhaId || trilha?._id;

    if (!trilhaIdFinal) {
      setErro("Nenhuma trilha selecionada!");
      return;
    }

    if (!tituloFase.trim()) {
      setErro("O título da fase é obrigatório!");
      return;
    }

    // Validar conteúdo se for tipo conteúdo
    if (tipoFase === "conteudo" && !conteudoFase.trim()) {
      setErro("O conteúdo da fase é obrigatório para fases de conteúdo!");
      return;
    }

    // Validar perguntas apenas se for tipo perguntas
    if (tipoFase === "perguntas") {
      const erroValidacao = validarPerguntas();
      if (erroValidacao) {
        setErro(erroValidacao);
        return;
      }
    }

    // Validar se a ordem não está duplicada (apenas ao criar nova fase)
    if (!faseId && secaoId) {
      try {
        const fasesExistentes = await buscarFasesPorSecao(secaoId);
        const ordemDuplicada = fasesExistentes.some(
          (f: any) => f.ordem === ordemFase
        );
        
        if (ordemDuplicada) {
          setErro(`A ordem ${ordemFase} já está em uso nesta seção. A ordem será recalculada automaticamente.`);
          // Recalcular ordem automaticamente
          const ordensExistentes = fasesExistentes
            .map((f: any) => f.ordem)
            .filter((o: number) => o != null)
            .sort((a: number, b: number) => a - b);
          
          let novaOrdem = 1;
          for (let i = 0; i < ordensExistentes.length; i++) {
            if (ordensExistentes[i] !== i + 1) {
              novaOrdem = i + 1;
              break;
            }
            novaOrdem = i + 2;
          }
          
          setOrdemFase(novaOrdem);
          // Continuar com a nova ordem calculada
        }
      } catch (error) {
        console.error("Erro ao validar ordem:", error);
        // Continuar mesmo com erro na validação
      }
    }

    setSalvando(true);
    setErro("");

    try {
      const faseData = {
        trilhaId: trilhaIdFinal,
        secaoId: secaoId || undefined, // Incluir secaoId se disponível
        titulo: tituloFase,
        descricao: descricaoFase,
        tipo: tipoFase, // Incluir o tipo
        conteudo: tipoFase === "conteudo" ? conteudoFase : undefined,
        ordem: ordemFase,
        perguntas: tipoFase === "perguntas" ? perguntas.map((p) => ({
          enunciado: p.enunciado,
          alternativas: p.alternativas,
          respostaCorreta: p.respostaCorreta,
        })) : undefined,
      };

      if (faseId && fase) {
        // Atualizar fase existente
        await atualizarFase(faseId, faseData);
        alert("Fase atualizada com sucesso!");
      } else {
        // Criar nova fase
        await criarFase(faseData);
        alert("Fase criada com sucesso!");
      }

      // Redirecionar para gerenciar fases
      router.push(
        `/gerenciarFases?trilhaId=${trilhaIdFinal}&titulo=${
          trilha?.titulo || ""
        }`
      );
    } catch (error: unknown) {
      console.error("Erro ao salvar fase:", error);
      setErro(error instanceof Error ? error.message : "Erro ao salvar fase");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title={faseId ? "Editar Fase" : "Criar Fase"} description="Carregando dados">
        <div
          className="min-h-screen bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundColor: "var(--bg-page)",
            backgroundAttachment: "local",
          }}
        >
          <Topo />
          <main className="p-6">
            <p className="text-[var(--text-primary)]" role="status" aria-live="polite" style={{ color: 'var(--text-primary)' }}>Carregando dados...</p>
          </main>
          <Footer />
        </div>
      </PageWrapper>
    );
  }

  // Não bloquear se não tiver trilha, apenas avisar
  if (!trilha && !trilhaId && !faseId) {
    return (
      <PageWrapper title={faseId ? "Editar Fase" : "Criar Fase"} description="Erro: Nenhuma trilha selecionada">
        <div
          className="min-h-screen bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundColor: "var(--bg-page)",
            backgroundAttachment: "local",
          }}
        >
          <Topo />
          <main className="p-6">
            <p className="text-red-500 dark:text-red-400" role="alert" aria-live="assertive">
              Erro: Nenhuma trilha selecionada!
            </p>
          </main>
          <Footer />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title={faseId ? "Editar Fase" : "Criar Fase"} 
      description={faseId ? "Edite os dados da fase" : "Crie uma nova fase para sua trilha"}
    >
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundColor: "var(--bg-page)",
          backgroundAttachment: "local",
        }}
      >
        <Topo />
        <main className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto bg-[var(--bg-card)] rounded-lg shadow-lg w-full overflow-x-hidden border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 break-words text-[var(--text-primary)]" style={{ color: 'var(--text-primary)' }}>
            {faseId ? "Editar Fase" : "Criar Nova Fase"}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2 w-full sm:w-auto shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          disabled={loading || salvando}
          aria-label="Voltar para página anterior"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span className="whitespace-nowrap">Voltar</span>
        </Button>
      </div>
      {(trilha || trilhaId) && (
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-6 break-words" style={{ color: 'var(--text-secondary)' }}>
          Trilha: {trilha?.titulo || `ID: ${trilhaId}`}
        </p>
      )}

      {erro && (
        <div 
          className="mb-4 p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded text-sm sm:text-base transition-colors duration-300"
          role="alert"
          aria-live="assertive"
        >
          {erro}
        </div>
      )}

      {/* Informações da Fase */}
      <div className="mb-6 p-3 sm:p-4 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
        <h2 className="text-base sm:text-lg font-semibold mb-4 text-[var(--text-primary)]" style={{ color: 'var(--text-primary)' }}>
          Informações da Fase
        </h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="titulo-fase" className="block text-sm font-medium text-[var(--text-primary)] mb-1" style={{ color: 'var(--text-primary)' }}>
              Título da Fase *
            </label>
            <input
              id="titulo-fase"
              type="text"
              placeholder="Ex: Fase 1 - Introdução"
              value={tituloFase}
              onChange={(e) => setTituloFase(e.target.value)}
              className="w-full border border-[var(--border-color)] rounded p-2 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              disabled={salvando}
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="descricao-fase" className="block text-sm font-medium text-[var(--text-primary)] mb-1" style={{ color: 'var(--text-primary)' }}>
              Descrição
            </label>
            <textarea
              id="descricao-fase"
              placeholder="Descrição da fase (opcional)"
              value={descricaoFase}
              onChange={(e) => setDescricaoFase(e.target.value)}
              className="w-full border border-[var(--border-color)] rounded p-2 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              rows={2}
              disabled={salvando}
            />
          </div>
          {tipoFase === "conteudo" && (
            <div>
              <label htmlFor="conteudo-fase" className="block text-sm font-medium text-[var(--text-primary)] mb-1" style={{ color: 'var(--text-primary)' }}>
                Conteúdo da Aula/Explicação *
              </label>
              <textarea
                id="conteudo-fase"
                placeholder="Adicione o conteúdo da aula ou explicação sobre a matéria."
                value={conteudoFase}
                onChange={(e) => setConteudoFase(e.target.value)}
                className="w-full border border-[var(--border-color)] rounded p-2 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                rows={8}
                disabled={salvando}
                aria-required="true"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1" style={{ color: 'var(--text-secondary)' }}>
                Este conteúdo será exibido para os alunos nesta fase.
              </p>
            </div>
          )}
          <div>
            <label htmlFor="ordem-fase" className="block text-sm font-medium text-[var(--text-primary)] mb-1" style={{ color: 'var(--text-primary)' }}>
              Ordem
            </label>
            <input
              id="ordem-fase"
              type="number"
              min="1"
              value={ordemFase}
              onChange={(e) => setOrdemFase(parseInt(e.target.value) || 1)}
              className="w-32 border border-[var(--border-color)] rounded p-2 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              disabled={salvando || !faseId}
              readOnly={!faseId}
              title={!faseId ? "A ordem é calculada automaticamente para evitar duplicatas" : "Edite a ordem da fase"}
              aria-label="Ordem da fase"
            />
            {!faseId && (
              <p className="text-xs text-[var(--text-secondary)] mt-1" style={{ color: 'var(--text-secondary)' }}>
                A ordem é calculada automaticamente
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Perguntas - apenas se tipo for perguntas */}
      {tipoFase === "perguntas" && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]" style={{ color: 'var(--text-primary)' }}>
              Perguntas ({perguntas.length})
            </h2>
            <button
              className="flex items-center gap-2 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm sm:text-base w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              onClick={handleAddPergunta}
              disabled={salvando}
              aria-label="Adicionar nova pergunta"
            >
              <Plus size={16} aria-hidden="true" />{" "}
              <span className="whitespace-nowrap">Adicionar Pergunta</span>
            </button>
          </div>

        {perguntas.length === 0 && (
          <p className="text-[var(--text-secondary)] text-center py-8 bg-[var(--bg-input)] rounded border border-[var(--border-color)] transition-colors duration-300" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
            Nenhuma pergunta criada ainda. Clique em Adicionar Pergunta para
            começar. Você pode adicionar múltiplas perguntas.
          </p>
        )}

        {perguntas.map((p) => (
          <div
            key={p.id}
            className="mb-4 p-3 sm:p-4 border border-[var(--border-color)] rounded bg-[var(--bg-input)] w-full overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex justify-between items-start mb-3 gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)] break-words" style={{ color: 'var(--text-primary)' }}>
                Pergunta {perguntas.indexOf(p) + 1}
              </h3>
              <button
                onClick={() => handleRemovePergunta(p.id)}
                className="text-red-600 hover:text-red-800 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                disabled={salvando}
                aria-label={`Remover pergunta ${perguntas.indexOf(p) + 1}`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <label htmlFor={`enunciado-${p.id}`} className="sr-only">
              Enunciado da pergunta {perguntas.indexOf(p) + 1}
            </label>
            <input
              id={`enunciado-${p.id}`}
              type="text"
              placeholder="Enunciado da pergunta"
              value={p.enunciado}
              onChange={(e) =>
                handleChangePergunta(p.id, "enunciado", e.target.value)
              }
              className="w-full border border-[var(--border-color)] rounded p-2 mb-3 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              disabled={salvando}
              aria-required="true"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2" style={{ color: 'var(--text-primary)' }}>
                Alternativas (selecione a correta):
              </label>
              {p.alternativas.map((alt, i) => (
                <div
                  key={`${p.id}-alt-${i}`}
                  className="flex items-center gap-2"
                >
                  <input
                    type="radio"
                    id={`correta-${p.id}-${i}`}
                    name={`correta-${p.id}`}
                    checked={p.respostaCorreta === i}
                    onChange={() =>
                      handleChangePergunta(p.id, "respostaCorreta", i)
                    }
                    className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                    disabled={salvando}
                    aria-label={`Marcar alternativa ${i + 1} como correta`}
                  />
                  <label htmlFor={`alt-${p.id}-${i}`} className="sr-only">
                    Alternativa {i + 1}
                  </label>
                  <input
                    id={`alt-${p.id}-${i}`}
                    type="text"
                    placeholder={`Alternativa ${i + 1}`}
                    value={alt}
                    onChange={(e) =>
                      handleChangePergunta(
                        p.id,
                        "alternativas",
                        e.target.value,
                        i
                      )
                    }
                    className="flex-1 border border-[var(--border-color)] rounded p-2 text-sm sm:text-base bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] transition-colors duration-300"
                    style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    disabled={salvando}
                    aria-required="true"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Botão Salvar */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <button
          className="px-4 sm:px-6 py-2 border border-[var(--border-color)] rounded hover:bg-[var(--bg-input)] flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] transition-colors duration-300"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          onClick={() => router.back()}
          disabled={salvando}
          aria-label="Voltar sem salvar"
        >
          <X size={16} aria-hidden="true" />
          Voltar
        </button>
        <button
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 text-sm sm:text-base w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          onClick={salvarFase}
          disabled={salvando || !tituloFase.trim()}
          aria-busy={salvando}
          aria-disabled={salvando || !tituloFase.trim()}
        >
          <Save size={16} aria-hidden="true" />{" "}
          {salvando ? "Salvando..." : faseId ? "Atualizar Fase" : "Criar Fase"}
        </button>
      </div>
        </main>
        <Footer />
      </div>
    </PageWrapper>
  );
}

function CriarFaseFallback() {
  const backgroundImage = useBackgroundImage("pages");
  return (
    <PageWrapper title="Criar Fase" description="Carregando dados">
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundColor: "var(--bg-page)",
          backgroundAttachment: "local",
        }}
      >
        <Topo />
        <main className="p-6">
          <p className="text-[var(--text-primary)]" role="status" aria-live="polite" style={{ color: 'var(--text-primary)' }}>Carregando dados...</p>
        </main>
        <Footer />
      </div>
    </PageWrapper>
  );
}

export default function CriarFase() {
  return (
    <Suspense fallback={<CriarFaseFallback />}>
      <CriarFaseContent />
    </Suspense>
  );
}
