"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import "@/app/styles/logo.css";

interface SplashScreenProps {
  onComplete: () => void;
  mensagem?: string;
}

const letterColorsLight: { [key: string]: string } = {
  E: "#036cf2",      // azul escuro
  S: "#0c87f2",      // azul claro
  T: "#0a7307",      // verde escuro
  U: "#f2cb07",      // amarelo
  D: "#f24c27",      // laranja
  E2: "#e8181c",     // vermelho
  ponto: "#000000",  // preto no tema claro
  M: "#ff00ff",      // rosa
  Y: "#ff00ff",      // fúcsia
};

const letterColorsDark: { [key: string]: string } = {
  E: "#38bdf8",      // azul vibrante
  S: "#0ea5e9",      // azul claro
  T: "#22c55e",      // verde
  U: "#eab308",      // amarelo
  D: "#f97316",      // laranja
  E2: "#ef4444",     // vermelho
  ponto: "#ffffff",  // branco no tema escuro
  M: "#ec4899",      // rosa
  Y: "#d946ef",      // fúcsia
};

const letters = [
  { key: "E", class: "E", label: "E" },
  { key: "S", class: "S", label: "S" },
  { key: "T", class: "T", label: "T" },
  { key: "U", class: "U", label: "U" },
  { key: "D", class: "D", label: "D" },
  { key: "E2", class: "E2", label: "E" },
  { key: "ponto", class: "ponto", label: "." },
  { key: "M", class: "M", label: "M" },
  { key: "Y", class: "Y", label: "Y" },
];

export default function SplashScreen({ onComplete, mensagem = "CARREGANDO JOGO..." }: SplashScreenProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [filledLetters, setFilledLetters] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted
    ? resolvedTheme === "dark"
    : typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const colors = isDark ? letterColorsDark : letterColorsLight;
  const unfilledColor = isDark ? "#3f3f46" : "#cbd5e1";

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
    }, 140); // 140ms por letra para animação ágil e fluida

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Quando todas as letras estiverem preenchidas, aguarda breve momento e conclui
    if (filledLetters.length === letters.length) {
      const timer = setTimeout(() => {
        onComplete();
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [filledLetters.length, onComplete]);

  const progressPercent = Math.min(100, Math.round((filledLetters.length / letters.length) * 100));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.45, ease: "easeInOut" } }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden ${
        isDark ? "bg-[#121212] text-white" : "bg-[#f3f4f6] text-gray-900"
      }`}
      style={{
        background: isDark
          ? "radial-gradient(ellipse at center, #1f1f23 0%, #111113 100%)"
          : "radial-gradient(ellipse at center, #ffffff 0%, #f3f4f6 100%)",
      }}
    >
      {/* Container centralizado da Logo */}
      <div className="flex flex-col items-center justify-center px-4">
        <div
          className="logo font-jaro flex items-center justify-center tracking-normal"
          style={{
            fontSize: "clamp(64px, 12vw, 160px)",
            fontFamily: "var(--font-jaro), 'Jaro', sans-serif",
            height: "auto",
          }}
        >
          {letters.map((letter, index) => {
            const isFilled = filledLetters.includes(index);
            const color = isFilled ? colors[letter.key] : unfilledColor;
            const strokeColor = isDark
              ? letter.key === "ponto" ? "#ffffff" : "#000000"
              : "#000000";

            return (
              <motion.span
                key={letter.key}
                className={`${letter.class} font-jaro inline-block`}
                style={{
                  color: color,
                  fontFamily: "var(--font-jaro), 'Jaro', sans-serif",
                  WebkitTextStrokeWidth: "2.5px",
                  WebkitTextStrokeColor: strokeColor,
                  margin: letter.key === "ponto" ? "0 2px" : "0",
                }}
                initial={{ opacity: 0.35, scale: 0.9 }}
                animate={{
                  opacity: isFilled ? 1 : 0.4,
                  scale: isFilled ? [1, 1.15, 1] : 1,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
              >
                {letter.label}
              </motion.span>
            );
          })}
        </div>

        {/* Barra de Progresso elegante */}
        <div className="w-56 sm:w-72 h-1.5 bg-gray-300/60 dark:bg-zinc-800 rounded-full mt-6 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #036cf2, #0c87f2, #f2cb07, #f24c27, #ff00ff)",
              width: `${progressPercent}%`,
            }}
            transition={{ ease: "easeInOut", duration: 0.2 }}
          />
        </div>

        {/* Mensagem de status */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs font-semibold tracking-[0.25em] uppercase mt-3 ${
            isDark ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          {mensagem}
        </motion.p>
      </div>
    </motion.div>
  );
}
