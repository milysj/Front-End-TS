"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listarFases, buscarFasePorId } from "../services/faseService";
import SplashScreen from "@/app/components/game/SplashScreen";
import { AnimatePresence, motion } from "framer-motion";
import {
  RotateCcw,
  RefreshCw,
  Smartphone,
  Trophy,
  BookOpen,
  Sword,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function TestGamePi() {
  const router = useRouter();
  const [faseCarregada, setFaseCarregada] = useState(false);
  const [splashCompleta, setSplashCompleta] = useState(false);
  const [erro, setErro] = useState("");

  const [fimDeJogo, setFimDeJogo] = useState<"vitoria" | "derrota" | null>(null);
  const [iframeKey, setIframeKey] = useState(Date.now());

  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [manualRotate, setManualRotate] = useState(false);
  const [showRotateNotice, setShowRotateNotice] = useState(false);

  useEffect(() => {
    const voltar = () => {
      if (typeof window !== "undefined") {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/trilha");
        }
      }
    };

    (window as any).jogar_voltar_js = voltar;

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "VOLTAR_PAGINA" || event.data?.type === "VOLTAR_TRILHA") {
        voltar();
      } else if (event.data?.type === "FIM_FASE") {
        if (event.data?.vitoria) {
          setFimDeJogo("vitoria");
        } else {
          setFimDeJogo("derrota");
        }
      }
    };

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
      } catch (e) {}
    };
  }, [router]);

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

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, []);

  useEffect(() => {
    async function carregarFase() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const faseIdParam = urlParams.get("faseId");

        let faseTeste;

        if (faseIdParam) {
          faseTeste = await buscarFasePorId(faseIdParam);
        } else {
          const fases = await listarFases();
          if (fases && fases.length > 0) {
            faseTeste = fases[0];
          }
        }

        if (faseTeste) {
          const perguntasTransformadas = (faseTeste.perguntas || []).map((p: any) => {
            const indexCorreta = p.alternativas.findIndex(
              (alt: string) => alt === p.respostaCorreta
            );
            const index = indexCorreta >= 0 ? indexCorreta : 0;
            return {
              ...p,
              indiceRespostaCorreta: index,
              indiceRespostaCorrecta: index,
              respostaCorretaIndex: index,
              _T5: p.enunciado,
              _U5: p.alternativas,
              _V5: index,
            };
          });

          (window as any).gameData = {
            faseId: faseTeste._id,
            titulo: faseTeste.titulo,
            personagem_selecionado: "samurai",
            cenario: "bg_dojo",
            perguntas: perguntasTransformadas,

            _q5: faseTeste._id,
            _s5: faseTeste.titulo,
            _u5: "samurai",
            _D5: "bg_dojo",
            _M5: perguntasTransformadas,
          };

          setFaseCarregada(true);
        } else {
          setErro("Nenhuma fase encontrada para teste.");
        }
      } catch (err) {
        console.error("Erro ao carregar fase:", err);
        setErro("Erro ao conectar com a API de fases.");
      }
    }

    carregarFase();
  }, []);

  const shouldRotate = (isMobile && isPortrait) || manualRotate;
  const podeExibirJogo = faseCarregada && splashCompleta;

  return (
    <div className="fixed inset-0 bg-[#090a0f] flex items-center justify-center overflow-hidden m-0 p-0 w-full h-full select-none">
      <AnimatePresence>
        {!podeExibirJogo && (
          <SplashScreen
            onComplete={() => setSplashCompleta(true)}
            mensagem={faseCarregada ? "INICIANDO TESTE..." : "CARREGANDO DADOS..."}
          />
        )}
      </AnimatePresence>

      {erro && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#f3f4f6] dark:bg-[#121212] p-8 text-center z-50">
          <p className="text-red-500 text-lg font-bold mb-4">{erro}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        </div>
      )}

      <div
        className="transition-all duration-300 relative flex items-center justify-center"
        style={
          shouldRotate
            ? {
                position: "fixed",
                top: "50%",
                left: "50%",
                width: "min(98dvh, calc(98dvw * 16 / 9))",
                height: "min(98dvw, calc(98dvh * 9 / 16))",
                transform: "translate(-50%, -50%) rotate(90deg)",
                transformOrigin: "center center",
              }
            : {
                width: "min(98vw, calc(98vh * 16 / 9))",
                height: "min(98vh, calc(98vw * 9 / 16))",
              }
        }
      >
        <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-700/60 dark:border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-black relative">
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

      {/* Modal de Vitória */}
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
              className="max-w-md w-full bg-gradient-to-b from-zinc-900 to-black border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(245,158,11,0.25)] relative"
            >
              <div className="w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-5 mx-auto">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>FASE CONCLUÍDA</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Vitória Épica!</h2>
              <p className="text-sm text-zinc-400 mb-6">Você derrotou o vilão e dominou o conteúdo!</p>
              <div className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-2xl py-3 px-4 mb-6 flex items-center justify-around">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-zinc-300">Recompensa</span>
                </div>
                <span className="text-lg font-bold text-amber-400">+100 XP</span>
              </div>
              <button
                onClick={() => router.push("/trilha")}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
              >
                <span>Avançar para a Trilha</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Derrota */}
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
              className="max-w-md w-full bg-gradient-to-b from-zinc-900 to-black border border-red-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(239,68,68,0.25)] relative"
            >
              <div className="w-20 h-20 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-5 mx-auto">
                <Sword className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">O Samurai Caiu em Batalha</h2>
              <p className="text-sm text-zinc-400 mb-6">Não desanime! Toda derrota é uma chance de aprender.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setFimDeJogo(null);
                    setIframeKey(Date.now());
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tentar Novamente</span>
                </button>
                <button
                  onClick={() => router.push("/trilha")}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Voltar para Estudar</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMobile && podeExibirJogo && !fimDeJogo && (
        <div className="fixed top-3 right-3 z-[9000] flex items-center gap-2">
          <button
            onClick={() => setManualRotate((prev) => !prev)}
            aria-label="Girar Tela"
            className="p-2.5 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {showRotateNotice && podeExibirJogo && !fimDeJogo && (
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
}
