"use client";
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { BookText, ArrowUp, Bookmark, BookmarkCheck, BookOpen, HelpCircle } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import SplashScreen from "@/app/components/game/SplashScreen";
import NPSForm from "@/app/components/NPSForm";
import {
  buscarFasesPorTrilha,
  buscarFasePorId,
} from "@/app/services/faseService";
import { useLanguage } from "@/app/contexts/LanguageContext";
import apiClient from "@/app/services/api";
import { API_ENDPOINTS } from "@/app/config/api.config";

interface Fase {
  _id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  perguntas?: any[];
  conteudo?: string;
  tipo?: "conteudo" | "perguntas";
}

interface TrilhasProps {
  trilhaId?: string;
}

function TooltipDescricao({
  fase,
  onStart,
  isLocked,
  isCompletada,
  mensagemBloqueio,
}: {
  fase: Fase;
  onStart: () => void;
  isLocked: boolean;
  isCompletada?: boolean;
  mensagemBloqueio?: string;
}) {
  const { t } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: [0.8, 1.05, 1], y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
      className="absolute -bottom-36 left-1/2 -translate-x-1/2 w-64 bg-[var(--bg-card)] rounded-2xl shadow-2xl text-[var(--text-primary)] p-4 z-50 border border-[var(--border-color)] transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <p className="font-bold text-lg">{t("trail.description")}</p>
        {fase.perguntas && fase.perguntas.length > 0 ? (
          <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-semibold">
            <HelpCircle size={12} />
            Quiz
          </span>
        ) : fase.conteudo || fase.tipo === "conteudo" ? (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-semibold">
            <BookOpen size={12} />
            Conteúdo
          </span>
        ) : null}
      </div>
      <p className="text-sm opacity-90 mb-2">{fase.titulo}</p>
      <p className="text-xs opacity-75 mb-3 text-[var(--text-secondary)]">
        {fase.descricao || t("trail.noDescription")}
      </p>
      {isCompletada && (
        <p className="text-xs opacity-90 mb-2 text-green-400 dark:text-green-300 font-semibold">
          ✓ {t("trail.completed")}
        </p>
      )}
      {isLocked && mensagemBloqueio && (
        <p className="text-xs opacity-90 mb-2 text-yellow-500 dark:text-yellow-400 italic">
          {mensagemBloqueio}
        </p>
      )}
      <button
        onClick={!isLocked ? onStart : undefined}
        disabled={isLocked}
        className={`w-full py-2 rounded-xl shadow-md font-bold transition-all 
          ${
            isLocked
              ? "bg-gray-400 dark:bg-gray-600 text-[var(--text-muted)] cursor-not-allowed"
              : isCompletada
              ? "bg-green-400 dark:bg-green-500 text-white hover:scale-105 active:scale-95"
              : "bg-[var(--bg-input)] text-blue-600 dark:text-blue-400 hover:scale-105 active:scale-95"
          }`}
        style={isLocked ? {} : isCompletada ? {} : { backgroundColor: 'var(--bg-input)' }}
      >
        {isLocked 
          ? t("trail.locked")
          : isCompletada 
          ? t("trail.review")
          : t("trail.start")}
      </button>
    </motion.div>
  );
}

