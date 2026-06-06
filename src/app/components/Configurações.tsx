"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Lock,
  Palette,
  HelpCircle,
  Mail,
  Shield,
  Moon,
  Sun,
  Check,
  Settings,
  MessageSquare,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/app/services/api";
import { API_ENDPOINTS } from "@/app/config/api.config";

// ===============================
// Componente de Configurações do usuário
// ===============================
export default function Configuracoes() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  
  const auth = useAuth();
  
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

  // Estados para o fluxo de 2FA
  const [show2faSetupModal, setShow2faSetupModal] = useState(false);
  const [show2faDisableModal, setShow2faDisableModal] = useState(false);
  const [totpQrCode, setTotpQrCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFactorStep, setTwoFactorStep] = useState<"setup" | "backup">("setup");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disableTotpToken, setDisableTotpToken] = useState("");
  const [error2fa, setError2fa] = useState("");
  const [loading2fa, setLoading2fa] = useState(false);

  // Carregar preferências do usuário ao montar o componente
  useEffect(() => {
    let isMounted = true;
    const loadUserPreferences = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.USERS.ME);
        if (response.data && isMounted) {
          const u = response.data;
          setFormData((prev) => ({
            ...prev,
            emailNotifications: u.emailNotifications ?? true,
            courseUpdates: u.courseUpdates ?? false,
            marketingEmails: u.marketingEmails ?? false,
            publicProfile: u.publicProfile ?? false,
            showEmail: u.showEmail ?? false,
            showProgress: u.showProgress ?? true,
            twoFactorAuth: u.twoFactorEnabled ?? false,
          }));
        }
      } catch (err) {
        console.error("Erro ao carregar preferências:", err);
      }
    };
    loadUserPreferences();
    return () => {
      isMounted = false;
    };
  }, []);

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
  const handleToggle = async (name: ToggleableKeys, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Salvar posição de scroll antes de atualizar estado
    const scrollPosition = window.scrollY || window.pageYOffset;
    
    const newValue = !formData[name];
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Salvar alteração automaticamente no backend
    await salvarConfiguracao({ [name]: newValue });
    
    // Restaurar posição de scroll após atualização
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });
  };

  // Funções de 2FA
  const iniciarSetup = async () => {
    setLoading2fa(true);
    setError2fa("");
    try {
      const response = await apiClient.post("/users/2fa/setup");
      if (response.data && response.data.success) {
        setTotpQrCode(response.data.qrDataUrl);
        setTotpSecret(response.data.manualKey);
        setShow2faSetupModal(true);
      }
    } catch (err: unknown) {
      console.error("Erro ao iniciar setup 2FA:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError2fa(error.response?.data?.message || "Erro ao iniciar configuração do 2FA.");
    } finally {
      setLoading2fa(false);
    }
  };

  const confirmarSetup = async () => {
    if (!totpCode || totpCode.trim().length < 6) {
      setError2fa("Digite o código de 6 dígitos.");
      return;
    }
    setLoading2fa(true);
    setError2fa("");
    try {
      const response = await apiClient.post("/users/2fa/confirm", {
        token: totpCode.trim()
      });
      if (response.data && response.data.success) {
        setBackupCodes(response.data.backupCodes || []);
        setTwoFactorStep("backup");
        setFormData(prev => ({ ...prev, twoFactorAuth: true }));
      }
    } catch (err: unknown) {
      console.error("Erro ao confirmar 2FA:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError2fa(error.response?.data?.message || "Código inválido ou expirado. Tente novamente.");
    } finally {
      setLoading2fa(false);
    }
  };

  const desativar2fa = async () => {
    if (!confirmPassword) {
      setError2fa("Digite sua senha para confirmar.");
      return;
    }
    if (!disableTotpToken) {
      setError2fa("Digite o código TOTP ou de recuperação.");
      return;
    }
    setLoading2fa(true);
    setError2fa("");
    try {
      const response = await apiClient.post("/users/2fa/disable", {
        senha: confirmPassword,
        token: disableTotpToken.trim()
      });
      if (response.data && response.data.success) {
        setFormData(prev => ({ ...prev, twoFactorAuth: false }));
        setShow2faDisableModal(false);
      }
    } catch (err: unknown) {
      console.error("Erro ao desativar 2FA:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError2fa(error.response?.data?.message || "Senha ou código incorretos.");
    } finally {
      setLoading2fa(false);
    }
  };

  // Salva as configurações automaticamente no backend
  const salvarConfiguracao = async (updatedFields: Partial<typeof formData>) => {
    setIsSaving(true);
    setShowSaveSuccess(false);
    
    const merged = { ...formData, ...updatedFields };
    
    try {
      await apiClient.put(API_ENDPOINTS.USERS.PREFERENCIAS, {
        emailNotifications: merged.emailNotifications,
        courseUpdates: merged.courseUpdates,
        marketingEmails: merged.marketingEmails,
        publicProfile: merged.publicProfile,
        showEmail: merged.showEmail,
        showProgress: merged.showProgress,
        tema: merged.theme,
        idioma: merged.language,
      });

      // Refresh user cache in AuthContext (updates Cookies as well)
      if (auth && auth.refreshUser) {
        await auth.refreshUser();
      }

      // Se o idioma ou tema mudaram, a alteração no backend é salva.
      // A gente também atualiza o estado local global de idioma/tema se necessário:
      if (updatedFields.language && updatedFields.language !== language) {
        setLanguage(updatedFields.language, false); // false para não duplicar requisição
      }
      if (updatedFields.theme && updatedFields.theme !== theme) {
        setTheme(updatedFields.theme);
      }

      setShowSaveSuccess(true);
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Erro ao salvar configurações automaticamente:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Componente de Toggle Switch moderno
  const ToggleSwitch = ({
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
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

        {/* Status de Salvamento Automático */}
        <div className="flex items-center gap-2 ml-14 sm:ml-0 h-10">
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div
                key="saving"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/30"
              >
                <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span>{t("settings.saving") || "Salvando..."}</span>
              </motion.div>
            ) : showSaveSuccess ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-900/30"
              >
                <Check className="w-4 h-4" />
                <span>{t("settings.savedSuccess") || "Salvo!"}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-6">
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
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const scrollPosition = window.scrollY || window.pageYOffset;
                    setTheme("light");
                    if (auth?.isAuthenticated && auth?.updateUserTheme) {
                      auth.updateUserTheme("light");
                    }
                    setFormData((prev) => ({ ...prev, theme: "light" }));
                    await salvarConfiguracao({ theme: "light" });
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
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const scrollPosition = window.scrollY || window.pageYOffset;
                    setTheme("dark");
                    if (auth?.isAuthenticated && auth?.updateUserTheme) {
                      auth.updateUserTheme("dark");
                    }
                    setFormData((prev) => ({ ...prev, theme: "dark" }));
                    await salvarConfiguracao({ theme: "dark" });
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
                onChange={async (e) => {
                  const newLanguage = e.target.value as "pt-BR" | "en-US" | "es-ES";
                  setFormData((prev) => ({ ...prev, language: newLanguage }));
                  await salvarConfiguracao({ language: newLanguage });
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
            onChange={() => {
              if (formData.twoFactorAuth) {
                setConfirmPassword("");
                setDisableTotpToken("");
                setError2fa("");
                setShow2faDisableModal(true);
              } else {
                setTotpCode("");
                setError2fa("");
                setTwoFactorStep("setup");
                iniciarSetup();
              }
            }}
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

      </div>

      {/* 2FA Setup/Confirm Modal */}
      <AnimatePresence>
        {show2faSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              {twoFactorStep === "setup" ? (
                <>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    {t("settings.twoFactorTitle") || "Configurar 2FA"}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                    {t("settings.twoFactorSetupInstructions") || "Escaneie o código QR abaixo com seu aplicativo de autenticação (como Google Authenticator ou Authy) ou insira a chave manual."}
                  </p>
                  
                  {totpQrCode ? (
                    <div className="flex justify-center p-4 bg-white rounded-xl mb-4 border border-gray-200 shadow-inner max-w-[200px] mx-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={totpQrCode} alt="2FA QR Code" className="w-full h-auto" />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  <div className="mb-4">
                    <span className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                      {t("settings.twoFactorKey") || "Chave Manual"}
                    </span>
                    <div className="flex items-center gap-2 p-2 bg-[var(--bg-input)] rounded border border-[var(--border-color)]">
                      <code className="text-xs font-mono text-[var(--text-primary)] break-all select-all flex-1">
                        {totpSecret}
                      </code>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      {t("settings.twoFactorEnterCode") || "Código de Autenticação"}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center tracking-[0.5em] text-lg font-bold px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--bg-input)] text-[var(--text-primary)]"
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    />
                  </div>

                  {error2fa && (
                    <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/30">
                      {error2fa}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShow2faSetupModal(false);
                        setFormData(prev => ({ ...prev, twoFactorAuth: false }));
                      }}
                      className="flex-1 px-4 py-3 border border-[var(--border-color)] text-[var(--text-primary)] font-medium rounded-lg hover:bg-[var(--bg-input)] transition-colors"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      {t("common.cancel") || "Cancelar"}
                    </button>
                    <button
                      type="button"
                      disabled={loading2fa || totpCode.length < 6}
                      onClick={confirmarSetup}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading2fa ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        t("settings.twoFactorConfirm") || "Confirmar e Ativar"
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                    {t("settings.twoFactorBackupTitle") || "Códigos de Recuperação"}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                    {t("settings.twoFactorBackupIntro") || "Salve estes códigos de recuperação em um local seguro. Cada código só pode ser usado uma vez se você perder o acesso ao seu dispositivo de autenticação."}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-4 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl mb-6 max-h-48 overflow-y-auto">
                    {backupCodes.map((code, idx) => (
                      <div key={idx} className="font-mono text-center text-sm font-semibold p-1.5 bg-[var(--bg-card)] rounded border border-[var(--border-color)] text-[var(--text-primary)]">
                        {code}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShow2faSetupModal(false);
                      setFormData(prev => ({ ...prev, twoFactorAuth: true }));
                    }}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t("settings.twoFactorClose") || "Fechar"}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2FA Disable Modal */}
      <AnimatePresence>
        {show2faDisableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 shadow-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6" />
                {t("settings.twoFactorDisableTitle") || "Desativar Autenticação de Dois Fatores (2FA)"}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                {t("settings.twoFactorDisableConfirmText") || "Para confirmar a desativação da autenticação de dois fatores, digite sua senha e o código atual do aplicativo de autenticação ou um código de recuperação."}
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    {t("settings.twoFactorPassword") || "Sua Senha Atual"}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--bg-input)] text-[var(--text-primary)]"
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    {t("settings.twoFactorCodeOrBackup") || "Código de Autenticação / Recuperação"}
                  </label>
                  <input
                    type="text"
                    value={disableTotpToken}
                    onChange={(e) => setDisableTotpToken(e.target.value)}
                    placeholder="000000"
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--bg-input)] text-[var(--text-primary)] text-center tracking-wider"
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              {error2fa && (
                <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/30">
                  {error2fa}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShow2faDisableModal(false);
                    setFormData(prev => ({ ...prev, twoFactorAuth: true }));
                  }}
                  className="flex-1 px-4 py-3 border border-[var(--border-color)] text-[var(--text-primary)] font-medium rounded-lg hover:bg-[var(--bg-input)] transition-colors"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  {t("common.cancel") || "Cancelar"}
                </button>
                <button
                  type="button"
                  disabled={loading2fa || !confirmPassword || !disableTotpToken}
                  onClick={desativar2fa}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading2fa ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    t("settings.twoFactorDisableConfirm") || "Desativar"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
