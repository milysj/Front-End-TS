"use client";

import React, { useEffect, useState } from 'react';
import { listarFases, buscarFasePorId } from '../services/faseService';

export default function TestGamePi() {
  const [faseCarregada, setFaseCarregada] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarFase() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const faseIdParam = urlParams.get('faseId');
        
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
            // O GameMaker espera um índice (0, 1, 2, 3), mas o banco salva o texto exato.
            // Aqui encontramos qual é a posição da resposta correta no array de alternativas.
            const indexCorreta = p.alternativas.findIndex((alt: string) => alt === p.respostaCorreta);
            return {
              ...p,
              // Mantém o texto para compatibilidade, mas adiciona o índice que o GameMaker precisa
              indiceRespostaCorreta: indexCorreta >= 0 ? indexCorreta : 0,
              // Opcional: Se o GameMaker estiver lendo diretamente "respostaCorreta" achando que é número:
              respostaCorretaIndex: indexCorreta >= 0 ? indexCorreta : 0
            };
          });

          (window as any).gameData = {
            faseId: faseTeste._id,
            titulo: faseTeste.titulo,
            perguntas: perguntasTransformadas
          };
          
          console.log("Dados injetados para o GameMaker:", (window as any).gameData);
          setFaseCarregada(true);
        } else {
          setErro('Nenhuma fase encontrada no banco de dados para testar.');
        }
      } catch (err) {
        console.error(err);
        setErro('Erro ao carregar fase. Você está logado no sistema?');
      }
    }

    carregarFase();
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden m-0 p-0">
      {/* Mensagem de Erro ou Loading */}
      {!faseCarregada && !erro && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold z-40 bg-black">
          Carregando dados da fase para o jogo...
        </div>
      )}
      
      {erro && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 text-xl font-bold z-40 bg-black p-8 text-center">
          <p>{erro}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Iframe ocupando a tela toda (só renderiza DEPOIS que os dados estiverem na window) */}
      {faseCarregada && (
        <iframe 
          src="/game-pi/index.html" 
          className="absolute inset-0 w-full h-full border-none m-0 p-0 outline-none"
          title="GamePi - HTML5 Game"
          allow="autoplay; fullscreen; keyboard"
          style={{ display: 'block', margin: 0, padding: 0 }}
        />
      )}
    </div>
  );
}
