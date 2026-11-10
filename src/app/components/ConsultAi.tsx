import React from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";

// ===============================
// Componente: ConsultAi
// ===============================
const ConsultAi = () => {
  const { t } = useLanguage();

  return (
    // Container principal com largura máxima, padding responsivo e borda arredondada
    <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 w-full">
      {/* ===============================
          Card principal da ConsultAi
          =============================== */}
      <div className="bg-[var(--bg-card)] p-4 sm:p-6 md:p-8 rounded shadow-md w-full max-w-4xl mx-auto border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        {/* ===============================
            Seção: Quem Somos
            =============================== */}
        <section id="sobre" className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words text-[var(--text-primary)]">
            {t("consultAi.aboutTitle")}
          </h2>
          <p className="text-[var(--text-primary)] text-sm sm:text-base break-words leading-relaxed">
            {t("consultAi.aboutDesc")}
          </p>
        </section>

        {/* ===============================
            Seção: Missão, Visão e Valores
            =============================== */}
        <section id="missao" className="mb-6 sm:mb-8 last:mb-0">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words text-[var(--text-primary)]">
            {t("consultAi.missionTitle")}
          </h2>
          <p className="text-[var(--text-primary)] text-sm sm:text-base break-words leading-relaxed mb-3">
            <strong className="text-[var(--text-primary)]">{t("consultAi.mission")}</strong>{t("consultAi.missionDesc")}
          </p>
          <p className="text-[var(--text-primary)] text-sm sm:text-base break-words leading-relaxed mb-3">
            <strong className="text-[var(--text-primary)]">{t("consultAi.vision")}</strong>{t("consultAi.visionDesc")}
          </p>
          <p className="text-[var(--text-primary)] text-sm sm:text-base break-words leading-relaxed">
            <strong className="text-[var(--text-primary)]">{t("consultAi.values")}</strong>{t("consultAi.valuesDesc")}
          </p>
        </section>
      </div>
    </div>
  );
};

export default ConsultAi;
