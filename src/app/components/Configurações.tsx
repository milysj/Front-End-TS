"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  Lock,
  Palette,
  HelpCircle,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Globe,
  Moon,
  Sun,
  Save,
  Check,
  Settings,
  MessageSquare,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/app/contexts/LanguageContext";

// ===============================
// Componente de Configurações do usuário
// ===============================
export default function Configuracoes() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    // Notificações
    emailNotifications: true,
    courseUpdates: false,
    marketingEmails: false,
    
    // Privacidade
    publicProfile: false,
    showEmail: false,
    showProgress: true,
    
    // Aparência
    theme: "light",
    language: language,
    
    // Segurança
    twoFactorAuth: false,
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar formData.theme com o theme global e language com o language global
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      theme: resolvedTheme === "dark" ? "dark" : "light",
      language: language,
    }));
  }, [resolvedTheme, language]);

  type ToggleableKeys = 
  | "emailNotifications" 
  | "courseUpdates" 
  | "marketingEmails" 
  | "publicProfile" 
  | "showEmail" 
  | "showProgress" 
  | "twoFactorAuth";


  // Toggle direto para booleanos
  const handleToggle = (name: ToggleableKeys, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Salvar posição de scroll antes de atualizar estado
    const scrollPosition = window.scrollY || window.pageYOffset;
    
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
    
    // Restaurar posição de scroll após atualização
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });
  };

  // Manipula o submit do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    
    // Simula uma chamada à API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log("Configurações salvas:", formData);
    setIsSaving(false);
    setShowSaveSuccess(true);
    
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  // Componente de Toggle Switch moderno
  const ToggleSwitch = ({
    name,
    checked,
    onChange,
    label,
    description,
  }: {
    name: ToggleableKeys;
    checked: boolean;
    onChange: (e?: React.MouseEvent) => void;
    label: string;
    description?: string;
  }) => (
    <div 
      className="flex items-start justify-between py-4 border-b border-[var(--border-color)] last:border-b-0 transition-colors duration-300"
      onClick={(e) => {
        // Prevenir que o clique no container cause scroll
        e.stopPropagation();
      }}
    >
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(e);
        }}
        onMouseDown={(e) => {
          // Prevenir comportamento padrão no mousedown também
          e.preventDefault();
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? "bg-blue-600 rounded-4" : "bg-gray-500 rounded-4"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  // Componente de Card de Seção
  const SectionCard = ({
    icon: Icon,
    title,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden mb-6 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-[var(--border-color)] dark:from-blue-900/20 dark:to-indigo-900/20 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors duration-300">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );

  // Componente de Botão de Ação
  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    variant = "default",
  }: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all hover:bg-[var(--bg-input)] ${
        variant === "danger"
          ? "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          : "text-[var(--text-primary)] hover:text-[var(--text-primary)]"
      }`}
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl transition-colors duration-300">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t("settings.title")}</h1>
        </div>
        <p className="text-[var(--text-secondary)] ml-14">
          {t("settings.subtitle")}
        </p>
      </div>

      <form 
        onSubmit={handleSubmit} 
        onKeyDown={(e) => {
          // Prevenir submit quando Enter é pressionado em elementos que não são o botão de submit
          if (e.key === 'Enter' && e.target !== e.currentTarget.querySelector('button[type="submit"]')) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onClick={(e) => {
          // Prevenir comportamento padrão quando clicar em elementos que não são o botão de submit
          const target = e.target as HTMLElement;
          const isSubmitButton = target.closest('button[type="submit"]');
          if (!isSubmitButton) {
            e.stopPropagation();
          }
        }}
      >
        {/* Seção: Notificações */}
        <SectionCard icon={Bell} title={t("settings.notifications")}>
          <ToggleSwitch
            name="emailNotifications"
            checked={formData.emailNotifications}
            onChange={(e) => handleToggle("emailNotifications", e)}
            label={t("settings.emailNotifications")}
            description={t("settings.emailNotificationsDesc")}
          />
          <ToggleSwitch
            name="courseUpdates"
            checked={formData.courseUpdates}
            onChange={(e) => handleToggle("courseUpdates", e)}
            label={t("settings.courseUpdates")}
            description={t("settings.courseUpdatesDesc")}
          />
          <ToggleSwitch
            name="marketingEmails"
            checked={formData.marketingEmails}
            onChange={(e) => handleToggle("marketingEmails", e)}
            label={t("settings.marketingEmails")}
            description={t("settings.marketingEmailsDesc")}
          />
        </SectionCard>

        {/* Seção: Privacidade */}
        <SectionCard icon={Shield} title={t("settings.privacy")}>
          <ToggleSwitch
            name="publicProfile"
            checked={formData.publicProfile}
            onChange={(e) => handleToggle("publicProfile", e)}
            label={t("settings.publicProfile")}
            description={t("settings.publicProfileDesc")}
          />
          <ToggleSwitch
            name="showEmail"
            checked={formData.showEmail}
            onChange={(e) => handleToggle("showEmail", e)}
            label={t("settings.showEmail")}
            description={t("settings.showEmailDesc")}
          />
          <ToggleSwitch
            name="showProgress"
            checked={formData.showProgress}
            onChange={(e) => handleToggle("showProgress", e)}
            label={t("settings.showProgress")}
            description={t("settings.showProgressDesc")}
          />
        </SectionCard>

        {/* Seção: Aparência */}
        <SectionCard icon={Palette} title={t("settings.appearance")}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {t("settings.theme")}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const scrollPosition = window.scrollY || window.pageYOffset;
                    setTheme("light");
                    setFormData((prev) => ({ ...prev, theme: "light" }));
                    requestAnimationFrame(() => {
                      window.scrollTo(0, scrollPosition);
                    });
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.theme === "light"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-[var(--border-color)]"
                  }`}
                  style={{ 
                    backgroundColor: formData.theme === "light" ? undefined : 'var(--bg-input)',
                    borderColor: formData.theme === "light" ? undefined : 'var(--border-color)',
                    color: formData.theme === "light" ? undefined : 'var(--text-primary)'
                  }}
                >
                  <Sun className="w-5 h-5" />
                  <span className="font-medium">{t("settings.light")}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const scrollPosition = window.scrollY || window.pageYOffset;
                    setTheme("dark");
                    setFormData((prev) => ({ ...prev, theme: "dark" }));
                    requestAnimationFrame(() => {
                      window.scrollTo(0, scrollPosition);
                    });
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.theme === "dark"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-[var(--border-color)]"
                  }`}
                  style={{ 
                    backgroundColor: formData.theme === "dark" ? undefined : 'var(--bg-input)',
                    borderColor: formData.theme === "dark" ? undefined : 'var(--border-color)',
                    color: formData.theme === "dark" ? undefined : 'var(--text-primary)'
                  }}
                >
                  <Moon className="w-5 h-5" />
                  <span className="font-medium">{t("settings.dark")}</span>
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-[var(--text-primary)] mb-2"
              >
                {t("settings.language")}
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={(e) => {
                  const newLanguage = e.target.value as "pt-BR" | "en-US" | "es-ES";
                  setLanguage(newLanguage, true);
                  setFormData((prev) => ({ ...prev, language: newLanguage }));
                }}
                className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Seção: Segurança */}
        <SectionCard icon={Lock} title={t("settings.security")}>
          <ToggleSwitch
            name="twoFactorAuth"
            checked={formData.twoFactorAuth}
            onChange={(e) => handleToggle("twoFactorAuth", e)}
            label={t("settings.twoFactorAuth")}
            description={t("settings.twoFactorAuthDesc")}
          />
          <div className="pt-4 mt-4 border-t border-[var(--border-color)] transition-colors duration-300">
            <ActionButton
              icon={Lock}
              label={t("settings.changePassword")}
              onClick={() => router.push("/dadosPessoais")}
            />
          </div>
        </SectionCard>

        {/* Seção: Ajuda e Suporte */}
        <SectionCard icon={HelpCircle} title={t("settings.help")}>
          <div className="space-y-2">
            <ActionButton
              icon={FileText}
              label={t("settings.faq")}
              onClick={() => router.push("/faq")}
            />
            <ActionButton
              icon={MessageSquare}
              label={t("settings.contact")}
              onClick={() => router.push("/faleConosco")}
            />
            <ActionButton
              icon={Mail}
              label={t("settings.feedback")}
              onClick={() => router.push("/feedback")}
            />
          </div>
        </SectionCard>

        {/* Botão de Salvar */}
        <div className="sticky bottom-0 bg-[var(--bg-card)] border-t border-[var(--border-color)] px-4 py-4 -mx-4 -mb-8 mt-8 shadow-lg transition-colors duration-300 rounded-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showSaveSuccess && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {t("settings.savedSuccess")}
                  </span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg rounded-3"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t("settings.saving")}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{t("settings.saveChanges")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
