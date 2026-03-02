import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Jaro } from "next/font/google";
import { SkipLink } from "./components/accessibility/SkipLink";

const jaro = Jaro({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jaro",
});

export const metadata: Metadata = {
  title: "Estude.My",
  description: "Plataforma de aprendizado gamificado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body className={jaro.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <LanguageProvider>
              <ProtectedRoute>
                {children}
              </ProtectedRoute>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
