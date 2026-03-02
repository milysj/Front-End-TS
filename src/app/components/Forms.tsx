import Button from 'react-bootstrap/Button';
import { useLanguage } from "@/app/contexts/LanguageContext";

const Form = () => {
  const { t } = useLanguage();
    return (
        <div className="flex items-center justify-center p-4 m-auto">
        {/* ===============================
          Card principal da conta
          =============================== */}
        <div className="bg-[var(--bg-card)] p-6 rounded shadow-md w-full mx-auto border border-[var(--border-color)] transition-colors duration-300 max-w-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        

            {/* Título e descrição */}
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4 text-center">{t("contact.title")}</h1>
            <p className="text-[var(--text-secondary)] mb-6 text-center">
                {t("contact.subtitle")}
            </p>

            {/* Formulário */}
            <form className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <label className="text-sm text-left text-[var(--text-primary)]">{t("contact.name")}</label>
                    <input
                        type="text"
                        placeholder={t("contact.namePlaceholder")}
                        className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        required
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm text-left text-[var(--text-primary)]">{t("contact.email")}</label>
                    <input
                        type="email"
                        placeholder={t("contact.emailPlaceholder")}
                        className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        required
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm text-left text-[var(--text-primary)]">{t("contact.subject")}</label>
                    <input
                        type="text"
                        placeholder={t("contact.subjectPlaceholder")}
                        className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                        required
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm text-left text-[var(--text-primary)]">{t("contact.message")}</label>
                    <textarea
                        id="message"
                        name="message"
                        placeholder={t("contact.messagePlaceholder")}
                        required
                        className="w-full px-4 py-2 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    />
                </div>

                {/* Botão de envio */}
                <Button type="submit" variant="primary" className="mt-2">
                    {t("contact.send")}
                </Button>
            </form>

            {/* Contato alternativo */}
            <div className="mt-8 pt-6 border-t border-[var(--border-color)] text-center transition-colors duration-300" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-[var(--text-secondary)]">
                    {t("contact.orContact")}{' '}
                    <a href="mailto:contato@plataforma.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                        contato@plataforma.com
                    </a>
                </p>
            </div>
            </div>
        </div>
    );
};

export default Form;
