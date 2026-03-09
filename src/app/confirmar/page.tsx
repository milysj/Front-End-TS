"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "react-bootstrap";

type Status = "loading" | "success" | "error";

export default function ConfirmarEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [mensagem, setMensagem] = useState("Verificando sua conta...");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMensagem("Link inválido. Não foi encontrado o token de verificação.");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${API_URL}/api/auth/confirmar?token=${token}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          setMensagem("E-mail verificado com sucesso! Redirecionando para o login...");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          setMensagem("Link inválido ou expirado.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMensagem("Erro ao conectar com o servidor.");
      });
  }, [token, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-color)] text-center">
        <div className="mb-6 flex justify-center">
          <Image width={300} height={100} src="/svg/EstudeMyLogo.svg" alt="Logo" />
        </div>

        {status === "loading" && (
          <>
            <div className="text-5xl mb-4 animate-pulse">⏳</div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Verificando seu e-mail...
            </h2>
            <p className="text-[var(--text-secondary)]">{mensagem}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
              E-mail verificado!
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">{mensagem}</p>
            <p className="text-sm text-[var(--text-muted)]">
              Redirecionando em instantes...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Erro na verificação
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">{mensagem}</p>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push("/reenviar-verificacao")}
              >
                Reenviar e-mail de verificação
              </Button>
              <Button
                variant="outline-secondary"
                className="w-full"
                onClick={() => router.push("/cadastro")}
              >
                Cadastrar novamente
              </Button>
              <Button
                variant="link"
                className="w-full text-[var(--text-secondary)]"
                onClick={() => router.push("/login")}
              >
                Ir para o Login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}