export default function Trilhas({ trilhaId }: TrilhasProps) {
  const { t } = useLanguage();
  const [fases, setFases] = useState<Fase[]>([]);
  const [trilha, setTrilha] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const [characterPos, setCharacterPos] = useState({ x: 0, y: 0 });
  const [characterFacingRight, setCharacterFacingRight] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [trilhaSalva, setTrilhaSalva] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [progressoFases, setProgressoFases] = useState<Map<string, boolean>>(new Map());
  const [personagemUsuario, setPersonagemUsuario] = useState<string | null>(null);
  const [mostrarSplash, setMostrarSplash] = useState(false);
  const [urlParaRedirecionar, setUrlParaRedirecionar] = useState<string | null>(null);
  const [mostrarNPS, setMostrarNPS] = useState(false);

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tracksRef = useRef<HTMLDivElement | null>(null);
  const characterRef = useRef<HTMLDivElement | null>(null);

  const controls = useAnimation();

  // Carregar personagem do usuário
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const carregarPersonagem = async () => {
      try {
        const userRes = await apiClient.get(
          API_ENDPOINTS.USERS.ME,
          { signal: abortController.signal }
        );

        if (!isMounted) return;

        if (isMounted && userRes.data?.personagem) {
          setPersonagemUsuario(userRes.data.personagem);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro ao carregar personagem do usuário:", error);
      }
    };

    carregarPersonagem();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  // Verificar se deve mostrar o formulário NPS
  useEffect(() => {
    const verificarMostrarNPS = () => {
      // Verificar se o usuário já respondeu ou pulou recentemente
      const ultimaResposta = localStorage.getItem("nps_ultima_resposta");
      const ultimoPulo = localStorage.getItem("nps_ultimo_pulo");
      
      // Se já respondeu ou pulou nas últimas 7 dias, não mostrar
      const seteDiasAtras = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (ultimaResposta && new Date(ultimaResposta).getTime() > seteDiasAtras) {
        return;
      }
      if (ultimoPulo && new Date(ultimoPulo).getTime() > seteDiasAtras) {
        return;
      }
      
      // Contar quantas vezes o usuário jogou
      const partidasJogadas = parseInt(localStorage.getItem("partidas_jogadas") || "0", 10);
      
      // Mostrar após 3 partidas ou mais
      if (partidasJogadas >= 3) {
        // Verificar se acabou de voltar do jogo (verificar timestamp da última partida)
        const ultimaPartidaTimestamp = localStorage.getItem("ultima_partida_timestamp");
        const agora = Date.now();
        const cincoMinutosAtras = agora - (5 * 60 * 1000); // 5 minutos
        
        // Verificar também pelo referrer (se ainda estiver disponível)
        const veioDoJogo = (ultimaPartidaTimestamp && parseInt(ultimaPartidaTimestamp, 10) > cincoMinutosAtras) ||
                          document.referrer.includes("/game");
        
        if (veioDoJogo) {
          // Aguardar um pouco para a página carregar completamente
          setTimeout(() => {
            setMostrarNPS(true);
            // Limpar timestamp para não mostrar novamente imediatamente
            localStorage.removeItem("ultima_partida_timestamp");
          }, 1500);
        }
      }
    };

    // Verificar quando a página carregar
    const timeoutId = setTimeout(() => {
      verificarMostrarNPS();
    }, 500);
    
    // Verificar quando a página receber foco (voltar do jogo)
    const handleFocus = () => {
      setTimeout(() => {
        verificarMostrarNPS();
      }, 500);
    };

    window.addEventListener("focus", handleFocus);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Recarregar progresso quando a página voltar do jogo
  useEffect(() => {
    const handleFocus = () => {
      if (trilhaId && fases.length > 0) {
        // Recarregar progresso quando a página receber foco (voltar do jogo)
        const recarregarProgresso = async () => {
          try {
            const progressoRes = await apiClient.get(
              API_ENDPOINTS.PROGRESSO.TRILHA(trilhaId)
            );
            const progressoData = progressoRes.data;
            const progressoMap = new Map<string, boolean>();
            
            if (progressoData?.progresso) {
              Object.entries(progressoData.progresso).forEach(([faseId, completado]) => {
                progressoMap.set(faseId, completado === true);
              });
            }
            
            setProgressoFases(progressoMap);
          } catch (error) {
            console.error("Erro ao recarregar progresso:", error);
          }
        };
        
        recarregarProgresso();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [trilhaId, fases.length]);

  // Carregar fases da trilha
  useEffect(() => {
    if (!trilhaId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    const carregarDados = async () => {
      try {
        // Verificar se a trilha está salva ANTES de carregar outros dados
        if (trilhaId && isMounted) {
          try {
            const salvaRes = await apiClient.get(
              API_ENDPOINTS.LICOES_SALVAS.VERIFICAR(trilhaId),
              { signal: abortController.signal }
            );
            if (!isMounted) return;
            
            if (isMounted) {
              setTrilhaSalva(!!salvaRes.data?.salva);
            }
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") return;
            if (!isMounted) return;
            console.error("Erro ao verificar se trilha está salva:", error);
            if (isMounted) {
              setTrilhaSalva(false);
            }
          }
        }

        if (!isMounted) return;

        // Buscar informações da trilha usando o serviço centralizado
        try {
          const trilhaRes = await apiClient.get(
            API_ENDPOINTS.TRILHAS.POR_ID(trilhaId),
            { signal: abortController.signal }
          );

          if (!isMounted) return;

          if (isMounted) {
            setTrilha(trilhaRes.data);
          }
        } catch (error: any) {
          if (error instanceof Error && error.name === "AbortError") return;
          if (!isMounted) return;
          
          // Se for erro 404, a trilha não existe - não é um erro crítico
          if (error.response?.status === 404) {
            console.warn("Trilha não encontrada:", trilhaId);
            // Continuar mesmo sem os dados da trilha - as fases podem ser carregadas
          } else {
            console.error("Erro ao buscar trilha:", error);
          }
        }

        // Buscar fases
        const fasesData = await buscarFasesPorTrilha(trilhaId);
        const fasesOrdenadas = fasesData.sort(
          (a: Fase, b: Fase) => a.ordem - b.ordem
        );
        setFases(fasesOrdenadas);

        // Buscar progresso de todas as fases de uma vez (otimizado)
        if (fasesOrdenadas.length > 0 && isMounted) {
          try {
            const progressoRes = await apiClient.get(
              API_ENDPOINTS.PROGRESSO.TRILHA(trilhaId),
              { signal: abortController.signal }
            );
            
            if (!isMounted) return;
            
            const progressoData = progressoRes.data;
            const progressoMap = new Map<string, boolean>();
            
            // Converter o objeto de progresso em Map
            if (progressoData?.progresso) {
              Object.entries(progressoData.progresso).forEach(([faseId, completado]) => {
                progressoMap.set(faseId, completado === true);
              });
            }
            
            console.log("Progresso carregado:", progressoMap);
            
            if (isMounted) {
              setProgressoFases(progressoMap);
            }
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") return;
            if (!isMounted) return;
            console.error("Erro ao buscar progresso da trilha:", error);
            if (isMounted) {
              setProgressoFases(new Map());
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro ao carregar fases:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarDados();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [trilhaId]);

  // Função para mover o personagem
  const moveCharacter = async (index: number) => {
    if (fases.length === 0) return;

    const btn = buttonRefs.current[index];
    const container = tracksRef.current;
    if (!btn || !container) return;

    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const charRect = characterRef.current?.getBoundingClientRect();

    const charW = charRect?.width ?? 40;
    const charH = charRect?.height ?? 40;

    const isLeft = index % 2 === 0;
    const margin = 6;

    // Virar personagem para o lado correto
    setCharacterFacingRight(!isLeft);

    const btnLeftRel = btnRect.left - containerRect.left;
    const btnRightRel = btnRect.right - containerRect.left;
    const btnTopRel = btnRect.top - containerRect.top;

    const x = isLeft ? btnLeftRel - charW - margin : btnRightRel + margin;
    const y = btnTopRel + btnRect.height / 2 - charH / 2;

    // animação de pulo antes de mover
    await controls.start({
      y: characterPos.y - 20,
      transition: { duration: 0.15 },
    });
    await controls.start({
      x,
      y,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    });
    setCharacterPos({ x, y });
  };

  // Posição inicial: mover para a primeira fase quando fases carregarem
  useLayoutEffect(() => {
    if (fases.length > 0) {
      // Mover imediatamente para a primeira fase enquanto espera o progresso
      moveCharacter(0);
    }
  }, [fases.length]);

  // Atualizar posição quando o progresso for carregado
  useEffect(() => {
    if (fases.length === 0) return;

    // Usar requestAnimationFrame para garantir que o DOM está atualizado
    const rafId = requestAnimationFrame(() => {
      // Aguardar um pouco para garantir que os botões estão renderizados
      setTimeout(async () => {
        // Se tem progresso carregado, calcular baseado nele
        if (progressoFases.size > 0) {
          // Encontrar a última fase concluída em sequência
          let ultimaFaseConcluidaIndex = -1;
          
          for (let i = 0; i < fases.length; i++) {
            const faseCompletada = progressoFases.get(fases[i]._id);
            if (faseCompletada) {
              ultimaFaseConcluidaIndex = i;
            } else {
              // Se encontrou uma fase não concluída, para aqui
              break;
            }
          }
          
          // Mover para a próxima fase disponível (última concluída + 1)
          const faseAtualIndex = ultimaFaseConcluidaIndex + 1;
          
          // Se todas as fases foram concluídas, ficar na última
          const indexFinal = faseAtualIndex >= fases.length ? fases.length - 1 : faseAtualIndex;
          
          await moveCharacter(indexFinal);
        }
        // Se não tem progresso, já está na primeira fase (movido pelo useLayoutEffect)
      }, 50); // Delay reduzido para resposta mais rápida
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [progressoFases.size, fases.length]);

  // Mostrar botão voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Atualizar progresso quando a página ganha foco (usuário volta após completar fase)
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const handleFocus = async () => {
      if (!trilhaId || fases.length === 0 || !isMounted) return;
      
      try {
        const progressoRes = await apiClient.get(
          API_ENDPOINTS.PROGRESSO.TRILHA(trilhaId),
          { signal: abortController.signal }
        );

        if (!isMounted) return;

        const progressoData = progressoRes.data;
        const progressoMap = new Map<string, boolean>();
        
        // Converter o objeto de progresso em Map
        if (progressoData?.progresso) {
          Object.entries(progressoData.progresso).forEach(([faseId, completado]) => {
            progressoMap.set(faseId, completado === true);
          });
        }
        
        if (isMounted) {
          setProgressoFases(progressoMap);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro ao atualizar progresso:", error);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      isMounted = false;
      abortController.abort();
      window.removeEventListener("focus", handleFocus);
    };
  }, [trilhaId, fases]);

  const handleButtonClick = (index: number) => {
    setTooltipIndex(index);
    moveCharacter(index);
  };

  const handleStart = async (faseId: string) => {
    // Fechar o modal de descrição imediatamente
    setTooltipIndex(null);
    
    try {
      // Primeiro, verificar se a fase já está carregada no estado
      const faseExistente = fases.find(f => f._id === faseId);
      
      // Se a fase já está carregada e é de conteúdo, redirecionar imediatamente
      if (faseExistente && (faseExistente.tipo === "conteudo" || (!faseExistente.perguntas || faseExistente.perguntas.length === 0) && faseExistente.conteudo)) {
        const urlDestino = `/conteudo?faseId=${faseId}${trilhaId ? `&trilhaId=${trilhaId}` : ''}`;
        window.location.href = urlDestino;
        return;
      }
      
      // Se não encontrou no estado, buscar da API
      const faseData = await buscarFasePorId(faseId) as Fase;
      
      // Verificar se é fase de conteúdo (por tipo ou por não ter perguntas mas ter conteúdo)
      const isFaseConteudo = faseData.tipo === "conteudo" || 
                            ((!faseData.perguntas || faseData.perguntas.length === 0) && 
                             faseData.conteudo && 
                             faseData.conteudo.trim().length > 0);
      
      if (isFaseConteudo) {
        const urlDestino = `/conteudo?faseId=${faseId}${trilhaId ? `&trilhaId=${trilhaId}` : ''}`;
        window.location.href = urlDestino;
        return;
      }
      
      // Incrementar contador de partidas jogadas apenas para fases de perguntas
      const partidasAtuais = parseInt(localStorage.getItem("partidas_jogadas") || "0", 10);
      localStorage.setItem("partidas_jogadas", (partidasAtuais + 1).toString());
      
      // Verificar se a fase já foi completada
      let faseCompletada = false;
      try {
        const progressoRes = await apiClient.get(
          API_ENDPOINTS.PROGRESSO.VERIFICAR(faseId)
        );

        faseCompletada = progressoRes.data?.completado || false;
      } catch (error) {
        console.error("Erro ao verificar progresso:", error);
      }

      // Redirecionar para o game com trilhaId (fases de perguntas)
      const urlDestino = `/game?faseId=${faseId}${trilhaId ? `&trilhaId=${trilhaId}` : ''}`;
      console.log("Redirecionando para o game:", urlDestino);

      // Mostrar SplashScreen e depois redirecionar
      setUrlParaRedirecionar(urlDestino);
      setMostrarSplash(true);
    } catch (error) {
      console.error("Erro ao verificar tipo da fase:", error);
      
      // Em caso de erro, verificar se a fase está no estado local
      const faseExistente = fases.find(f => f._id === faseId);
      if (faseExistente && (faseExistente.tipo === "conteudo" || (!faseExistente.perguntas || faseExistente.perguntas.length === 0) && faseExistente.conteudo)) {
        const urlDestino = `/conteudo?faseId=${faseId}${trilhaId ? `&trilhaId=${trilhaId}` : ''}`;
        window.location.href = urlDestino;
        return;
      }
      
      // Se não conseguir determinar, assumir que é fase de perguntas (comportamento padrão)
      const urlDestino = `/game?faseId=${faseId}${trilhaId ? `&trilhaId=${trilhaId}` : ''}`;
      setUrlParaRedirecionar(urlDestino);
      setMostrarSplash(true);
    }
  };

  const handleSplashComplete = () => {
    setMostrarSplash(false);
    if (urlParaRedirecionar) {
      window.location.href = urlParaRedirecionar;
    }
  };

  const handleSalvarTrilha = async () => {
    // Usar trilhaId da prop ou do estado trilha
    const idParaSalvar = trilhaId || trilha?._id;

    if (!idParaSalvar) {
      console.error("trilhaId não encontrado:", {
        trilhaId,
        trilha,
        trilhaIdDaProp: trilhaId,
        trilhaIdDoEstado: trilha?._id,
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    setSalvando(true);
    try {
      if (trilhaSalva) {
        // Remover da lista de salvas
        console.log("Removendo trilha das salvas:", idParaSalvar);
        try {
          await apiClient.delete(
            API_ENDPOINTS.LICOES_SALVAS.POR_ID(idParaSalvar)
          );
          setTrilhaSalva(false);
        } catch (error) {
          console.error("Erro ao remover trilha:", error);
        }
      } else {
        // Salvar
        console.log("Salvando trilha:", idParaSalvar);
        try {
          const res = await apiClient.post(
            API_ENDPOINTS.LICOES_SALVAS.LISTAR,
            { trilhaId: idParaSalvar }
          );

          console.log("Resposta do servidor:", res.status, res.statusText);
          console.log("Dados da resposta:", res.data);

          setTrilhaSalva(true);
        } catch (error: any) {
          console.error("Erro ao salvar trilha:", error);
          // Se já está salva, atualizar o estado para true
          if (error.response?.status === 400 && error.response?.data?.message === "Trilha já está salva") {
            console.log("Trilha já estava salva, atualizando estado...");
            setTrilhaSalva(true);
          }
        }
      }
    } catch (error: unknown) {
      console.error("Erro ao salvar/remover trilha:", error);
    } finally {
      setSalvando(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Função para obter a imagem do personagem
  const getPersonagemImage = (personagem: string | null) => {
    if (!personagem) return "/img/personagem.png"; // Default
    const personagemLower = personagem.toLowerCase();
    if (personagemLower === "guerreiro") return "/img/guerreiro.png";
    if (personagemLower === "mago") return "/img/mago.png";
    if (personagemLower === "samurai") return "/img/samurai.png";
    return "/img/personagem.png"; // Default
  };

  // Se não houver trilhaId, mostrar mensagem
  if (!trilhaId) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center pt-10">
        <div className="bg-[var(--bg-card)] rounded-lg shadow-lg p-8 max-w-md text-center border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-lg text-[var(--text-primary)] mb-4">
            {t("trail.noTrailSelected")}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {t("trail.selectTrail")}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center pt-10">
        <div className="text-lg text-[var(--text-secondary)]">{t("trail.loadingPhases")}</div>
      </div>
    );
  }

  return (
    <>
      {mostrarSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      <div className="relative min-h-screen flex flex-col items-center pt-10">
        {/* Cabeçalho */}
        <div className="bg-[var(--bg-card)] rounded-t-xl px-6 py-4 mb-12 shadow-md text-[var(--text-primary)] w-[90%] max-w-3xl flex justify-between items-center border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
        <div>
          <p className="text-sm font-bold opacity-80 text-[var(--text-secondary)]">
            {trilha?.materia || t("trail.title")}
          </p>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {trilha?.titulo || t("trail.title")}
          </h2>
        </div>
         <div className="flex items-center gap-2">
           {(trilhaId || trilha?._id) && (
             <button
               onClick={handleSalvarTrilha}
               disabled={salvando || !(trilhaId || trilha?._id)}
               className={`flex items-center gap-2 border-2 rounded-xl px-3 py-1 font-bold transform active:translate-y-1 shadow-[0_6px_0px_rgba(0,0,0,0.2)] active:shadow-[0_2px_0px_rgba(0,0,0,0.3)] transition-all duration-150 ${
                 trilhaSalva
                   ? "bg-yellow-500 border-yellow-500 text-[var(--text-primary)] hover:bg-yellow-600"
                   : "bg-transparent border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
               }`}
               style={trilhaSalva ? {} : { borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
               title={trilhaSalva ? t("trail.saved") : t("trail.save")}
             >
               {trilhaSalva ? (
                 <BookmarkCheck className="w-4 h-4" />
               ) : (
                 <Bookmark className="w-4 h-4" />
               )}
               {salvando ? "..." : trilhaSalva ? t("trail.saved") : t("trail.save")}
             </button>
           )}
          <button className="flex items-center gap-2 border-2 border-[var(--border-color)] rounded-xl px-3 py-1 text-[var(--text-primary)] font-bold transform active:translate-y-1 shadow-[0_6px_0px_rgba(0,0,0,0.2)] active:shadow-[0_2px_0px_rgba(0,0,0,0.3)] transition-all duration-150 hover:bg-[var(--bg-input)]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <BookText className="w-4 h-4 " />
            {t("trail.guide")}
          </button>
        </div>
      </div>

      {/* Trilhas */}
      {fases.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-lg shadow-lg p-8 max-w-md text-center border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-lg text-[var(--text-primary)]">
            {t("trail.noPhases")}
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {t("trail.phasesWillAppear")}
          </p>
        </div>
      ) : (
        <div
          ref={tracksRef}
          className="relative w-full max-w-3xl flex flex-col items-center gap-12 px-6"
        >
          {/* Personagem */}
          <motion.div
            ref={characterRef}
            animate={controls}
            initial={characterPos}
            className="absolute z-50 pointer-events-none"
            style={{
              left: 0,
              top: 0,
              transform: characterFacingRight ? "scaleX(1)" : "scaleX(-1)",
            }}
          >
            <img
              src={getPersonagemImage(personagemUsuario)}
              alt={personagemUsuario || "Personagem"}
              className="w-12 h-12 object-contain"
            />
          </motion.div>

          {/* Overlay */}
          <AnimatePresence>
            {tooltipIndex !== null && !mostrarSplash && (
              <motion.div
                key="overlay"
                className="fixed inset-0 bg-black/30 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setTooltipIndex(null)}
              />
            )}
          </AnimatePresence>

          {fases.map((fase, index) => {
            // Lógica de bloqueio progressivo:
            // - A primeira fase (index 0) sempre está desbloqueada
            // - Uma fase só é desbloqueada se a fase anterior estiver concluída
            const faseAnterior = index > 0 ? fases[index - 1] : null;
            const faseAnteriorCompletada = faseAnterior 
              ? progressoFases.get(faseAnterior._id) || false
              : true; // Se não há fase anterior, considera como concluída (desbloqueia a primeira)
            
            const isLocked = index > 0 && !faseAnteriorCompletada;
            const isCompletada = progressoFases.get(fase._id) || false;
            const isLeft = index % 2 === 0;

            return (
              <div
                key={fase._id}
                className={`w-full flex items-center ${
                  isLeft ? "justify-start pl-56" : "justify-end pr-56"
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div className="relative">
                    <button
                      ref={(el) => {
                        buttonRefs.current[index] = el;
                      }}
                      onClick={() => handleButtonClick(index)}
                      className={`w-20 h-20 shadow-[0_6px_0px_rgba(0,0,0,0.2)] flex items-center justify-center text-2xl font-bold rounded-circle
                        transform active:translate-y-1 active:shadow-[0_2px_0px_rgba(0,0,0,0.3)]
                        transition-all duration-150 ${
                          isLocked
                            ? "bg-[var(--bg-input)] text-[var(--text-muted)] opacity-50 cursor-pointer border-2 border-[var(--border-color)]"
                            : isCompletada
                            ? "bg-green-500 dark:bg-green-600 text-yellow-300 dark:text-yellow-200 hover:scale-105 ring-2 ring-green-300 dark:ring-green-400"
                            : "bg-blue-500 dark:bg-blue-600 text-yellow-300 dark:text-yellow-200 hover:scale-105 border-2 border-blue-400 dark:border-blue-500"
                        }`}
                      style={isLocked ? { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' } : {}}
                      title={isCompletada ? "Fase concluída ✓" : isLocked ? "Fase bloqueada" : "Fase disponível"}
                    >
                      {isCompletada ? "✓" : "★"}
                    </button>
                    {/* Badge indicando tipo de fase */}
                    {!isLocked && (
                      <div 
                        className="absolute -top-2 -right-2 bg-[var(--bg-card)] rounded-full p-1 border border-[var(--border-color)] shadow-lg" 
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                        title={fase.perguntas && fase.perguntas.length > 0 ? "Fase com Quiz" : fase.conteudo || fase.tipo === "conteudo" ? "Fase com Conteúdo" : ""}
                      >
                        {fase.perguntas && fase.perguntas.length > 0 ? (
                          <HelpCircle size={14} className="text-purple-400 dark:text-purple-300" />
                        ) : fase.conteudo || fase.tipo === "conteudo" ? (
                          <BookOpen size={14} className="text-blue-400 dark:text-blue-300" />
                        ) : null}
                      </div>
                    )}
                  </div>

                  {tooltipIndex === index && !mostrarSplash && (
                    <TooltipDescricao
                      fase={fase}
                      onStart={() => handleStart(fase._id)}
                      isLocked={isLocked}
                      isCompletada={isCompletada}
                      mensagemBloqueio={
                        isLocked && faseAnterior
                          ? `Complete a fase anterior "${faseAnterior.titulo}" para desbloquear`
                          : undefined
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botão voltar ao topo */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-500 dark:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-all z-50 border-2 border-blue-400 dark:border-blue-500"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Formulário NPS */}
      {mostrarNPS && (
        <NPSForm
          onClose={() => setMostrarNPS(false)}
          onComplete={() => setMostrarNPS(false)}
        />
      )}
    </div>
    </>
  );
}
