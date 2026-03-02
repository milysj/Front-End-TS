"use client";

import React, { createContext, useContext, useState, useEffect, useLayoutEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext"; // Import useAuth

type Language = "pt-BR" | "en-US" | "es-ES";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language, saveToBackend?: boolean) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/", "/login", "/cadastro", "/recuperar-senha"];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt-BR");
  const [translations, setTranslations] = useState<any>({});
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth(); // Get user and loading state from AuthContext

  const isPublicRoute = pathname ? PUBLIC_ROUTES.includes(pathname) : false;

  // Effect to load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translationsModule = await import(`@/app/locales/${language}.json`);
        setTranslations(translationsModule.default || translationsModule);
      } catch (error) {
        console.error(`Error loading translations for ${language}:`, error);
        try {
          const fallback = await import(`@/app/locales/pt-BR.json`);
          setTranslations(fallback.default || fallback);
        } catch (e) {
          setTranslations({});
        }
      }
    };
    loadTranslations();
  }, [language]);
  
  // Effect to set the initial language from user preferences, local storage, or browser settings
  useEffect(() => {
    // Wait for auth to finish loading before determining the language
    if (authLoading) {
      return;
    }
    
    let determinedLanguage: Language | null = null;

    // 1. If user is authenticated, try to get language from user object
    if (user && user.idioma) {
      determinedLanguage = user.idioma as Language;
    }
    
    // 2. If not found, try localStorage
    if (!determinedLanguage) {
      const savedLanguage = localStorage.getItem("language") as Language | null;
      if (savedLanguage && ["pt-BR", "en-US", "es-ES"].includes(savedLanguage)) {
        determinedLanguage = savedLanguage;
      }
    }

    // 3. If still not found, use browser language
    if (!determinedLanguage) {
        const browserLang = navigator.language || "pt-BR";
        if (browserLang.startsWith("en")) determinedLanguage = "en-US";
        else if (browserLang.startsWith("es")) determinedLanguage = "es-ES";
        else determinedLanguage = "pt-BR";
    }

    if (determinedLanguage) {
        setLanguageState(determinedLanguage);
        document.documentElement.setAttribute("lang", determinedLanguage);
    }
  }, [user, authLoading]);


  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return typeof value === "string" ? value : key;
  };

  const setLanguage = async (newLanguage: Language, saveToBackend: boolean = true) => {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
    document.documentElement.setAttribute("lang", newLanguage);
    
    // Save to backend only if authenticated and not on a public route
    if (saveToBackend && !isPublicRoute && user) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          await fetch(`${API_URL}/api/users/idioma`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ idioma: newLanguage }),
          });
        } catch (error) {
          console.error("Error saving language to backend:", error);
        }
      }
    }
    
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

