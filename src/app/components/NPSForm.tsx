"use client";

import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/app/services/api";
import { API_ENDPOINTS } from "@/app/config/api.config";
import { useScreenReaderAnnouncement } from "@/app/hooks/useAccessibility";

interface NPSFormProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function NPSForm({ onClose, onComplete }: NPSFormProps) {
  const [score, setScore] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const { announce } = useScreenReaderAnnouncement();

  const handleScoreClick = (value: number) => {
    setScore(value);
    announce(`Nota ${value} selecionada`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (score === null) {
      announce("Por favor, selecione uma nota de 0 a 10");
      return;
    }

    setEnviando(true);

    try {
      await apiClient.post(API_ENDPOINTS.FEEDBACK, {
        tipo: "NPS",
        score: score,
        comentario: comentario.trim() || undefined,
        data: new Date().toISOString(),
      });

      setEnviado(true);
      announce("Formulário enviado com sucesso. Obrigado pelo seu feedback!");
      
      // Marcar que o formulário foi respondido
      localStorage.setItem("nps_respondido", "true");
      localStorage.setItem("nps_ultima_resposta", new Date().toISOString());
      
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar NPS:", error);
      announce("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const handleSkip = () => {
    // Marcar que o usuário pulou o formulário
    localStorage.setItem("nps_pulado", "true");
    localStorage.setItem("nps_ultimo_pulo", new Date().toISOString());
    onClose();
  };

  if (enviado) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-card)] rounded-2xl shadow-2xl p-8 max-w-md w-full border border-[var(--border-color)]"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Obrigado!
              </h2>
              <p className="text-[var(--text-secondary)]">
                Seu feedback é muito importante para nós.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nps-title"
        aria-describedby="nps-description"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--bg-card)] rounded-2xl shadow-2xl p-6 md:p-8 max-w-lg w-full border border-[var(--border-color)]"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2
                id="nps-title"
                className="text-2xl font-bold text-[var(--text-primary)] mb-2"
              >
                Avalie sua experiência
              </h2>
              <p
                id="nps-description"
                className="text-[var(--text-secondary)] text-sm"
              >
                De 0 a 10, quanto você recomendaria o Estude.My para um amigo?
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
              aria-label="Fechar formulário"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Score Selection */}
            <div className="mb-6">
              <div className="flex flex-wrap justify-between gap-2 mb-4" role="radiogroup" aria-label="Selecione uma nota de 0 a 10">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleScoreClick(i)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      score === i
                        ? "bg-blue-600 text-white scale-110 shadow-lg"
                        : "bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-input-hover)]"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    aria-label={`Nota ${i}`}
                    aria-pressed={score === i}
                  >
                    {i}
                  </button>
                ))}
              </div>
              
              {/* Labels */}
              <div className="flex justify-between text-xs text-[var(--text-secondary)] px-1">
                <span>Não recomendaria</span>
                <span>Recomendaria muito</span>
              </div>
            </div>

            {/* Comentário Opcional */}
            <div className="mb-6">
              <label
                htmlFor="nps-comentario"
                className="block text-sm font-medium text-[var(--text-primary)] mb-2"
              >
                Comentário (opcional)
              </label>
              <textarea
                id="nps-comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Conte-nos mais sobre sua experiência..."
                className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                aria-label="Campo de comentário opcional"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 px-4 py-3 bg-[var(--bg-input)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-input-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Pular
              </button>
              <button
                type="submit"
                disabled={score === null || enviando}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

