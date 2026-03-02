"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";

const Faq = () => {
    const { t } = useLanguage();
    
    return (
      // Container principal com largura máxima, padding responsivo e borda arredondada
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 w-full">
        {/* ===============================
          Card principal da FAQ
          =============================== */}
        <div className="bg-[var(--bg-card)] p-4 sm:p-6 md:p-8 rounded shadow-md w-full max-w-4xl mx-auto border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          {/* Seção 1 */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words text-[var(--text-primary)]">
              {t("faq.whatIs")}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base break-words leading-relaxed">
              {t("faq.whatIsAnswer")}
            </p>
          </section>

          {/* Seção 2 */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words text-[var(--text-primary)]">
              {t("faq.howCreate")}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base break-words leading-relaxed">
              {t("faq.howCreateAnswer")}
            </p>
          </section>

          {/* Seção 3 */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words text-[var(--text-primary)]">
              {t("faq.rewards")}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base break-words leading-relaxed">
              {t("faq.rewardsAnswer")}
            </p>
          </section>

          {/* Seção 4 */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words text-[var(--text-primary)]">
              {t("faq.subjects")}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base break-words leading-relaxed">
              {t("faq.subjectsAnswer")}
            </p>
          </section>

          {/* Seção 5 */}
          <section className="mb-6 sm:mb-8 last:mb-0">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words text-[var(--text-primary)]">
              {t("faq.payment")}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base break-words leading-relaxed">
              {t("faq.paymentAnswer")}
            </p>
          </section>
        </div>
      </div>
    );
};

export default Faq;
