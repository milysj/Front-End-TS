"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";
import { buscarFasePorId } from "../services/faseService";
import { registrarConclusaoFase } from "./api";
import apiClient from "@/app/services/api";
import SplashScreen from "@/app/components/game/SplashScreen";
import { AnimatePresence, motion } from "framer-motion";
import {
  RotateCcw,
  Maximize2,
  ArrowLeft,
  RefreshCw,
  Smartphone,
  Trophy,
  BookOpen,
  Sword,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const GameComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Estados de carregamento
  const [faseCarregada, setFaseCarregada] = useState(false);
  const [splashCompleta, setSplashCompleta] = useState(false);
  const [erro, setErro] = useState("");

  // Estados de Fim de Fase (Vitória / Derrota)
  const [fimDeJogo, setFimDeJogo] = useState<"vitoria" | "derrota" | null>(null);
  const [salvandoProgresso, setSalvandoProgresso] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now());

  // Estados de orientação e mobile
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isPortraitRotated, setIsPortraitRotated] = useState(true);
  const [portraitAngle, setPortraitAngle] = useState<90 | 270>(90);
  const [landscapeInverted, setLandscapeInverted] = useState(false);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);
  const timeoutToastRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  useKeyboardNavigation(); // Hook de acessibilidade

  const exibirToast = (msg: string) => {
    if (timeoutToastRef.current) clearTimeout(timeoutToastRef.current);
    setToastMensagem(msg);
    timeoutToastRef.current = setTimeout(() => {
      setToastMensagem(null);
    }, 3200);
  };

  // Salva o progresso no backend ao vencer
  const salvarProgressoVitoria = async () => {
    const faseId = searchParams.get("faseId");
    if (!faseId) return;

    setSalvandoProgresso(true);
    try {
      await registrarConclusaoFase(faseId, 100, 4, 0);
      console.log("✅ Progresso salvo via /api/fases/concluir");
    } catch (err) {
      console.warn("⚠️ Tentando rota alternativa de progresso...", err);
      try {
        await apiClient.post("/api/progresso/salvar", {
          faseId,
          pontuacao: 100,
          totalPerguntas: 4,
          respostasUsuario: [0, 0, 0, 0],
        });
        console.log("✅ Progresso salvo via /api/progresso/salvar");
      } catch (err2) {
        console.error("❌ Erro ao salvar progresso da fase:", err2);
      }
    } finally {
      setSalvandoProgresso(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("ultima_partida_timestamp", Date.now().toString());
      }
    }
  };

  // Handler para voltar para a página anterior / trilha acionado pelo botão voltar do jogo
  useEffect(() => {
    const voltar = () => {
      const trilhaId = searchParams.get("trilhaId");
      if (typeof window !== "undefined") {
        if (trilhaId) {
          router.push(`/trilha?trilhaId=${trilhaId}`);
        } else if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/trilha");
        }
      }
    };

    (window as any).jogar_voltar_js = voltar;

    const onMessage = async (event: MessageEvent) => {
      if (event.data?.type === "VOLTAR_PAGINA" || event.data?.type === "VOLTAR_TRILHA") {
        voltar();
      } else if (event.data?.type === "FIM_FASE") {
        if (event.data?.vitoria) {
          setFimDeJogo("vitoria");
          await salvarProgressoVitoria();
        } else {
          setFimDeJogo("derrota");
        }
      }
    };

    // Disponibiliza também na window global caso o GameMaker tente chamar diretamente
    (window as any).notificar_vitoria_js = () => {
      window.postMessage({ type: "FIM_FASE", vitoria: true }, "*");
    };
    (window as any).notificar_derrota_js = () => {
      window.postMessage({ type: "FIM_FASE", vitoria: false }, "*");
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      try {
        delete (window as any).jogar_voltar_js;
        delete (window as any).notificar_vitoria_js;
        delete (window as any).notificar_derrota_js;
      } catch (e) { }
    };
  }, [router, searchParams]);

  // Ações dos modais de vitória e derrota
  const avancarParaTrilha = () => {
    const trilhaId = searchParams.get("trilhaId");
    if (trilhaId) {
      router.push(`/trilha?trilhaId=${trilhaId}`);
    } else {
      router.push("/trilha");
    }
  };

  const tentarNovamente = () => {
    setFimDeJogo(null);
    setIframeKey(Date.now());
  };

  const voltarParaEstudar = () => {
    const trilhaId = searchParams.get("trilhaId");
    if (trilhaId) {
      router.push(`/trilha?trilhaId=${trilhaId}`);
    } else {
      router.push("/trilha");
    }
  };

  // 1. Detectar dispositivo mobile e orientação
  useEffect(() => {
    let jaNotificouInicial = false;

    const updateOrientation = () => {
      const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent || ""
      );
      const touchCapable =
        typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0);
      const mobile = userAgentMobile || (touchCapable && window.innerWidth <= 1024);
      const portrait = window.innerHeight > window.innerWidth;

      setIsMobile(mobile);
      setIsPortrait(portrait);

      if (mobile && portrait && !jaNotificouInicial) {
        jaNotificouInicial = true;
        exibirToast("Modo horizontal ativado para celular");
      }

      // Se o usuário virou o celular fisicamente para modo paisagem, removemos inversões
      if (!portrait) {
        setLandscapeInverted(false);
      }
    };

    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);
    document.addEventListener("fullscreenchange", updateOrientation);
    document.addEventListener("webkitfullscreenchange", updateOrientation);

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
      document.removeEventListener("fullscreenchange", updateOrientation);
      document.removeEventListener("webkitfullscreenchange", updateOrientation);
      if (timeoutToastRef.current) clearTimeout(timeoutToastRef.current);
    };
  }, []);

  // 2. Carregamento dos dados da Fase
  useEffect(() => {
    async function carregarDadosFase() {
      try {
        const faseId = searchParams.get("faseId");
        const personagemUsuario = searchParams.get("personagem") || undefined;

        if (!faseId) {
          setErro("ID da fase é obrigatório para iniciar o jogo.");
          return;
        }

        const fase: any = await buscarFasePorId(faseId);

        if (fase) {
          const perguntasTransformadas = (fase.perguntas || []).map((p: any) => {
            const alternativasOriginais = Array.isArray(p.alternativas) ? [...p.alternativas] : [];

            // 1. Identificar o texto exato da resposta correta antes de embaralhar
            let textoCorreto = "";
            if (typeof p.respostaCorreta === "number" && alternativasOriginais[p.respostaCorreta] !== undefined) {
              textoCorreto = alternativasOriginais[p.respostaCorreta];
            } else if (
              typeof p.respostaCorreta === "string" &&
              /^\d+$/.test(p.respostaCorreta.trim()) &&
              alternativasOriginais[parseInt(p.respostaCorreta.trim())] !== undefined
            ) {
              textoCorreto = alternativasOriginais[parseInt(p.respostaCorreta.trim())];
            } else if (typeof p.respostaCorreta === "string" && alternativasOriginais.includes(p.respostaCorreta)) {
              textoCorreto = p.respostaCorreta;
            } else if (typeof p.indiceRespostaCorreta === "number" && alternativasOriginais[p.indiceRespostaCorreta] !== undefined) {
              textoCorreto = alternativasOriginais[p.indiceRespostaCorreta];
            } else {
              textoCorreto = alternativasOriginais[0] || "";
            }

            // 2. Embaralhar as alternativas aleatoriamente (Fisher-Yates) para que a correta não fique sempre no mesmo botão
            const alternativasEmbaralhadas = [...alternativasOriginais];
            for (let i = alternativasEmbaralhadas.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [alternativasEmbaralhadas[i], alternativasEmbaralhadas[j]] = [
                alternativasEmbaralhadas[j],
                alternativasEmbaralhadas[i],
              ];
            }

            // 3. Descobrir a nova posição (0, 1, 2 ou 3) onde a resposta correta foi parar
            const novoIndexCorreto = alternativasEmbaralhadas.findIndex(
              (alt: string) => alt === textoCorreto
            );
            const index = novoIndexCorreto >= 0 ? novoIndexCorreto : 0;

            return {
              ...p,
              alternativas: alternativasEmbaralhadas,
              respostaCorreta: textoCorreto,
              indiceRespostaCorreta: index,
              indiceRespostaCorrecta: index,
              respostaCorretaIndex: index,
              _T5: p.enunciado,
              _U5: alternativasEmbaralhadas,
              _V5: index,
            };
          });

          // 4. Embaralhar também a ordem em que as perguntas aparecem
          const perguntasFinais = [...perguntasTransformadas].sort(() => Math.random() - 0.5);

          (window as any).gameData = {
            faseId: fase._id,
            titulo: fase.titulo,
            personagem_selecionado:
              personagemUsuario || fase.personagem_selecionado || "samurai",
            cenario: fase.cenario || "bg_dojo",
            perguntas: perguntasFinais,

            // Chaves minificadas para compatibilidade
            _q5: fase._id,
            _s5: fase.titulo,
            _u5: personagemUsuario || fase.personagem_selecionado || "samurai",
            _D5: fase.cenario || "bg_dojo",
            _M5: perguntasFinais,
          };

          setFaseCarregada(true);
        } else {
          setErro("Nenhuma fase correspondente foi encontrada.");
        }
      } catch (err) {
        console.error("Erro ao carregar dados da fase:", err);
        setErro("Erro ao carregar os dados da fase. Verifique sua conexão e autenticação.");
      }
    }

    carregarDadosFase();
  }, [searchParams]);

  // Alterna entre Modo Horizontal (rotacionado) e Modo Normal (retrato 0°) quando em portrait
  const togglePortraitRotate = () => {
    setIsPortraitRotated((prev) => {
      const novo = !prev;
      exibirToast(novo ? "Modo horizontal ativado" : "Modo normal (Retrato) ativado");
      return novo;
    });
  };

  // Inverte o lado de rotação (90° ↔ 270°) se o usuário segurar o celular pelo outro lado
  const togglePortraitInvert = () => {
    setPortraitAngle((prev) => {
      const novo = prev === 90 ? 270 : 90;
      exibirToast(`Rotação invertida (${novo}°)`);
      return novo;
    });
  };

  // No modo paisagem natural/fullscreen, inverte 180° se o celular estiver de ponta cabeça
  const toggleLandscapeInvert = () => {
    setLandscapeInverted((prev) => {
      const novo = !prev;
      exibirToast(novo ? "Orientação invertida (180°)" : "Orientação normal (0°)");
      return novo;
    });
  };

  // Alterna modo de tela cheia com bloqueio em paisagem
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }

        // Ao entrar em tela cheia, tenta travar em landscape via Screen Orientation API
        const screenAny = (window.screen as any);
        if (screenAny?.orientation?.lock) {
          try {
            await screenAny.orientation.lock("landscape");
          } catch (err) {
            // Navegadores que não suportam silenciam
          }
        }
        exibirToast("Tela cheia ativada");
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        const screenAny = (window.screen as any);
        if (screenAny?.orientation?.unlock) {
          try {
            screenAny.orientation.unlock();
          } catch (err) { }
        }
        exibirToast("Saiu da tela cheia");
      }
    } catch (e) {
      console.warn("Fullscreen toggle error:", e);
    }
  };

  const getContainerStyle = (): React.CSSProperties => {
    // 1. Mobile em Retrato com rotação ativa (90° ou 270°)
    if (isMobile && isPortrait && isPortraitRotated) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        width: "min(98dvh, calc(98dvw * 16 / 9))",
        height: "min(98dvw, calc(98dvh * 9 / 16))",
        transform: `translate(-50%, -50%) rotate(${portraitAngle}deg)`,
        transformOrigin: "center center",
      };
    }

    // 2. Mobile em Paisagem com inversão de 180°
    if (isMobile && !isPortrait && landscapeInverted) {
      return {
        width: "min(98vw, calc(98vh * 16 / 9))",
        height: "min(98vh, calc(98vw * 9 / 16))",
        transform: "rotate(180deg)",
        transformOrigin: "center center",
      };
    }

    // 3. Padrão (Mobile Retrato normal 0°, Paisagem normal 0°, Desktop)
    return {
      width: "min(98vw, calc(98vh * 16 / 9))",
      height: "min(98vh, calc(98vw * 9 / 16))",
      transform: "none",
    };
  };

  const podeExibirJogo = faseCarregada && splashCompleta;

  if (erro) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#f3f4f6] dark:bg-[#121212] p-6 text-center z-50 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-500 text-3xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Não foi possível carregar a fase
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {erro}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/25"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </button>
            <button
              onClick={() => router.push("/trilha")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar à Trilha
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#090a0f] flex items-center justify-center overflow-hidden m-0 p-0 w-full h-full select-none">
      {/* 1. SplashScreen exibida antes e durante o carregamento inicial */}
      <AnimatePresence>
        {!podeExibirJogo && (
          <SplashScreen
            onComplete={() => setSplashCompleta(true)}
            mensagem={faseCarregada ? "INICIANDO JOGO..." : "CARREGANDO DADOS DA FASE..."}
          />
        )}
      </AnimatePresence>

      {/* 2. Container do Jogo com 98% da tela, proporção 16:9 travada e borda sutil */}
      <div
        ref={containerRef}
        className="transition-all duration-300 relative flex items-center justify-center"
        style={getContainerStyle()}
      >
        <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-700/60 dark:border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-black relative">
          {/* Iframe monta com chave dinâmica anti-cache */}
          {podeExibirJogo && (
            <iframe
              key={iframeKey}
              src={`/game-pi/index.html?t=${iframeKey}`}
              className="w-full h-full border-none m-0 p-0 outline-none block"
              title="GamePi - HTML5 Game"
              allow="autoplay; fullscreen; keyboard; orientation"
              style={{ display: "block", width: "100%", height: "100%" }}
            />
          )}
        </div>
      </div>

      {/* 3. Modal de Vitória Elegante */}
      <AnimatePresence>
        {fimDeJogo === "vitoria" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-md w-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-black border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(245,158,11,0.25)] relative overflow-hidden"
            >
              {/* Efeito de brilho de fundo */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                {/* Ícone de Troféu com pulso */}
                <div className="w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-5 shadow-inner">
                  <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>FASE CONCLUÍDA</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
                  Vitória Épica!
                </h2>

                <p className="text-sm text-zinc-400 mb-6 max-w-xs leading-relaxed">
                  Você derrotou o vilão, dominou os conceitos e provou suas habilidades!
                </p>

                {/* Badge de Recompensa XP */}
                <div className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-2xl py-3 px-4 mb-6 flex items-center justify-around">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-sm text-zinc-300 font-medium">Recompensa</span>
                  </div>
                  <span className="text-lg font-bold text-amber-400">
                    +100 XP
                  </span>
                </div>

                <button
                  onClick={avancarParaTrilha}
                  disabled={salvandoProgresso}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-base shadow-lg shadow-amber-500/25 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Avançar para a Trilha</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Modal de Derrota Elegante */}
      <AnimatePresence>
        {fimDeJogo === "derrota" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-md w-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-black border border-red-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(239,68,68,0.25)] relative overflow-hidden"
            >
              {/* Efeito de brilho avermelhado */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                {/* Ícone de Espada / Batalha */}
                <div className="w-20 h-20 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-5 shadow-inner">
                  <Sword className="w-10 h-10 text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold mb-3">
                  <span>COMBATE ENCERRADO</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
                  O Samurai Caiu em Batalha
                </h2>

                <p className="text-sm text-zinc-400 mb-6 max-w-xs leading-relaxed">
                  Não desanime! Toda derrota é apenas mais um passo para o aprendizado e a maestria.
                </p>

                {/* Botões de Ação: Tentar Novamente vs Voltar para Estudar */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={tentarNovamente}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 active:scale-98 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Tentar Novamente</span>
                  </button>

                  <button
                    onClick={voltarParaEstudar}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 font-semibold text-sm active:scale-98 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Voltar para Estudar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Controles flutuantes sutis para mobile (Girar tela / Inverter / Tela cheia) */}
      {isMobile && podeExibirJogo && !fimDeJogo && (
        <div className="fixed top-3 right-3 z-[9000] flex items-center gap-2 pointer-events-auto">
          {/* Se o celular estiver em modo Retrato */}
          {isPortrait ? (
            <>
              {/* Botão de Virar Tela: alterna entre Horizontal e Normal em Retrato */}
              <button
                onClick={togglePortraitRotate}
                aria-label={isPortraitRotated ? "Voltar ao Modo Retrato Normal" : "Girar para Modo Horizontal"}
                title={isPortraitRotated ? "Voltar ao Modo Retrato Normal (0°)" : "Girar para Modo Horizontal"}
                className={`p-2.5 rounded-full border backdrop-blur-md shadow-lg active:scale-95 transition-all ${
                  isPortraitRotated
                    ? "bg-blue-600/80 hover:bg-blue-600 text-white border-blue-400/50"
                    : "bg-black/60 hover:bg-black/80 text-white/90 border-white/20"
                }`}
              >
                <RotateCcw className={`w-4 h-4 transition-transform ${isPortraitRotated ? "rotate-90" : ""}`} />
              </button>

              {/* Se estiver no modo horizontal em retrato, permite inverter o lado (90° ↔ 270°) */}
              {isPortraitRotated && (
                <button
                  onClick={togglePortraitInvert}
                  aria-label="Inverter Lado da Rotação"
                  title="Inverter Lado (90° ↔ 270°)"
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/90 border border-white/20 backdrop-blur-md shadow-lg active:scale-95 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            /* Se estiver em modo Paisagem (física ou fullscreen), permite inverter 180° se o celular estiver virado */
            <button
              onClick={toggleLandscapeInvert}
              aria-label="Inverter Orientação"
              title="Inverter Orientação (180°)"
              className={`p-2.5 rounded-full border backdrop-blur-md shadow-lg active:scale-95 transition-all ${
                landscapeInverted
                  ? "bg-amber-600/80 hover:bg-amber-600 text-white border-amber-400/50"
                  : "bg-black/60 hover:bg-black/80 text-white/90 border-white/20"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Botão de Tela Cheia */}
          <button
            onClick={toggleFullscreen}
            aria-label="Tela Cheia"
            title="Tela Cheia"
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/90 border border-white/20 backdrop-blur-md shadow-lg active:scale-95 transition-all"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6. Notificação suave de status / rotação no celular */}
      <AnimatePresence>
        {toastMensagem && podeExibirJogo && !fimDeJogo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9000] pointer-events-none"
          >
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/85 border border-white/25 text-white text-xs font-medium shadow-2xl backdrop-blur-md">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>{toastMensagem}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function GamePage() {
  return (
    <PageWrapper
      title="Estude.My - Game"
      description="Tela de jogo da plataforma de aprendizado gamificado Estude.My"
    >
      <Suspense
        fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-[#f3f4f6] dark:bg-[#121212] text-xl font-bold transition-colors">
            Iniciando o jogo...
          </div>
        }
      >
        <GameComponent />
      </Suspense>
    </PageWrapper>
  );
}
