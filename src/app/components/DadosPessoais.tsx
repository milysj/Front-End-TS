"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  nome: string;
  email: string;
  dataNascimento: string;
  telefone: string;
  endereco: string;
}

export default function DadosPessoais() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    nome: "",
    email: "",
    dataNascimento: "",
    telefone: "",
    endereco: "",
  });
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const buscarDados = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !isMounted) {
          if (!token) router.push("/login");
          return;
        }

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        });

        if (!isMounted) return;

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Erro ao buscar dados");
        }

        const data = await res.json();
        
        if (isMounted) {
          setUserData(data);
          setFormData({
            nome: data.nome || "",
            email: data.email || "",
            dataNascimento: data.dataNascimento
              ? new Date(data.dataNascimento).toISOString().split("T")[0]
              : "",
            telefone: data.telefone || "",
            endereco: data.endereco || "",
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        if (!isMounted) return;
        console.error("Erro ao buscar dados:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    buscarDados();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [router]);

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/dados-pessoais`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: formData.nome,
          telefone: formData.telefone,
          endereco: formData.endereco,
          dataNascimento: formData.dataNascimento || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Erro ao salvar dados");
        return;
      }

      const data = await res.json();
      setUserData(data.usuario);
      setEditing(false);
      alert("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar dados");
    } finally {
      setSalvando(false);
    }
  };

  const formatarData = (data: string) => {
    if (!data) return "Não informado";
    try {
      const date = new Date(data);
      return date.toLocaleDateString("pt-BR");
    } catch {
      return data;
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] shadow-md rounded-xl p-6 w-full max-w-md mx-auto border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <p className="text-center text-[var(--text-secondary)]">Carregando...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md mx-auto">
        <p className="text-center text-red-600">Erro ao carregar dados</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] shadow-md rounded-xl p-4 sm:p-6 w-full max-w-md mx-auto overflow-hidden border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mb-4 text-center sm:text-left">
        Dados Pessoais
      </h2>

      {!editing ? (
        <>
          <div className="space-y-3 text-[var(--text-primary)]">
            <div className="break-words">
              <p className="font-semibold">Nome completo</p>
              <p className="break-words">{userData.nome || "Não informado"}</p>
            </div>
            <div className="break-words">
              <p className="font-semibold">Email</p>
              <p className="break-words">{userData.email}</p>
            </div>
            <div className="break-words">
              <p className="font-semibold">Data de nascimento</p>
              <p>{formatarData(userData.dataNascimento)}</p>
            </div>
            <div className="break-words">
              <p className="font-semibold">Telefone</p>
              <p>{userData.telefone || "Não informado"}</p>
            </div>
            <div className="break-words">
              <p className="font-semibold">Endereço</p>
              <p className="break-words">
                {userData.endereco || "Não informado"}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 w-full">
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex-1 text-sm sm:text-base whitespace-nowrap"
            >
              {!userData.telefone && !userData.endereco
                ? "Adicionar Dados"
                : "Editar"}
            </button>
            {!userData.telefone && !userData.endereco && (
              <button
                onClick={() => router.push("/perfil")}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition flex-1 sm:flex-none text-sm sm:text-base whitespace-nowrap"
              >
                Continuar sem adicionar
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1">Nome completo</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded bg-[var(--bg-input)] text-[var(--text-secondary)] transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Email não pode ser alterado
              </p>
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Data de nascimento
              </label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) =>
                  setFormData({ ...formData, dataNascimento: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Telefone</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
                placeholder="(11) 91234-5678"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Endereço</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) =>
                  setFormData({ ...formData, endereco: e.target.value })
                }
                placeholder="Rua, número, cidade, estado"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 w-full">
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex-1 disabled:bg-gray-400 text-sm sm:text-base"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  nome: userData.nome || "",
                  email: userData.email || "",
                  dataNascimento: userData.dataNascimento
                    ? new Date(userData.dataNascimento)
                        .toISOString()
                        .split("T")[0]
                    : "",
                  telefone: userData.telefone || "",
                  endereco: userData.endereco || "",
                });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition flex-1 sm:flex-none text-sm sm:text-base"
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
