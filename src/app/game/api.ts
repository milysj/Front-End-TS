// Serviço de API para o jogo
import apiClient from "@/app/services/api";
import { FaseData, PerguntaAPI, PerguntaFormatada } from "./types";

/**
 * Busca os dados da fase pelo ID
 */
export async function buscarFasePorId(faseId: string): Promise<FaseData> {
  try {
    const response = await apiClient.get(`/api/fases/${faseId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar fase:", error);
    throw error;
  }
}

/**
 * Formata perguntas da API para o formato usado no jogo
 */
export function formatarPerguntas(perguntasAPI: PerguntaAPI[]): PerguntaFormatada[] {
  return perguntasAPI.map((p, index) => {
    let respostaIndex = 0;
    
    if (typeof p.respostaCorreta === "number") {
      respostaIndex = p.respostaCorreta;
    } else if (typeof p.respostaCorreta === "string") {
      const parsed = parseInt(p.respostaCorreta);
      if (!isNaN(parsed)) {
        respostaIndex = parsed;
      } else {
        const idx = p.alternativas?.findIndex((alt: string) => alt === p.respostaCorreta);
        respostaIndex = idx >= 0 ? idx : 0;
      }
    }

    return {
      id: index + 1,
      texto: p.enunciado,
      alternativas: p.alternativas || [],
      resposta: respostaIndex,
    };
  });
}

/**
 * Registra o resultado de uma resposta
 */
export async function registrarResposta(
  faseId: string,
  perguntaId: number,
  acertou: boolean
): Promise<void> {
  try {
    await apiClient.post("/api/resultados", {
      faseId,
      perguntaId,
      acertou,
    });
  } catch (error) {
    console.error("Erro ao registrar resposta:", error);
  }
}

/**
 * Registra a conclusão da fase
 */
export async function registrarConclusaoFase(
  faseId: string,
  pontuacao: number,
  acertos: number,
  erros: number
): Promise<void> {
  // Validação dos dados antes de enviar
  if (!faseId || typeof faseId !== "string" || faseId.trim() === "") {
    throw new Error("ID da fase é obrigatório");
  }

  // Garantir que os valores numéricos são válidos
  const pontuacaoFinal = isNaN(pontuacao) ? 0 : Math.round(pontuacao);
  const acertosFinal = isNaN(acertos) ? 0 : Math.max(0, Math.round(acertos));
  const errosFinal = isNaN(erros) ? 0 : Math.max(0, Math.round(erros));

  const dadosEnvio = {
    faseId: faseId.trim(),
    pontuacao: pontuacaoFinal,
    acertos: acertosFinal,
    erros: errosFinal,
  };

  console.log("📤 Enviando dados para concluir fase:", dadosEnvio);
  console.log("📋 Tipo dos dados:", {
    faseId: typeof dadosEnvio.faseId,
    pontuacao: typeof dadosEnvio.pontuacao,
    acertos: typeof dadosEnvio.acertos,
    erros: typeof dadosEnvio.erros,
  });

  try {
    const response = await apiClient.post("/api/fases/concluir", dadosEnvio, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log("✅ Fase concluída com sucesso:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erro ao registrar conclusão:", error);
    console.error("📊 Detalhes completos do erro:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers,
      },
    });
    
    // Mensagem de erro mais detalhada
    let mensagemErro = "Erro ao registrar conclusão da fase";
    const errorData = error.response?.data;
    
    if (error.response?.status === 500) {
      // Tentar extrair mensagem mais específica do backend
      if (errorData?.message) {
        mensagemErro = `Erro do servidor: ${errorData.message}`;
      } else if (errorData?.error) {
        mensagemErro = `Erro do servidor: ${errorData.error}`;
      } else {
        mensagemErro = "Erro interno do servidor. Tente novamente mais tarde.";
      }
    } else if (error.response?.status === 400) {
      mensagemErro = errorData?.message || errorData?.error || "Dados inválidos. Verifique os dados enviados.";
    } else if (error.response?.status === 401) {
      mensagemErro = "Não autorizado. Faça login novamente.";
    } else if (error.response?.status === 404) {
      mensagemErro = "Fase não encontrada.";
    } else if (errorData?.message) {
      mensagemErro = errorData.message;
    } else if (errorData?.error) {
      mensagemErro = errorData.error;
    }
    
    // Log adicional para debug
    console.error("🔍 Mensagem de erro final:", mensagemErro);
    console.error("📦 Dados que foram enviados:", JSON.stringify(dadosEnvio, null, 2));
    
    throw new Error(mensagemErro);
  }
}

