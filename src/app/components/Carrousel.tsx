"use client";

import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface Trilha {
  _id: string;
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: string;
  image?: string;
  imagem?: string; // Campo do backend
}

interface Props {
  items?: Trilha[]; // Pode ser undefined ou array vazio
  onClick?: (id: string) => void;
}

export default function Carrousel({ items = [], onClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [screenSize, setScreenSize] = useState<"small" | "medium" | "large">(
    "large"
  );
  const [cardWidth, setCardWidth] = useState("15rem");

  // Detecta tamanho da tela e ajusta cards
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 400) {
        setScreenSize("small");
        setCardWidth("14rem");
      } else if (width < 768) {
        setScreenSize("medium");
        setCardWidth("16rem");
      } else {
        setScreenSize("large");
        setCardWidth("18rem");
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardElements = container.querySelectorAll('[data-carousel-card]');
      
      if (cardElements.length === 0) return;
      
      // Calcular a largura de um card + gap
      const firstCard = cardElements[0] as HTMLElement;
      const cardWidth = firstCard.offsetWidth; // Largura em pixels
      const gap = window.getComputedStyle(container).gap;
      const gapValue = gap ? parseInt(gap) || (screenSize === "small" ? 8 : 16) : (screenSize === "small" ? 8 : 16); // gap-2 (8px) ou gap-4 (16px)
      const scrollDistance = cardWidth + gapValue;
      
      if (container.scrollLeft === 0) {
        // Se estiver no início, ir para o final
        container.scrollTo({
          left: container.scrollWidth,
          behavior: "smooth",
        });
      } else {
        // Scroll de exatamente um card para a esquerda
        container.scrollBy({ left: -scrollDistance, behavior: "smooth" });
      }
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardElements = container.querySelectorAll('[data-carousel-card]');
      
      if (cardElements.length === 0) return;
      
      // Calcular a largura de um card + gap
      const firstCard = cardElements[0] as HTMLElement;
      const cardWidth = firstCard.offsetWidth; // Largura em pixels
      const gap = window.getComputedStyle(container).gap;
      const gapValue = gap ? parseInt(gap) || (screenSize === "small" ? 8 : 16) : (screenSize === "small" ? 8 : 16); // gap-2 (8px) ou gap-4 (16px)
      const scrollDistance = cardWidth + gapValue;
      
      if (
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth - 1
      ) {
        // Se estiver no final, ir para o início
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Scroll de exatamente um card para a direita
        container.scrollBy({ left: scrollDistance, behavior: "smooth" });
      }
    }
  };

  const isMobile = screenSize !== "large";
  const isSmall = screenSize === "small";

  if (items.length === 0) {
    return (
      <p 
        className="text-center text-[var(--text-secondary)] py-6"
        role="status"
        aria-live="polite"
      >
        Nenhuma trilha encontrada.
      </p>
    );
  }

  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-xl w-full mx-auto ${
        isMobile ? "p-2" : "p-4"
      }`}
      role="region"
      aria-label="Carrossel de trilhas"
    >
      <div className="flex items-center gap-2 w-full">
        <button
          onClick={handleScrollLeft}
          className={`flex-shrink-0 hover:bg-[var(--bg-input)] rounded transition-colors duration-300 z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${
            isSmall ? "p-0.5" : isMobile ? "p-1" : "p-3"
          }`}
          style={{ color: 'var(--text-primary)' }}
          aria-label="Rolar carrossel para a esquerda"
        >
          <ChevronLeftIcon
            className={isSmall ? "w-5 h-5" : isMobile ? "w-6 h-6" : "w-10 h-10"}
            aria-hidden="true"
          />
        </button>

        <div
          ref={scrollRef}
          className={`flex overflow-x-auto no-scrollbar scroll-smooth w-full py-2 ${
            isSmall ? "gap-2 pl-2 pr-2" : "gap-4 pl-4 pr-4"
          }`}
          style={{ scrollPaddingLeft: isSmall ? '8px' : '16px', scrollPaddingRight: isSmall ? '8px' : '16px' }}
          role="list"
          aria-label={`${items.length} trilhas disponíveis`}
        >
          {items.map((item, index) => (
            <div
              key={item._id}
              data-carousel-card
              onClick={() => onClick?.(item._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.(item._id);
                }
              }}
              className="flex-shrink-0 w-full rounded-lg border bg-[var(--bg-card)] shadow hover:shadow-xl hover:scale-105 cursor-pointer transition-all duration-200 transform border-[var(--border-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              style={{ minWidth: cardWidth, maxWidth: cardWidth, backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              role="listitem"
              tabIndex={0}
              aria-label={`Trilha: ${item.titulo}. ${item.descricao}. Matéria: ${item.materia}. Dificuldade: ${item.dificuldade}`}
            >
              {(item.image || item.imagem) && (
                <img
                  src={item.image || item.imagem}
                  alt={`Imagem da trilha ${item.titulo}`}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              )}
              <div className="p-2">
                <h3 className="text-base font-bold text-[var(--text-primary)]">{item.titulo}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.descricao}</p>
                <p className="text-xs mt-1 text-[var(--text-muted)]">
                  Matéria: <b>{item.materia}</b> | Dificuldade:{" "}
                  <b>{item.dificuldade}</b>
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleScrollRight}
          className={`flex-shrink-0 hover:bg-[var(--bg-input)] rounded transition-colors duration-300 z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${
            isSmall ? "p-0.5" : isMobile ? "p-1" : "p-3"
          }`}
          style={{ color: 'var(--text-primary)' }}
          aria-label="Rolar carrossel para a direita"
        >
          <ChevronRightIcon
            className={isSmall ? "w-5 h-5" : isMobile ? "w-6 h-6" : "w-10 h-10"}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
