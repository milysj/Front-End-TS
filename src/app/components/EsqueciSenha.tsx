"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation"; // Hook do Next.js para navegação programática
import Logo from "./Logo"; // Componente do logo
import {Button} from "react-bootstrap";

const Esquecisenha = () => {
    const router = useRouter(); // Inicializa o roteador
    const [email, setEmail] = useState(""); // Armazena o email digitado
    const [erro, setErro] = useState(""); // Mensagem de erro
    const [sucesso, setSucesso] = useState(false); // Flag de sucesso

    // Função executada ao enviar o formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Evita recarregar a página
        setErro(""); // Reseta erros
        setSucesso(false); // Reseta sucesso

        try {
            // Faz a requisição para a API de recuperação de senha
            const res = await fetch("/api/senha", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });

            const data = await res.json();

            if (res.ok && data.sucesso) {
                setSucesso(true); // Mostra mensagem de sucesso
            } else {
                setErro(data.mensagem || "Erro ao enviar email"); // Mostra erro retornado
            }
        } catch (error) {
            setErro("Erro ao conectar com o servidor.");
            console.error(error); // Log para depuração
        }
    };

    return (
        // Container principal centralizado com background
        <div
            className="min-h-screen flex items-center justify-center bg-gray-50 px-4 h-screen flex-col relative overflow-hidden bg-cover bg-center"
            style={{
                backgroundImage: `url('/img/background-image-login-register.png')`,
            }}
        >
            {/* Card branco centralizado */}
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <Logo/> {/* Logo no topo do formulário */}

                {/* Formulário de envio de email */}
                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label className="text-sm text-left">Email:</label>
                        <input
                            type="email"
                            placeholder="Digite seu endereço de email."
                            className="rounded-lg py-2 px-3 text-sm border border-gray-300 w-full"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} // Atualiza o estado ao digitar
                        />
                    </div>

                    {/* Mensagem de erro ou sucesso */}
                    {erro && <p className="text-red-600 text-sm">{erro}</p>}
                    {sucesso && (
                        <p className="text-green-600 text-sm">
                            Email enviado com sucesso! Verifique sua caixa de entrada.
                        </p>
                    )}

                    {/* Botões de ação */}
                    <div className="flex flex-col gap-2">
                        {/* Botão de enviar email */}
                        <Button
                            variant="primary"
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Enviar Email
                        </Button>

                        {/* Botão de voltar para login */}
                        <Button
                            variant="secondary"
                            onClick={() => router.push("/login")}
                            className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                        >
                            Voltar para Login
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Esquecisenha;

