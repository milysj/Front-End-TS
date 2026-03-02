import React from "react";

// ===============================
// Componente: ConsultAi
// ===============================
const ConsultAi = () => {
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
            Quem Somos
          </h2>
          <p className="text-[var(--text-primary)] text-sm sm:text-base break-words leading-relaxed">
            A ConsultAi é uma startup de tecnologia criada na Faculdade de
            Tecnologia (FATEC). Nosso objetivo é desenvolver soluções de
            software inovadoras voltadas para beneficiar a comunidade,
            utilizando tecnologia como ferramenta para transformar vidas.
          </p>
        </section>

        {/* ===============================
            Seção: Missão, Visão e Valores
            =============================== */}
        <section id="missao" className="mb-6 sm:mb-8 last:mb-0">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words text-[var(--text-primary)]">
            Missão, Visão e Valores
          </h2>
          <p className="text-[var(--text-primary)] text-sm sm:text-base break-words leading-relaxed mb-3">
            <strong className="text-[var(--text-primary)]">Missão:</strong> Facilitar o acesso a soluções tecnológicas
            que promovam impacto social positivo.
          </p>
          <p className="text-[var(--text-primary)] text-sm sm:text-base break-words leading-relaxed mb-3">
            <strong className="text-[var(--text-primary)]">Visão:</strong> Ser reconhecida como uma referência em
            tecnologia para a comunidade.
          </p>
          <p className="text-[var(--text-primary)] text-sm sm:text-base break-words leading-relaxed">
            <strong className="text-[var(--text-primary)]">Valores:</strong> Inovação, Ética, Colaboração e Compromisso
            com o Social.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ConsultAi;
