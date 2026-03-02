"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "@/app/styles/logo.css"; 

interface SplashScreenProps {
  onComplete: () => void;
}

// Cores das letras do logo ESTUDEMY
const letterColors: { [key: string]: string } = {
  E: "#036cf2",      // azul escuro
  S: "#0c87f2",      // azul claro
  T: "#0a7307",      // verde escuro
  U: "#f2cb07",      // amarelo
  D: "#f24c27",      // laranja
  E2: "#e8181c",     // vermelho
  ponto: "#000000",  // preto
  M: "#ff00ff",      // rosa
  Y: "#ff00ff",      // fúcsia
};

const letters = [
  { key: "E", class: "E" },
  { key: "S", class: "S" },
  { key: "T", class: "T" },
  { key: "U", class: "U" },
  { key: "D", class: "D" },
  { key: "E2", class: "E2" },
  { key: "ponto", class: "ponto" },
  { key: "M", class: "M" },
  { key: "Y", class: "Y" },
];

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [filledLetters, setFilledLetters] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Animar o preenchimento letra por letra
    intervalRef.current = setInterval(() => {
      setFilledLetters((prev) => {
        if (prev.length < letters.length) {
          return [...prev, prev.length];
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return prev;
      });
    }, 200); // 200ms entre cada letra

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Quando todas as letras estiverem preenchidas, aguardar um pouco e chamar onComplete
    // Aumentado o tempo para dar mais tempo ao carregamento da página de destino
    if (filledLetters.length === letters.length) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500); // Aguarda 1.5s após completar para dar tempo do carregamento acontecer

      return () => clearTimeout(timer);
    }
  }, [filledLetters.length, letters.length, onComplete]);

  return (
    <div className="fixed inset-0 bg-transparent z-[9999] flex items-center justify-end pr-8 md:pr-16 lg:pr-24">
      <div 
        className="logo font-jaro"
        style={{
          fontSize: "clamp(80px, 10vw, 200px)", // Tamanho maior e responsivo
          fontFamily: "var(--font-jaro), 'Jaro', sans-serif", // Garante que a fonte Jaro seja aplicada
        }}
      >
        {letters.map((letter, index) => {
          const isFilled = filledLetters.includes(index);
          // Usa a cor do logo.css quando preenchido, ou semi-preto quando não preenchido
          const color = isFilled ? letterColors[letter.key] : "#333333";

          return (
            <motion.span
              key={letter.key}
              className={`${letter.class} font-jaro`}
              style={{
                color: color,
                fontFamily: "var(--font-jaro), 'Jaro', sans-serif", // Garante que cada letra use a fonte Jaro
                // As classes do logo.css já definem -webkit-text-stroke-width e -webkit-text-stroke-color
                // Mas precisamos garantir que a cor seja aplicada mesmo quando não preenchido
              }}
              initial={{ opacity: 0.5 }}
              animate={{
                opacity: isFilled ? 1 : 0.5,
                scale: isFilled ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              {letter.key === "ponto" ? "." : letter.key === "E2" ? "E" : letter.key}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

