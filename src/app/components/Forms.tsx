import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import { useLanguage } from "@/app/contexts/LanguageContext";
import apiClient from "@/app/services/api";
import { API_ENDPOINTS } from "@/app/config/api.config";
import { AlertCircle, ThumbsUp } from "lucide-react";

const Form = () => {
  const { t } = useLanguage();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagemText, setMensagemText] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setMensagemStatus("");

    try {
      await apiClient.post(API_ENDPOINTS.CONTATO, {
        nome,
        email,
        assunto,
        mensagem: mensagemText,
      });

      setSucesso(true);
      setMensagemStatus(`✅ ${t("contact.success")}`);
      // Limpar formulário
      setNome("");
      setEmail("");
      setAssunto("");
      setMensagemText("");
    } catch (err: unknown) {
      console.error("Erro ao enviar mensagem de contato:", err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setSucesso(false);
      setMensagemStatus(`❌ ${axiosError.response?.data?.message || t("contact.error")}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 m-auto w-full">
      {/* ===============================
        Card principal da conta
        =============================== */}
      <div 
        className="bg-[var(--bg-card)] p-6 rounded shadow-md w-full mx-auto border border-[var(--border-color)] transition-colors duration-300 max-w-2xl" 
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {/* Título e descrição */}
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4 text-center">
          {t("contact.title")}
        </h1>
        <p className="text-[var(--text-secondary)] mb-6 text-center">
          {t("contact.subtitle")}
        </p>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-left text-[var(--text-primary)] font-medium mb-1">
              {t("contact.name")}
            </label>
            <input
              type="text"
              placeholder={t("contact.namePlaceholder")}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-left text-[var(--text-primary)] font-medium mb-1">
              {t("contact.email")}
            </label>
            <input
              type="email"
              placeholder={t("contact.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-left text-[var(--text-primary)] font-medium mb-1">
              {t("contact.subject")}
            </label>
            <input
              type="text"
              placeholder={t("contact.subjectPlaceholder")}
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-left text-[var(--text-primary)] font-medium mb-1">
              {t("contact.message")}
            </label>
            <textarea
              id="message"
              name="message"
              placeholder={t("contact.messagePlaceholder")}
              value={mensagemText}
              onChange={(e) => setMensagemText(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            />
          </div>

          {/* Mensagem de status */}
          {mensagemStatus && (
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
              <p className="text-sm m-0">{mensagemStatus}</p>
            </div>
          )}

          {/* Botão de envio */}
          <Button type="submit" variant="primary" className="mt-2" disabled={enviando}>
            {enviando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block me-2" />
                {t("contact.sending") || "Enviando..."}
              </>
            ) : (
              t("contact.send")
            )}
          </Button>
        </form>

        {/* Contato alternativo */}
        <div className="mt-8 pt-6 border-t border-[var(--border-color)] text-center transition-colors duration-300" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-[var(--text-secondary)] m-0">
            {t("contact.orContact")}{' '}
            <a href="mailto:contato@plataforma.com" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              contato@plataforma.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Form;
