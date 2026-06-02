"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { API_ENDPOINTS } from "@/app/config/api.config";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type DificuldadeIa = "Facil" | "Medio" | "Dificil";

export interface PerguntaSugestaoUi {
  enunciado: string;
  alternativas: string[];
  respostaCorreta: string;
}

export interface FaseSugestaoUi {
  ordem: number;
  titulo: string;
  descricao: string;
  conteudo: string;
  perguntas: PerguntaSugestaoUi[];
}

export interface SecaoSugestaoUi {
  ordem: number;
  titulo: string;
  descricao: string;
  fases: FaseSugestaoUi[];
}

export interface TrilhaSugestaoRespostaUi {
  trilha: {
    titulo: string;
    descricao: string;
    materia: string;
    dificuldade: DificuldadeIa;
    faseSelecionada: number;
  };
  secoes: SecaoSugestaoUi[];
}

type Step = "form" | "result";

export interface GerarTrilhaIaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materiaInicial?: string;
  tituloTrilhaInicial?: string;
  trilhaId?: string;
  onPreencherFormularioTrilha?: (sugestao: TrilhaSugestaoRespostaUi) => void;
  onAplicouEstrutura?: () => void;
}

export default function GerarTrilhaIaDialog({
  open,
  onOpenChange,
  materiaInicial = "",
  tituloTrilhaInicial = "",
  trilhaId,
  onPreencherFormularioTrilha,
  onAplicouEstrutura,
}: GerarTrilhaIaDialogProps) {
  const [step, setStep] = useState<Step>("form");
  const [materia, setMateria] = useState("");
  const [tituloOpcional, setTituloOpcional] = useState("");
  const [temaOuObjetivo, setTemaOuObjetivo] = useState("");
  const [dificuldade, setDificuldade] = useState<DificuldadeIa>("Facil");
  const [numeroSecoes, setNumeroSecoes] = useState(2);
  const [fasesPorSecao, setFasesPorSecao] = useState(1);
  const [perguntasPorFase, setPerguntasPorFase] = useState(4);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sugestao, setSugestao] = useState<TrilhaSugestaoRespostaUi | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [aplicando, setAplicando] = useState(false);
  const [materiasDisponiveis, setMateriasDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setStep("form");
      setErro("");
      setSugestao(null);
      setMateria(materiaInicial || "");
      setTituloOpcional(tituloTrilhaInicial || "");
      setTemaOuObjetivo("");
      setExpanded({});

      // Buscar matérias permitidas
      const token = localStorage.getItem("token");
      if (token) {
        fetch(`${API_URL}/api/materias`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setMateriasDisponiveis(data);
          })
          .catch(err => console.error("Erro ao buscar matérias:", err));
      }
    }
  }, [open, materiaInicial, tituloTrilhaInicial]);

  const fechar = () => {
    onOpenChange(false);
  };

  const gerar = async () => {
    const mat = materia.trim();
    if (!mat) {
      setErro("Informe a matéria.");
      return;
    }

    setLoading(true);
    setErro("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErro("Faça login para usar a IA.");
        return;
      }

      const res = await fetch(`${API_URL}${API_ENDPOINTS.TRILHAS.GERAR_COM_IA}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          materia: mat,
          titulo: tituloOpcional.trim() || undefined,
          temaOuObjetivo: temaOuObjetivo.trim() || undefined,
          dificuldade,
          numeroSecoes,
          fasesPorSecao,
          perguntasPorFase,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          typeof data?.message === "string"
            ? data.message
            : typeof data?.error === "string"
              ? data.error
              : `Erro HTTP ${res.status}`;
        setErro(msg);
        return;
      }

      if (!data?.trilha || !Array.isArray(data?.secoes)) {
        setErro("Resposta da IA em formato inesperado.");
        return;
      }

      setSugestao(data as TrilhaSugestaoRespostaUi);
      setStep("result");
      const init: Record<string, boolean> = {};
      (data.secoes as SecaoSugestaoUi[]).forEach((s, i) => {
        init[`s${i}`] = i === 0;
      });
      setExpanded(init);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao chamar o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSec = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const aplicarNaTrilha = async () => {
    if (!trilhaId || !sugestao) return;

    const { criarSecao, buscarSecoesPorTrilha } = await import("@/app/services/secaoService");
    const { criarFase } = await import("@/app/services/faseService");

    setAplicando(true);
    setErro("");
    try {
      const secoesExistentes = await buscarSecoesPorTrilha(trilhaId);
      const baseOrdemSecao = (secoesExistentes || []).length;

      for (let si = 0; si < sugestao.secoes.length; si++) {
        const sec = sugestao.secoes[si];
        const secaoCriada = await criarSecao({
          trilhaId,
          titulo: sec.titulo || `Seção ${si + 1}`,
          descricao: sec.descricao || "",
          ordem: baseOrdemSecao + si + 1,
        });

        const sid = secaoCriada._id;
        if (!sid) continue;

        for (let fi = 0; fi < sec.fases.length; fi++) {
          const f = sec.fases[fi];
          const perguntas = (f.perguntas || []).map((p) => {
            const alts = (p.alternativas?.length ? p.alternativas : ["Opção A", "Opção B", "Opção C", "Opção D"])
              .map(a => String(a).trim() || "Opção")
              .slice(0, 4);
            // Garantir que haja pelo menos uma alternativa válida
            while (alts.length < 2) alts.push("Opção");
            return {
              enunciado: String(p.enunciado || "").trim() || "Pergunta sem enunciado",
              alternativas: alts,
              respostaCorreta: String(p.respostaCorreta || "").trim() || alts[0],
            };
          });

          await criarFase({
            trilhaId,
            secaoId: sid,
            titulo: f.titulo || `Fase ${fi + 1}`,
            descricao: f.descricao || "",
            conteudo: (f.conteudo || f.descricao || "").trim(),
            ordem: f.ordem ?? fi + 1,
            perguntas,
          });
        }
      }

      onAplicouEstrutura?.();
      fechar();
      window.location.reload();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao criar seções/fases.");
    } finally {
      setAplicando(false);
    }
  };

  const usarNoFormularioTrilha = () => {
    if (!sugestao || !onPreencherFormularioTrilha) return;
    onPreencherFormularioTrilha(sugestao);
    fechar();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl gap-0 p-4 sm:p-6"
        showCloseButton={!loading && !aplicando}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" aria-hidden />
            Gerar trilha com IA
          </DialogTitle>
          <DialogDescription>
            Descreva a matéria e o conteúdo; o backend chama o serviço de IA e devolve seções,
            fases e perguntas para você revisar antes de usar.
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="grid gap-3 py-4">
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)]">Matéria *</label>
              <input
                list="materias-ia-list"
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                placeholder="Ex.: Matemática"
                className="mt-1 w-full rounded border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-sm"
              />
              <datalist id="materias-ia-list">
                {materiasDisponiveis.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-sm font-medium">Título da trilha (opcional)</label>
              <input
                value={tituloOpcional}
                onChange={(e) => setTituloOpcional(e.target.value)}
                placeholder="Deixe em branco para a IA sugerir"
                className="mt-1 w-full rounded border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Conteúdo / objetivo *</label>
              <textarea
                value={temaOuObjetivo}
                onChange={(e) => setTemaOuObjetivo(e.target.value)}
                placeholder="Ex.: Frações equivalentes para 6º ano; foco em representação gráfica e problemas do cotidiano."
                rows={4}
                className="mt-1 w-full resize-none rounded border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Quanto mais específico, melhor serão as perguntas geradas.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">Dificuldade</label>
                <select
                  value={dificuldade}
                  onChange={(e) => setDificuldade(e.target.value as DificuldadeIa)}
                  className="mt-1 w-full rounded border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] px-3 py-2 text-sm transition-colors duration-300"
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                >
                  <option value="Facil" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Fácil</option>
                  <option value="Medio" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Médio</option>
                  <option value="Dificil" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Difícil</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Seções</label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={numeroSecoes}
                  onChange={(e) => setNumeroSecoes(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fases/seção</label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={fasesPorSecao}
                  onChange={(e) => setFasesPorSecao(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Perguntas por fase</label>
                <input
                  type="number"
                  min={2}
                  max={4}
                  value={perguntasPorFase}
                  onChange={(e) => setPerguntasPorFase(Number(e.target.value) || 2)}
                  className="mt-1 w-full rounded border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-sm"
                />
              </div>
            </div>
            {erro && (
              <div className="rounded bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
                <p>{erro}</p>
                {erro.toLowerCase().includes("suporte") && (
                  <div className="mt-2 text-right">
                    <a href="/faleConosco" className="underline font-bold text-red-900 dark:text-red-300 hover:text-red-700">
                      Entrar em contato com o suporte &rarr;
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === "result" && sugestao && (
          <div className="space-y-3 py-4">
            <div className="rounded-lg border bg-[var(--bg-input)] p-3 text-sm">
              <p className="font-semibold text-[var(--text-primary)]">{sugestao.trilha.titulo}</p>
              <p className="mt-1 text-[var(--text-secondary)]">{sugestao.trilha.descricao}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {sugestao.trilha.materia} · {sugestao.trilha.dificuldade === "Facil" ? "Fácil" : sugestao.trilha.dificuldade === "Medio" ? "Médio" : "Difícil"}
              </p>
            </div>

            <p className="text-sm font-medium">Revise seções, fases e perguntas</p>
            <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
              {sugestao.secoes.map((sec, si) => (
                <div key={`sec-${si}`} className="rounded-md border">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-muted/50"
                    onClick={() => toggleSec(`s${si}`)}
                  >
                    {expanded[`s${si}`] ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                    <span>
                      Seção {si + 1}: {sec.titulo}
                    </span>
                  </button>
                  {expanded[`s${si}`] && (
                    <div className="border-t px-3 pb-3 pt-1 text-sm">
                      {sec.descricao && (
                        <p className="mb-2 text-muted-foreground">{sec.descricao}</p>
                      )}
                      {sec.fases.map((fase, fi) => (
                        <div key={`f-${si}-${fi}`} className="mb-4 last:mb-0">
                          <p className="font-medium">
                            Fase {fase.ordem}: {fase.titulo}
                          </p>
                          {fase.perguntas?.map((p, pi) => (
                            <div
                              key={`p-${si}-${fi}-${pi}`}
                              className="mt-2 rounded bg-muted/40 p-2 text-xs"
                            >
                              <p className="font-medium">{p.enunciado}</p>
                              <ul className="mt-1 list-inside list-disc">
                                {(p.alternativas || []).map((a, ai) => (
                                  <li key={ai}>{a}</li>
                                ))}
                              </ul>
                              <p className="mt-1 text-green-700 dark:text-green-400">
                                Correta: {p.respostaCorreta}
                              </p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {erro && (
              <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-800">{erro}</p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === "form" && (
            <>
              <Button type="button" variant="outline" onClick={fechar} disabled={loading}>
                Cancelar
              </Button>
              <Button type="button" onClick={gerar} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando…
                  </>
                ) : (
                  "Gerar com IA"
                )}
              </Button>
            </>
          )}
          {step === "result" && sugestao && (
            <>
              <Button type="button" variant="outline" onClick={() => setStep("form")}>
                Voltar
              </Button>
              {!trilhaId && onPreencherFormularioTrilha && (
                <Button type="button" onClick={usarNoFormularioTrilha}>
                  Usar dados no formulário de trilha
                </Button>
              )}
              {trilhaId && (
                <Button type="button" onClick={aplicarNaTrilha} disabled={aplicando}>
                  {aplicando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aplicando…
                    </>
                  ) : (
                    "Criar seções e fases nesta trilha"
                  )}
                </Button>
              )}
              <Button type="button" variant="secondary" onClick={fechar}>
                Fechar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
