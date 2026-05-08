"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  // We use a try-catch for useAuth because ThemeToggle might be rendered outside AuthProvider in some edge cases (though unlikely here)
  let auth: ReturnType<typeof useAuth> | null = null;
  try {
    auth = useAuth();
  } catch (e) {
    // If not within AuthProvider, it's fine, we just won't sync with DB.
  }

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleToggle = () => {
    const novoTema = theme === "dark" ? "light" : "dark";
    setTheme(novoTema);
    
    // Se o usuário estiver logado, salva a preferência no banco
    if (auth?.isAuthenticated && auth?.updateUserTheme) {
      auth.updateUserTheme(novoTema);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
      aria-label="Alternar tema"
      title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-yellow-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
