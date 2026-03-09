"use client";

import { Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EmailEnviado() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-color)] text-center">
        <div className="mb-6 flex justify-center">
          <Image width={300} height={100} src="/svg/EstudeMyLogo.svg" alt="Logo" />
        </div>
        
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
          Verifique seu e-mail!
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Quase pronto! Enviamos um link de confirmação para o seu e-mail. 
          Você precisa clicar nele para ativar sua conta antes de fazer o login.
        </p>

        <Button 
          variant="primary" 
          className="w-full" 
          onClick={() => router.push("/login")}
        >
          Ir para a tela de Login
        </Button>
      </div>
    </div>
  );
}