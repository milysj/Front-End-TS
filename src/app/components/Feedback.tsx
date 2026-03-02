"use client";

import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, MessageSquare, AlertCircle } from "lucide-react";
import Button from "react-bootstrap/Button";
import { useLanguage } from "@/app/contexts/LanguageContext";

const Feedback = () => {
  const { t } = useLanguage();
  const [tipo, setTipo] = useState<string>("");
  const [avaliacao, setAvaliacao] = useState<number>(0);
  const [sugestao, setSugestao] = useState<string>("");
  const [mensagem, setMensagem] = useState<string>("");
  const [enviando, setEnviando] = useState<boolean>(false);
  const [sucesso, setSucesso] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipo || avaliacao === 0) {
      setMensagem(`⚠️ ${t("feedback.required")}`);
      setSucesso(false);
      return;
    }

    setEnviando(true);
    setMensagem("");

    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const dadosFeedback = {
        tipo,
        avaliacao,
        sugestao,
        data: new Date().toISOString(),
      };

      const response = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(dadosFeedback),
      });

      if (response.ok) {
        setMensagem(`✅ ${t("feedback.success")}`);
        setSucesso(true);
        // Limpar formulário
        setTipo("");
        setAvaliacao(0);
        setSugestao("");
        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => {
          setMensagem("");
          setSucesso(false);
        }, 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMensagem(`❌ ${errorData.message || t("feedback.error")}`);
        setSucesso(false);
      }
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      setMensagem(`❌ ${t("feedback.connectionError")}`);
      setSucesso(false);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 m-auto">
      <div className="bg-[var(--bg-card)] p-6 rounded shadow-md w-full mx-auto border border-[var(--border-color)] transition-colors duration-300 max-w-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        {/* Título e descrição */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {t("feedback.title")}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {t("feedback.subtitle")}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tipo de Feedback */}
          <div className="flex flex-col">
            <label className="text-sm text-left text-[var(--text-primary)] font-medium mb-2">
              {t("feedback.type")} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { value: "bug", label: t("feedback.bug") },
                { value: "suggestion", label: t("feedback.suggestion") },
                { value: "doubt", label: t("feedback.doubt") },
                { value: "praise", label: t("feedback.praise") },
                { value: "other", label: t("feedback.other") },
              ].map((tipoOpcao) => (
                <button
                  key={tipoOpcao.value}
                  type="button"
                  onClick={() => setTipo(tipoOpcao.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                    tipo === tipoOpcao.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-blue-400"
                  }`}
                  style={
                    tipo === tipoOpcao.value
                      ? {}
                      : {
                          backgroundColor: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          borderColor: 'var(--border-color)',
                        }
                  }
                >
                  {tipoOpcao.label}
                </button>
              ))}
            </div>
          </div>

          {/* Avaliação */}
          <div className="flex flex-col">
            <label className="text-sm text-left text-[var(--text-primary)] font-medium mb-2">
              {t("feedback.rating")} <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <button
                  key={estrela}
                  type="button"
                  onClick={() => setAvaliacao(estrela)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      estrela <= avaliacao
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
              {avaliacao > 0 && (
                <span className="ml-2 text-sm text-[var(--text-secondary)]">
                  {avaliacao === 5
                    ? t("feedback.excellent")
                    : avaliacao === 4
                    ? t("feedback.veryGood")
                    : avaliacao === 3
                    ? t("feedback.good")
                    : avaliacao === 2
                    ? t("feedback.regular")
                    : t("feedback.bad")}
                </span>
              )}
            </div>
          </div>

          {/* Sugestão/Mensagem */}
          <div className="flex flex-col">
            <label className="text-sm text-left text-[var(--text-primary)] font-medium mb-2">
              {t("feedback.suggestionPlaceholder").includes(":") ? t("feedback.suggestionPlaceholder").split(":")[0] + ":" : t("feedback.suggestionPlaceholder")}
            </label>
            <textarea
              value={sugestao}
              onChange={(e) => setSugestao(e.target.value)}
              placeholder={t("feedback.suggestionPlaceholder")}
              required
              rows={6}
              className="w-full px-4 py-2 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
              }}
            />
          </div>

          {/* Mensagem de status */}
          {mensagem && (
            <div
              className={`p-3 rounded-lg flex items-start gap-2 ${
                sucesso
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {sucesso ? (
                <ThumbsUp className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm">{mensagem}</p>
            </div>
          )}

          {/* Botão de envio */}
          <Button
            type="submit"
            variant="primary"
            className="mt-2"
            disabled={enviando}
          >
            {enviando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block me-2" />
                {t("feedback.sending")}
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 me-2 inline" />
                {t("feedback.send")}
              </>
            )}
          </Button>
        </form>

        {/* Informações adicionais */}
        <div className="mt-6 pt-6 border-t border-[var(--border-color)] text-center transition-colors duration-300" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-xs text-[var(--text-muted)]">
            {t("feedback.anonymous")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;

