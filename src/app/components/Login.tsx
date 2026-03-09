"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "react-bootstrap";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme } from "next-themes";
import ThemeToggle from "@/app/components/ThemeToggle";

const Login = () => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarEsqueciSenha, setMostrarEsqueciSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [erroEmailNaoVerificado, setErroEmailNaoVerificado] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determinar a imagem de fundo baseada no tema
  const backgroundImage = resolvedTheme === "dark" 
    ? "/img/backgrounds/background_login_darkmode.jpg"
    : "/img/backgrounds/background_login_lightmode.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setErroEmailNaoVerificado(false);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }), // ⚠️ campos corretos
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || "Erro desconhecido";
        const emailNaoVerificado =
          data.emailNaoVerificado ||
          /verifiqu(e|ar)|confirm(e|ar)|não verificad|não confirmad/i.test(msg);
        if (emailNaoVerificado) {
          setErro(
            "Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada ou reenvie o link."
          );
          setErroEmailNaoVerificado(true);
          setSucesso("");
          return;
        }
        setErro(msg);
        return;
      }

      // Usa a função de login do AuthContext para atualizar o estado global
      await login(data.token);

      // Redireciona dependendo se o perfil já foi criado
      if (data.perfilCriado) {
        router.push("/home");
      } else {
        router.push("/criarPerfil");
      }

      setSucesso("Login realizado com sucesso!");
    } catch (error) {
      console.error(error);
      setErro("Erro ao conectar com o servidor.");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 h-screen flex-col relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
      }}
    >
      <ThemeToggle /> {/* Botão para alternar tema */}
      <div className="w-full max-w-md p-6 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="mb-6 text-center">
          <Image
            width={400}
            height={128}
            src="/svg/EstudeMyLogo.svg"
            alt="Logo do Estude.My - Plataforma de aprendizado gamificado"
          />
        </div>

        <form 
          className="flex flex-col gap-3" 
          onSubmit={handleSubmit}
          aria-label="Formulário de login"
          noValidate
        >
          <div className="flex flex-col">
            <label 
              htmlFor="email-login"
              className="text-sm text-left text-[var(--text-primary)]"
            >
              Email:
            </label>
            <input
              id="email-login"
              type="email"
              placeholder="Digite seu endereço de e-mail"
              className="rounded-lg py-2 px-3 text-sm border w-full bg-[var(--bg-input)] text-[var(--text-primary)] border-[var(--border-color)] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-required="true"
              aria-invalid={erro ? "true" : "false"}
              aria-describedby={erro ? "email-error" : undefined}
            />
          </div>

          <div className="flex flex-col">
            <label 
              htmlFor="senha-login"
              className="text-sm mb-1 text-left text-[var(--text-primary)]"
            >
              Senha:
            </label>
            <div className="relative">
              <input
                id="senha-login"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                className="w-full rounded-lg py-2 px-4 pr-10 text-sm border bg-[var(--bg-input)] text-[var(--text-primary)] border-[var(--border-color)] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                aria-required="true"
                aria-invalid={erro ? "true" : "false"}
                aria-describedby={`senha-toggle ${erro ? "senha-error" : ""}`}
              />
              <button
                type="button"
                id="senha-toggle"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={mostrarSenha}
              >
                {mostrarSenha ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.964 9.964 0 012.41-4.042M6.112 6.112A9.967 9.967 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zM3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {erro && (
            <div className="space-y-2" role="alert" aria-live="assertive">
              <p id="email-error senha-error" className="text-red-600 text-sm">
                {erro}
              </p>
              {erroEmailNaoVerificado && (
                <p className="text-sm">
                  <a
                    href="/reenviar-verificacao"
                    className="hover:underline font-medium"
                    style={{ color: "var(--ring, #3b82f6)" }}
                  >
                    Reenviar e-mail de verificação
                  </a>
                </p>
              )}
            </div>
          )}
          <Button 
            type="submit" 
            variant="primary"
            aria-label="Fazer login"
            className="text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Login
          </Button>

          <p className="text-center text-sm mt-2">
            <button
              type="button"
              onClick={() => setMostrarEsqueciSenha(true)}
              className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              aria-label="Esqueci minha senha"
              style={{ color: 'blue' }}
            >
              Esqueci minha senha
            </button>
          </p>

          {sucesso && (
            <p 
              className="text-green-600 text-sm text-center" 
              role="status"
              aria-live="polite"
            >
              {sucesso}
            </p>
          )}
        </form>

        {mostrarEsqueciSenha && (
          <div className="mt-4 p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-input)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
            <h3 className="font-semibold mb-3 text-[var(--text-primary)]">Recuperar Senha</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Digite seu email e você receberá um link para redefinir sua senha
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={emailRecuperacao}
                onChange={(e) => setEmailRecuperacao(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!emailRecuperacao) {
                      setErro("Por favor, digite seu email");
                      return;
                    }

                    setSalvando(true);
                    setErro("");
                    setSucesso("");

                    try {
                      const API_URL =
                        process.env.NEXT_PUBLIC_API_URL ||
                        "http://localhost:5000";
                      const res = await fetch(
                        `${API_URL}/api/users/solicitar-recuperacao`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            email: emailRecuperacao,
                          }),
                        }
                      );

                      const data = await res.json();

                      if (!res.ok) {
                        setErro(
                          data.message || "Erro ao solicitar recuperação"
                        );
                        return;
                      }

                      setSucesso(
                        "Se o email existir em nosso sistema, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada!"
                      );
                      setMostrarEsqueciSenha(false);
                      setEmailRecuperacao("");
                    } catch (error) {
                      console.error(error);
                      setErro("Erro ao conectar com o servidor.");
                    } finally {
                      setSalvando(false);
                    }
                  }}
                  disabled={salvando}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1 disabled:bg-gray-400"
                >
                  {salvando ? "Enviando..." : "Enviar Link"}
                </button>
                <button
                  onClick={() => {
                    setMostrarEsqueciSenha(false);
                    setEmailRecuperacao("");
                    setErro("");
                    setSucesso("");
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[var(--border-color)] text-center"></div>
        <p className="text-center text-sm text-[var(--text-primary)]">
          Não possui conta?
          <a
            href="/cadastro"
            className="hover:underline ml-1.5"
            style={{ color: 'blue' }}
          >
            Cadastrar-se
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
