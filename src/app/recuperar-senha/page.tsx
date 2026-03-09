"use client";

import { useEffect, useState, useLayoutEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "react-bootstrap";
import { useBackgroundImage } from "@/app/hooks/useBackgroundImage";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

function RecuperarSenhaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const backgroundImage = useBackgroundImage("login");
  useKeyboardNavigation();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [tokenValido, setTokenValido] = useState<boolean | null>(null);
  const [verificando, setVerificando] = useState(true);

  useLayoutEffect(() => {
    document.title = "Recuperar Senha - Estude.My";
  }, []);

  useEffect(() => {
    const verificarToken = async () => {
      if (!token) {
        setTokenValido(false);
        setVerificando(false);
        return;
      }

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(
          `${API_URL}/api/users/verificar-token/${token}`
        );

        if (res.ok) {
          const data = await res.json();
          setTokenValido(data.valid);
        } else {
          setTokenValido(false);
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        setTokenValido(false);
      } finally {
        setVerificando(false);
      }
    };

    verificarToken();
  }, [token]);

  const handleRedefinir = async () => {
    if (!token) {
      setErro("Token inválido");
      return;
    }

    if (!novaSenha || !confirmarSenha) {
      setErro("Por favor, preencha todos os campos");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (novaSenha.length < 8) {
      setErro("A nova senha deve ter no mínimo 8 caracteres");
      return;
    }

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          novaSenha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.message || "Erro ao redefinir senha");
        return;
      }

      setSucesso("Senha redefinida com sucesso! Redirecionando para login...");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error(error);
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setSalvando(false);
    }
  };

  if (verificando) {
    return (
      <PageWrapper title="Recuperar Senha" description="Verificando token de recuperação">
        <div
          className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-page)]"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        >
          <div className="w-full max-w-md p-6 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-color)] text-center">
            <p className="text-[var(--text-secondary)]" role="status" aria-live="polite">
              Verificando token...
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!tokenValido) {
    return (
      <PageWrapper title="Recuperar Senha" description="Token inválido ou expirado">
        <div
          className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-page)]"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        >
          <div className="w-full max-w-md p-6 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-color)]">
            <div className="mb-6 text-center">
              <Image
                width={400}
                height={128}
                src="/svg/EstudeMyLogo.svg"
                alt="Logo do Estude.My"
              />
            </div>
            <div className="text-center">
              <p className="text-red-600 mb-4" role="alert" aria-live="assertive">
                Token inválido ou expirado. Solicite uma nova recuperação de
                senha.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push("/login")}
                aria-label="Voltar para página de login"
                className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              >
                Voltar para Login
              </Button>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="Recuperar Senha" 
      description="Redefina sua senha usando o token de recuperação"
    >
      <div
        className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-page)]"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        <div className="w-full max-w-md p-6 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-color)]">
          <div className="mb-6 text-center">
            <Image
              width={400}
              height={128}
              src="/svg/EstudeMyLogo.svg"
              alt="Logo do Estude.My"
            />
          </div>

          <h2 className="text-2xl font-bold text-center mb-4">Redefinir Senha</h2>

          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleRedefinir(); }} aria-label="Formulário de redefinição de senha">
            <div className="flex flex-col">
              <label htmlFor="nova-senha" className="text-sm text-left mb-1 text-[var(--text-primary)]">
                Nova senha:
              </label>
              <input
                id="nova-senha"
                type="password"
                placeholder="Digite sua nova senha (mínimo 8 caracteres)"
                className="rounded-lg py-2 px-3 text-sm border w-full bg-[var(--bg-input)] text-[var(--text-primary)] border-[var(--border-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] transition-colors duration-300"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                minLength={8}
                aria-required="true"
                aria-invalid={erro ? "true" : "false"}
                aria-describedby={erro ? "senha-error" : undefined}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="confirmar-senha" className="text-sm text-left mb-1 text-[var(--text-primary)]">
                Confirmar nova senha:
              </label>
              <input
                id="confirmar-senha"
                type="password"
                placeholder="Confirme sua nova senha"
                className="rounded-lg py-2 px-3 text-sm border w-full bg-[var(--bg-input)] text-[var(--text-primary)] border-[var(--border-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] transition-colors duration-300"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                aria-required="true"
                aria-invalid={erro ? "true" : "false"}
                aria-describedby={erro ? "senha-error" : undefined}
              />
            </div>

            {erro && (
              <p id="senha-error" className="text-red-600 dark:text-red-400 text-sm" role="alert" aria-live="assertive">
                {erro}
              </p>
            )}
            {sucesso && (
              <p className="text-green-600 dark:text-green-400 text-sm" role="status" aria-live="polite">
                {sucesso}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={salvando}
              className="w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              aria-busy={salvando}
            >
              {salvando ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
          <div className="text-center">
            <p className="text-[var(--text-secondary)]">Carregando...</p>
          </div>
        </div>
      }
    >
      <RecuperarSenhaContent />
    </Suspense>
  );
}
