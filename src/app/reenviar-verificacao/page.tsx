"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "react-bootstrap";

export default function ReenviarVerificacao() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!email.trim()) {
      setErro("Digite seu e-mail.");
      return;
    }

    setEnviando(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/auth/reenviar-verificacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem(
          "Se este e-mail estiver cadastrado e ainda não verificado, você receberá um novo link. Verifique sua caixa de entrada e spam."
        );
        setEmail("");
      } else {
        setErro(data.message || "Não foi possível reenviar o e-mail.");
      }
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-color)]">
        <div className="mb-6 flex justify-center">
          <Image width={300} height={100} src="/svg/EstudeMyLogo.svg" alt="Logo" />
        </div>

        <div className="text-5xl mb-4 text-center">📧</div>
        <h2 className="text-2xl font-bold mb-2 text-center text-[var(--text-primary)]">
          Reenviar verificação de e-mail
        </h2>
        <p className="text-[var(--text-secondary)] text-sm text-center mb-6">
          Informe o e-mail da sua conta para receber um novo link de confirmação.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-left text-[var(--text-primary)]">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={enviando}
            />
          </div>

          {erro && (
            <p className="text-red-600 dark:text-red-400 text-sm text-center" role="alert">
              {erro}
            </p>
          )}
          {mensagem && (
            <p className="text-green-600 dark:text-green-400 text-sm text-center" role="status">
              {mensagem}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={enviando}>
            {enviando ? "Enviando..." : "Reenviar link"}
          </Button>
        </form>

        <p className="text-center text-sm mt-6 text-[var(--text-secondary)]">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="hover:underline"
            style={{ color: "var(--ring, #3b82f6)" }}
          >
            Voltar ao login
          </button>
        </p>
      </div>
    </div>
  );
}
