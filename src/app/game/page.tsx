"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";
import { buscarFasePorId } from "../services/faseService";
import SplashScreen from "@/app/components/game/SplashScreen";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Maximize2, ArrowLeft, RefreshCw, Smartphone } from "lucide-react";

const GameComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Estados de carregamento
  const [faseCarregada, setFaseCarregada] = useState(false);
  const [splashCompleta, setSplashCompleta] = useState(false);
  const [erro, setErro] = useState("");

  // Estados de orientação e mobile
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [manualRotate, setManualRotate] = useState(false);
  const [showRotateNotice, setShowRotateNotice] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useKeyboardNavigation(); // Hook de acessibilidade

  // 1. Detectar dispositivo mobile e orientação
  useEffect(() => {
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

      // Se for mobile e vertical, exibir aviso sutil de orientação horizontal
      if (mobile && portrait) {
        setShowRotateNotice(true);
        const timer = setTimeout(() => setShowRotateNotice(false), 4000);
        return () => clearTimeout(timer);
      } else {
        setShowRotateNotice(false);
      }
    };

    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);

    // Tentar bloqueio nativo em landscape se a API do navegador permitir
    const lockNativeLandscape = async () => {
      try {
        if (window.screen?.orientation && typeof window.screen.orientation.lock === "function") {
          await window.screen.orientation.lock("landscape");
        } else if ((window.screen as any)?.lockOrientation) {
          (window.screen as any).lockOrientation("landscape");
        }
      } catch (err) {
        // Falha silenciosa em navegadores sem suporte ou que exigem fullscreen
      }
    };

    lockNativeLandscape();
    window.addEventListener("touchstart", lockNativeLandscape, { passive: true, once: true });
    window.addEventListener("click", lockNativeLandscape, { passive: true, once: true });

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, []);

  // 2. Carregamento dos dados da Fase
  useEffect(() => {
    async function carregarDadosFase() {
      try {
        const faseId = searchParams.get("faseId");
        const trilhaId = searchParams.get("trilhaId");
        const personagemUsuario = searchParams.get("personagem") || undefined;

        if (!faseId) {
          setErro("ID da fase é obrigatório para iniciar o jogo.");
          return;
        }

        // Busca a fase no banco de dados do backend
        const fase = await buscarFasePorId(faseId);

        if (fase) {
          const perguntasTransformadas = (fase.perguntas || []).map((p: any) => {
            const indexCorreta = p.alternativas.findIndex(
              (alt: string) => alt === p.respostaCorreta
            );
            const index = indexCorreta >= 0 ? indexCorreta : 0;
            return {
              ...p,
              indiceRespostaCorreta: index,
              indiceRespostaCorrecta: index,
              respostaCorretaIndex: index,
              _T5: p.enunciado,      // enunciado
              _U5: p.alternativas,   // alternativas
              _V5: index             // indiceRespostaCorreta
            };
          });

          (window as any).gameData = {
            faseId: fase._id,
            titulo: fase.titulo,
            personagem_selecionado:
              personagemUsuario || fase.personagem_selecionado || "samurai",
            cenario: fase.cenario || "bg_dojo",
            perguntas: perguntasTransformadas,

            // Chaves minificadas para compatibilidade com o GameMaker
            _q5: fase._id,
            _s5: fase.titulo,
            _u5: personagemUsuario || fase.personagem_selecionado || "samurai",
            _D5: fase.cenario || "bg_dojo",
            _M5: perguntasTransformadas
          };

          console.log("Dados injetados para o GameMaker em /game:", (window as any).gameData);
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

  // Função para alternar rotação manual
  const toggleManualRotate = () => {
    setManualRotate((prev) => !prev);
  };

  // Função para tentar tela cheia + landscape
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          if (window.screen?.orientation && typeof window.screen.orientation.lock === "function") {
            window.screen.orientation.lock("landscape").catch(() => {});
          }
        }).catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  // Se estiver em modo mobile e vertical (portrait), ou o usuário ativou manualRotate:
  // Rotacionar a tela 90 graus para ficar na horizontal
  const shouldRotate = (isMobile && isPortrait) || manualRotate;

  // O jogo só é exibido quando a fase foi carregada E a splashscreen completou sua animação
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
    <div className="fixed inset-0 bg-black overflow-hidden m-0 p-0 w-full h-full select-none">
      {/* 1. SplashScreen exibida antes e durante o carregamento inicial */}
      <AnimatePresence>
        {!podeExibirJogo && (
          <SplashScreen
            onComplete={() => setSplashCompleta(true)}
            mensagem={faseCarregada ? "INICIANDO JOGO..." : "CARREGANDO DADOS DA FASE..."}
          />
        )}
      </AnimatePresence>

      {/* 2. Container do Jogo com suporte a rotação horizontal para mobile */}
      <div
        ref={containerRef}
        className="bg-black transition-all duration-300"
        style={
          shouldRotate
            ? {
                position: "fixed",
                top: "50%",
                left: "50%",
                width: "100dvh",
                height: "100dvw",
                transform: "translate(-50%, -50%) rotate(90deg)",
                transformOrigin: "center center",
                overflow: "hidden",
                margin: 0,
                padding: 0,
              }
            : {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                overflow: "hidden",
                margin: 0,
                padding: 0,
              }
        }
      >
        {/* Iframe só monta quando os dados estiverem na window E a splashscreen tiver terminado */}
        {podeExibirJogo && (
          <iframe
            src="/game-pi/index.html?v=4"
            className="w-full h-full border-none m-0 p-0 outline-none block"
            title="GamePi - HTML5 Game"
            allow="autoplay; fullscreen; keyboard; orientation"
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        )}
      </div>

      {/* 3. Controles flutuantes sutis para mobile (Girar tela / Tela cheia) */}
      {isMobile && podeExibirJogo && (
        <div className="fixed top-3 right-3 z-[9000] flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleManualRotate}
            aria-label="Girar Tela"
            title="Alternar rotação horizontal"
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/90 border border-white/20 backdrop-blur-md shadow-lg active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
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

      {/* 4. Notificação suave de modo horizontal no celular */}
      <AnimatePresence>
        {showRotateNotice && podeExibirJogo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9000] pointer-events-none"
          >
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 border border-white/25 text-white text-xs font-medium shadow-2xl backdrop-blur-md">
              <Smartphone className="w-3.5 h-3.5 text-blue-400 rotate-90" />
              <span>Modo horizontal ativado para celular</span>
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
