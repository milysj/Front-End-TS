const Footer = () => {
    return (
        <footer 
            className="bg-[var(--bg-card)] text-[var(--text-primary)] py-6 mt-8 align-bottom border-t border-[var(--border-color)] transition-colors duration-300" 
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            role="contentinfo"
            aria-label="Rodapé do site"
        >
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Copyright */}
                <div className="text-lg font-semibold text-[var(--text-primary)]">
                    <span aria-label={`ConsultAi, todos os direitos reservados ${new Date().getFullYear()}`}>
                        ConsultAi © {new Date().getFullYear()}
                    </span>
                </div>

                {/* Redes sociais */}
                <nav aria-label="Links de redes sociais">
                    <div className="flex flex-row-reverse gap-3">
                        <a
                            href="https://github.com/milysj/Full-Stack-Estude.my"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-400 transition-colors text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                            aria-label="Visite nosso repositório no GitHub (abre em nova aba)"
                        >
                            Github
                        </a>
                    </div>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
