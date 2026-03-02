// Tipos TypeScript para o jogo

export interface PerguntaAPI {
  enunciado: string;
  alternativas: string[];
  respostaCorreta: string | number;
}

export interface PerguntaFormatada {
  id: number;
  texto: string;
  alternativas: string[];
  resposta: number; // Índice da resposta correta
}

export interface FaseData {
  _id: string;
  titulo: string;
  descricao: string;
  conteudo?: string;
  ordem?: number;
  perguntas: PerguntaAPI[];
}

