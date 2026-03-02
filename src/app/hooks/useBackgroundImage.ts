"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type BackgroundType = "login" | "lp" | "pages";

export function useBackgroundImage(type: BackgroundType = "pages"): string {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const backgrounds = {
    login: {
      dark: "/img/backgrounds/background_login_darkmode.jpg",
      light: "/img/backgrounds/background_login_lightmode.png",
    },
    lp: {
      dark: "/img/backgrounds/backgroun_lp_darkmode.jpg",
      light: "/img/backgrounds/background_lp_ligthmode.png",
    },
    pages: {
      dark: "/img/backgrounds/background_pages_darkmode.jpg",
      light: "/img/backgrounds/background_pages_lightmode.png",
    },
  };

  if (!mounted) {
    return ""; // Return empty string on server to avoid hydration mismatch
  }

  return resolvedTheme === "dark" ? backgrounds[type].dark : backgrounds[type].light;
}
