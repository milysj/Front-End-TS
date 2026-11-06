"use client";

import React, { useEffect, useState } from "react";
import { listarFases, buscarFasePorId } from "../services/faseService";
import SplashScreen from "@/app/components/game/SplashScreen";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Maximize2, RefreshCw, Smartphone } from "lucide-react";

export default function TestGamePi() {
  const [faseCarregada, setFaseCarregada] = useState(false);
  const [splashCompleta, setSplashCompleta] = useState(false);
  const [erro, setErro] = useState("");

  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [manualRotate, setManualRotate] = useState(false);
  const [showRotateNotice, setShowRotateNotice] = useState(false);

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
              _V5: index
            };
          });

          (window as any).gameData = {
            faseId: faseTeste._id,
            titulo: faseTeste.titulo,
            personagem_selecionado: faseTeste.personagem_selecionado || "samurai",
            cenario: faseTeste.cenario || "bg_dojo",
            perguntas: perguntasTransformadas,
            _q5: faseTeste._id,
            _s5: faseTeste.titulo,
            _u5: faseTeste.personagem_selecionado || "samurai",
            _D5: faseTeste.cenario || "bg_dojo",
            _M5: perguntasTransformadas
          };

          console.log("Dados injetados para o GameMaker:", (window as any).gameData);
          setFaseCarregada(true);
        } else {
          setErro("Nenhuma fase encontrada no banco de dados para testar.");
        }
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar fase. Você está logado no sistema?");
      }
    }

    carregarFase();
  }, []);

  const shouldRotate = (isMobile && isPortrait) || manualRotate;
  const podeExibirJogo = faseCarregada && splashCompleta;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden m-0 p-0 w-full h-full select-none">
      <AnimatePresence>
        {!podeExibirJogo && (
          <SplashScreen
            onComplete={() => setSplashCompleta(true)}
            mensagem={faseCarregada ? "INICIANDO JOGO..." : "CARREGANDO DADOS DA FASE..."}
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

      {isMobile && podeExibirJogo && (
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
}
