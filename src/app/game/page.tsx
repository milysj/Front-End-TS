"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";
import { buscarFasePorId } from "../services/faseService";

const GameComponent = () => {
  const searchParams = useSearchParams();
  const [faseCarregada, setFaseCarregada] = useState(false);
  const [erro, setErro] = useState("");
  useKeyboardNavigation(); // Hook de acessibilidade

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
            const indexCorreta = p.alternativas.findIndex((alt: string) => alt === p.respostaCorreta);
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
            personagem_selecionado: personagemUsuario || fase.personagem_selecionado || "samurai",
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

  if (erro) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 text-xl font-bold bg-black p-8 text-center z-40">
        <p>{erro}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black overflow-hidden m-0 p-0 w-full h-full">
      {/* Mensagem de Loading */}
      {!faseCarregada && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold bg-black z-40">
          Carregando dados da fase para o jogo...
        </div>
      )}

      {/* Iframe do jogo HTML5 GameMaker */}
      {faseCarregada && (
        <iframe
          src="/game-pi/index.html"
          className="absolute inset-0 w-full h-full border-none m-0 p-0 outline-none"
          title="GamePi - HTML5 Game"
          allow="autoplay; fullscreen; keyboard"
          style={{ display: "block", margin: 0, padding: 0 }}
        />
      )}
    </div>
  );
};

export default function GamePage() {
  return (
    <PageWrapper
      title="Estude.My - Game"
      description="Tela de jogo da plataforma de aprendizado gamificado Estude.My"
    >
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold bg-black">
          Iniciando o jogo...
        </div>
      }>
        <GameComponent />
      </Suspense>
    </PageWrapper>
  );
}
