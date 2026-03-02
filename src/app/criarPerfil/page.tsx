"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import ThemeToggle from "@/app/components/ThemeToggle";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

export default function CriarPerfil() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [personagem, setPersonagem] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [verificando, setVerificando] = useState(true);
  useKeyboardNavigation();

  // Determinar a imagem de fundo baseada no tema (mesmo do login)
  const backgroundImage = theme === "dark" 
    ? "/img/backgrounds/background_login_darkmode.jpg"
    : "/img/backgrounds/background_login_lightmode.png";

  const personagens = [
    { nome: "Guerreiro", imagem: "/img/guerreiro.png" },
    { nome: "Mago", imagem: "/img/mago.png" },
    { nome: "Samurai", imagem: "/img/samurai.png" },
  ];

  const fotosPreDefinidas = [
    "/img/guerreiro.png",
    "/img/mago.png",
    "/img/samurai.png",
  ];

  const handlePreDefinidaClick = (url: string) => {
    setFotoPerfil(url);
    setPreview(url);
  };

  // Verifica se o perfil já foi criado ao carregar a página
  useEffect(() => {
    const verificarPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const resposta = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (resposta.ok) {
          const dadosUsuario = await resposta.json();

          // Se o perfil já foi criado (tem personagem e username), redireciona para home
          if (
            dadosUsuario.personagem &&
            dadosUsuario.username &&
            dadosUsuario.personagem.trim() !== "" &&
            dadosUsuario.username.trim() !== ""
          ) {
            router.push("/home");
            return;
          }
        }
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
      } finally {
        setVerificando(false);
      }
    };

    verificarPerfil();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personagem || !username || !fotoPerfil) {
      setMensagem(`⚠️ ${t("profile.required")}`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("🔑 Token enviado:", token);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const resposta = await fetch(`${API_URL}/api/auth/criarPerfil`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          personagem,
          username,
          fotoPerfil,
        }),
      });

      const data = await resposta.json();
      console.log("Resposta do servidor:", data);
      console.log("Status:", resposta.status);

      if (resposta.ok) {
        setMensagem(`✅ ${t("profile.success")}`);
        // Invalidar cache de perfil para forçar nova verificação
        localStorage.setItem("perfilCriadoTimestamp", Date.now().toString());
        setTimeout(() => {
          router.push("/home");
        }, 1500);
      } else {
        // Se o perfil já foi criado (erro 409), redireciona para home
        if (resposta.status === 409 && data.perfilCriado) {
          setMensagem("ℹ️ Seu perfil já foi criado. Redirecionando...");
          // Invalidar cache de perfil para forçar nova verificação
          localStorage.setItem("perfilCriadoTimestamp", Date.now().toString());
          setTimeout(() => {
            router.push("/home");
          }, 1500);
        } else {
          // Mostrar mensagem de erro mais detalhada
          const mensagemErro = data.message || data.error || t("profile.error");
          console.error("Erro ao criar perfil:", mensagemErro);
          setMensagem(`❌ ${mensagemErro}`);
        }
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      setMensagem(`❌ ${t("profile.connectionError")}`);
    }
  };

  // Mostrar loading enquanto verifica o perfil
  if (verificando) {
    return (
      <PageWrapper title="Criar Perfil" description="Verificando se o perfil já foi criado">
        <div
          className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        >
          <ThemeToggle />
          <div className="bg-[var(--bg-card)] bg-opacity-90 p-8 rounded-2xl shadow-lg text-center border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <p className="text-[var(--text-primary)]" role="status" aria-live="polite">{t("profile.checking")}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="Criar Perfil" 
      description="Crie seu perfil escolhendo personagem, username e foto"
    >
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        <ThemeToggle />
        <div className="bg-[var(--bg-card)] bg-opacity-90 p-8 rounded-2xl shadow-lg w-full max-w-3xl text-center border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6" id="criar-perfil-title">
            🎮 {t("profile.create")}
          </h1>

        <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="criar-perfil-title">
          {/* Escolha de personagem */}
          <section aria-labelledby="escolha-personagem">
            <h2 id="escolha-personagem" className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
              {t("profile.chooseCharacter")}
            </h2>
            <div className="flex justify-center gap-8" role="radiogroup" aria-label="Seleção de personagem">
              {personagens.map((p) => (
                <button
                  key={p.nome}
                  type="button"
                  onClick={() => setPersonagem(p.nome)}
                  className={`cursor-pointer rounded-xl border-4 transition-transform transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${
                    personagem === p.nome
                      ? "border-blue-600"
                      : "border-transparent"
                  }`}
                  aria-pressed={personagem === p.nome}
                  aria-label={`Selecionar personagem ${p.nome}`}
                >
                  <Image
                    src={p.imagem}
                    alt={`${p.nome}`}
                    width={100}
                    height={100}
                    className="rounded-xl"
                  />
                  <p
                    className={`mt-2 font-medium ${
                      personagem === p.nome ? "text-blue-600" : "text-[var(--text-primary)]"
                    }`}
                  >
                    {p.nome}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Username */}
          <div>
            <label htmlFor="username-input" className="block text-left text-[var(--text-primary)] font-medium mb-1">
              {t("profile.username")}
            </label>
            <input
              id="username-input"
              type="text"
              placeholder={t("profile.usernamePlaceholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-[var(--border-color)] rounded-lg px-4 py-2 bg-[var(--bg-input)] text-[var(--text-primary)] focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              aria-required="true"
            />
          </div>

          {/* Escolha de foto */}
          <section aria-labelledby="escolha-foto">
            <label id="escolha-foto" className="block text-left text-[var(--text-primary)] font-medium mb-1">
              {t("profile.choosePhoto")}
            </label>
            <div className="flex gap-4 mb-2 justify-center" role="radiogroup" aria-label="Seleção de foto de perfil">
              {fotosPreDefinidas.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => handlePreDefinidaClick(url)}
                  className={`cursor-pointer rounded-full border-2 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${
                    fotoPerfil === url ? "border-blue-600" : "border-[var(--border-color)]"
                  }`}
                  aria-pressed={fotoPerfil === url}
                  aria-label={`Selecionar foto ${index + 1}`}
                >
                  <Image
                    src={url}
                    alt={`Foto pré-definida ${index + 1}`}
                    width={60}
                    height={60}
                    className="rounded-full"
                    unoptimized
                  />
                </button>
              ))}
            </div>

            {preview && (
              <div className="mt-4 flex justify-center" role="img" aria-label="Prévia da foto selecionada">
                <Image
                  src={preview}
                  alt="Prévia da foto de perfil selecionada"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-blue-400"
                  unoptimized
                />
              </div>
            )}
          </section>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            aria-label={t("profile.createButton")}
          >
            {t("profile.createButton")}
          </button>

          {mensagem && (
            <p 
              className={`text-center text-sm font-medium mt-3 ${
                mensagem.includes("✅") ? "text-green-600" : mensagem.includes("❌") ? "text-red-600" : "text-[var(--text-primary)]"
              }`}
              role={mensagem.includes("❌") ? "alert" : "status"}
              aria-live={mensagem.includes("❌") ? "assertive" : "polite"}
            >
              {mensagem}
            </p>
          )}
        </form>
      </div>
    </div>
    </PageWrapper>
  );
}
