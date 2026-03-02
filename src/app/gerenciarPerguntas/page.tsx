"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";
import Topo from "@/app/components/Topo";
import Footer from "@/app/components/Footer";

interface Pergunta {
  _id?: string;
  enunciado: string;
  alternativaA: string;
  alternativaB: string;
  alternativaC: string;
  correta: string;
}

export default function GerenciarPerguntas() {
  const { faseId } = useParams();
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [nova, setNova] = useState<Pergunta>({
    enunciado: "",
    alternativaA: "",
    alternativaB: "",
    alternativaC: "",
    correta: "",
  });
  useKeyboardNavigation();

  useEffect(() => {
    const carregar = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/perguntas/fase/${faseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPerguntas(data);
    };
    carregar();
  }, [faseId]);

  const criarPergunta = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/perguntas`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...nova, fase: faseId }),
    });
    const data = await res.json();
    setPerguntas([...perguntas, data]);
    setNova({ enunciado: "", alternativaA: "", alternativaB: "", alternativaC: "", correta: "" });
  };

  return (
    <PageWrapper 
      title="Gerenciar Perguntas" 
      description="Crie e gerencie perguntas para as fases das trilhas"
    >
      <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundColor: "var(--bg-page)" }}>
        <Topo />
        <main className="max-w-3xl mx-auto p-6" aria-labelledby="gerenciar-perguntas-title">
          <h1 id="gerenciar-perguntas-title" className="text-2xl font-bold mb-6 text-blue-600">
            Gerenciar Perguntas
          </h1>

          {/* Criar pergunta */}
          <section aria-labelledby="criar-pergunta-title" className="mb-6">
            <h2 id="criar-pergunta-title" className="sr-only">Criar Nova Pergunta</h2>
            <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); criarPergunta(); }} aria-label="Formulário para criar nova pergunta">
              <label htmlFor="enunciado-input" className="sr-only">Enunciado da pergunta</label>
              <input
                id="enunciado-input"
                type="text"
                placeholder="Enunciado"
                value={nova.enunciado}
                onChange={(e) => setNova({ ...nova, enunciado: e.target.value })}
                className="border rounded p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                aria-required="true"
              />
              {["A", "B", "C"].map((alt) => (
                <div key={alt}>
                  <label htmlFor={`alternativa-${alt}`} className="sr-only">
                    Alternativa {alt}
                  </label>
                  <input
                    id={`alternativa-${alt}`}
                    type="text"
                    placeholder={`Alternativa ${alt}`}
                    value={nova[`alternativa${alt}` as keyof Pergunta] as string}
                    onChange={(e) =>
                      setNova({ ...nova, [`alternativa${alt}`]: e.target.value } as Pergunta)
                    }
                    className="border rounded p-2 w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                    aria-required="true"
                  />
                </div>
              ))}
              <label htmlFor="correta-input" className="sr-only">Resposta correta</label>
              <input
                id="correta-input"
                type="text"
                placeholder="Correta (A, B ou C)"
                value={nova.correta}
                onChange={(e) => setNova({ ...nova, correta: e.target.value.toUpperCase() })}
                className="border rounded p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                aria-required="true"
                aria-label="Resposta correta (A, B ou C)"
              />
              <Button 
                type="submit"
                className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                aria-label="Salvar pergunta"
              >
                Salvar Pergunta
              </Button>
            </form>
          </section>

          {/* Lista */}
          <section aria-labelledby="lista-perguntas-title">
            <h2 id="lista-perguntas-title" className="sr-only">Lista de Perguntas</h2>
            {perguntas.length === 0 ? (
              <p className="text-center text-gray-500 py-8" role="status" aria-live="polite">
                Nenhuma pergunta criada ainda.
              </p>
            ) : (
              <ul className="space-y-3" role="list">
                {perguntas.map((p) => (
                  <li key={p._id} className="border rounded-xl p-4 bg-white shadow" role="listitem">
                    <h3 className="font-bold">{p.enunciado}</h3>
                    <ul className="text-sm mt-2 list-disc list-inside" aria-label="Alternativas">
                      <li>A) {p.alternativaA}</li>
                      <li>B) {p.alternativaB}</li>
                      <li>C) {p.alternativaC}</li>
                    </ul>
                    <p className="text-green-600 mt-2" aria-label={`Resposta correta: ${p.correta}`}>
                      ✅ Resposta correta: {p.correta}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </PageWrapper>
  );
}
