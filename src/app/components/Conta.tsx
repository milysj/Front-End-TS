"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AccessibleInput } from "@/app/components/accessibility/AccessibleInput";
import { AccessibleButton } from "@/app/components/accessibility/AccessibleButton";
import { useScreenReaderAnnouncement } from "@/app/hooks/useAccessibility";
import { useLanguage } from "@/app/contexts/LanguageContext";

interface UserData {
  nome: string;
  email: string;
  username?: string;
  tipoUsuario: string;
  dataNascimento: string;
}

// ===============================
// Componente: MinhaConta
// ===============================
export default function MinhaConta() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarAlterarSenha, setMostrarAlterarSenha] = useState(false);
  const [mostrarExcluirConta, setMostrarExcluirConta] = useState(false);
  const [mostrarAlterarUsername, setMostrarAlterarUsername] = useState(false);
  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [senhaExcluir, setSenhaExcluir] = useState("");
  const [novoUsername, setNovoUsername] = useState("");
  const [usernameErro, setUsernameErro] = useState("");
  const [verificandoUsername, setVerificandoUsername] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();
  const { announce } = useScreenReaderAnnouncement();
  const { t } = useLanguage();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          setNovoUsername(data.username || "");
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
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

  // Verificar username em tempo real quando mostrarAlterarUsername estiver ativo
  useEffect(() => {
    if (!mostrarAlterarUsername || !novoUsername.trim()) {
      setUsernameErro("");
      return;
    }

    // Se o username não mudou, não precisa verificar
    if (userData && novoUsername.trim() === userData.username) {
      setUsernameErro("");
      return;
    }

    // Limpar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Criar novo timeout para debounce
    debounceTimeoutRef.current = setTimeout(() => {
      verificarUsername(novoUsername.trim());
    }, 800);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novoUsername, mostrarAlterarUsername]);

  const handleSair = () => {
    // Remover todos os dados do localStorage relacionados à autenticação
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    // Redirecionar para login
    router.push("/login");
    // Forçar reload para limpar completamente o estado
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  };

  const handleAlterarSenha = async () => {
    if (!senhaForm.senhaAtual || !senhaForm.novaSenha) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }

    if (senhaForm.novaSenha.length < 8) {
      alert("A nova senha deve ter no mínimo 8 caracteres");
      return;
    }

    setSalvando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/mudar-senha`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senhaAtual: senhaForm.senhaAtual,
          novaSenha: senhaForm.novaSenha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erro ao alterar senha");
        return;
      }

      alert("Senha alterada com sucesso!");
      setMostrarAlterarSenha(false);
      setSenhaForm({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert("Erro ao alterar senha");
    } finally {
      setSalvando(false);
    }
  };

  // Verificar se o username já existe
  const verificarUsername = async (username: string): Promise<boolean> => {
    if (!username || username.trim() === "") {
      return false;
    }

    // Se o username não mudou, não precisa verificar
    if (userData && username === userData.username) {
      return true;
    }

    setVerificandoUsername(true);
    setUsernameErro("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return false;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      // Verificar se o username já existe
      // Tentar buscar usuários e verificar se algum tem esse username
      const res = await fetch(`${API_URL}/api/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const usuarios = await res.json();
        const usernameExiste = Array.isArray(usuarios) && usuarios.some(
          (u: any) => u.username && u.username.toLowerCase() === username.toLowerCase().trim()
        );
        
        if (usernameExiste) {
          setUsernameErro("Este username já está em uso. Escolha outro.");
          announce("Este username já está em uso. Escolha outro.", "assertive");
          return false;
        }
      }

      // Validações básicas
      if (username.trim().length < 3) {
        setUsernameErro("O username deve ter no mínimo 3 caracteres.");
        announce("O username deve ter no mínimo 3 caracteres.", "assertive");
        return false;
      }

      if (username.trim().length > 20) {
        setUsernameErro("O username deve ter no máximo 20 caracteres.");
        announce("O username deve ter no máximo 20 caracteres.", "assertive");
        return false;
      }

      // Validar caracteres permitidos (letras, números, underscore, hífen)
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username.trim())) {
        setUsernameErro("O username pode conter apenas letras, números, underscore (_) e hífen (-).");
        announce("O username pode conter apenas letras, números, underscore e hífen.", "assertive");
        return false;
      }

      setUsernameErro("");
      return true;
    } catch (error) {
      console.error("Erro ao verificar username:", error);
      // Em caso de erro, permitir tentar salvar (o backend vai validar)
      return true;
    } finally {
      setVerificandoUsername(false);
    }
  };

  const handleAlterarUsername = async () => {
    if (!novoUsername || novoUsername.trim() === "") {
      setUsernameErro("Por favor, digite um username.");
      announce("Por favor, digite um username.", "assertive");
      return;
    }

    // Se o username não mudou, não precisa atualizar
    if (userData && novoUsername.trim() === userData.username) {
      setMostrarAlterarUsername(false);
      announce("O username não foi alterado.", "polite");
      return;
    }

    // Verificar se o username é válido e não está em uso
    const usernameValido = await verificarUsername(novoUsername.trim());
    if (!usernameValido) {
      return;
    }

    setSalvando(true);
    setUsernameErro("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      // Tentar atualizar via endpoint específico ou genérico
      let res = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: novoUsername.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Erro ao alterar username";
        setUsernameErro(errorMessage);
        announce(errorMessage, "assertive");
        return;
      }

      const data = await res.json();
      
      // Atualizar dados locais
      if (userData) {
        setUserData({ ...userData, username: novoUsername.trim() });
      }

      announce("Username alterado com sucesso!", "polite");
      setMostrarAlterarUsername(false);
    } catch (error) {
      console.error("Erro ao alterar username:", error);
      const errorMessage = "Erro ao alterar username. Tente novamente.";
      setUsernameErro(errorMessage);
      announce(errorMessage, "assertive");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirConta = async () => {
    if (!senhaExcluir) {
      alert("Por favor, digite sua senha para confirmar a exclusão");
      return;
    }

    if (
      !confirm(
        "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita!"
      )
    ) {
      return;
    }

    setSalvando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senha: senhaExcluir,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erro ao excluir conta");
        return;
      }

      alert("Conta excluída com sucesso!");
      localStorage.removeItem("token");
      router.push("/login");
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      alert("Erro ao excluir conta");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 m-auto">
        <div className="bg-[var(--bg-card)] p-6 rounded shadow-md w-full max-w-md mx-auto border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-center text-[var(--text-secondary)]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center p-4 m-auto">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto">
          <p className="text-center text-red-600">Erro ao carregar dados</p>
        </div>
      </div>
    );
  }

  const formatarData = (data: string) => {
    if (!data) return "Não informado";
    try {
      const date = new Date(data);
      return date.toLocaleDateString("pt-BR");
    } catch {
      return data;
    }
  };

  return (
    <div className="flex items-center justify-center p-4 m-auto">
      {/* ===============================
          Card principal da conta
          =============================== */}
      <div className="bg-[var(--bg-card)] p-6 rounded shadow-md w-full max-w-md mx-auto border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        {/* ===============================
            Cabeçalho com título e botão Sair
            =============================== */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Minha Conta</h2>
          <button
            onClick={handleSair}
            className="bg-red-500 text-white px-4 py-1 mt-2 rounded hover:bg-red-600"
          >
            Sair
          </button>
        </div>

        {/* ===============================
            Informações Pessoais
            =============================== */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg border-b pb-1 mb-2">
            Informações da Conta
          </h3>
          <div className="flex justify-between mb-1">
            <span className="font-medium text-[var(--text-primary)]">Nome:</span>
            <span className="text-[var(--text-secondary)]">{userData.nome}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium text-[var(--text-primary)]">E-mail:</span>
            <span className="text-[var(--text-secondary)]">{userData.email}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium text-[var(--text-primary)]">Username:</span>
            <span className="text-[var(--text-secondary)] font-mono">
              {userData.username ? `@${userData.username}` : "Não definido"}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium text-[var(--text-primary)]">Tipo:</span>
            <span className="text-[var(--text-secondary)]">{userData.tipoUsuario}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="font-medium text-[var(--text-primary)]">Data de Nascimento:</span>
            <span className="text-[var(--text-secondary)]">{formatarData(userData.dataNascimento)}</span>
          </div>

          {/* Botões de ação */}
        </div>

        {/* ===============================
            Configurações
            =============================== */}
        <div>
          <h3 className="font-semibold text-lg border-b pb-1 mb-2">
            Configurações
          </h3>
          <button
            onClick={() => router.push("/dadosPessoais")}
            className="bg-blue-600 text-white w-full py-2 rounded mb-2 hover:bg-blue-700"
          >
            Editar Dados Pessoais
          </button>

          {!mostrarAlterarSenha && !mostrarExcluirConta && !mostrarAlterarUsername && (
            <>
              <button
                onClick={() => {
                  setMostrarAlterarUsername(true);
                  setNovoUsername(userData?.username || "");
                  setUsernameErro("");
                }}
                className="bg-purple-500 text-white w-full py-2 rounded mb-2 hover:bg-purple-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                aria-label="Alterar username"
              >
                Alterar Username
              </button>
              <button
                onClick={() => setMostrarAlterarSenha(true)}
                className="bg-sky-400 text-white w-full py-2 rounded mb-2 hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                aria-label="Alterar senha"
              >
                Alterar Senha
              </button>
              <button
                onClick={() => setMostrarExcluirConta(true)}
                className="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                aria-label="Excluir conta"
              >
                Excluir Conta
              </button>
            </>
          )}

          {mostrarAlterarUsername && (
            <div className="mb-4 p-4 border rounded border-[var(--border-color)] bg-[var(--bg-input)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
              <h4 className="font-semibold mb-3 text-[var(--text-primary)]" id="alterar-username-title">
                Alterar Username
              </h4>
              <div className="space-y-3" aria-labelledby="alterar-username-title">
                <AccessibleInput
                  label="Novo Username"
                  type="text"
                  placeholder="Digite o novo username"
                  value={novoUsername}
                  onChange={(e) => {
                    setNovoUsername(e.target.value);
                    // O useEffect vai fazer a verificação com debounce
                  }}
                  error={usernameErro}
                  helperText="Mínimo 3 caracteres, máximo 20. Apenas letras, números, underscore (_) e hífen (-)."
                  required
                  id="novo-username-input"
                  aria-describedby="username-help"
                />
                
                {verificandoUsername && (
                  <p className="text-sm text-[var(--text-secondary)]" role="status" aria-live="polite">
                    Verificando disponibilidade...
                  </p>
                )}

                <div className="flex gap-2">
                  <AccessibleButton
                    onClick={handleAlterarUsername}
                    disabled={salvando || verificandoUsername || !!usernameErro || !novoUsername.trim()}
                    variant="primary"
                    className="flex-1"
                    aria-label="Salvar novo username"
                  >
                    {salvando ? "Salvando..." : "Salvar"}
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={() => {
                      setMostrarAlterarUsername(false);
                      setNovoUsername(userData?.username || "");
                      setUsernameErro("");
                    }}
                    variant="secondary"
                    aria-label="Cancelar alteração de username"
                  >
                    Cancelar
                  </AccessibleButton>
                </div>
              </div>
            </div>
          )}

          {mostrarAlterarSenha && (
            <div className="mb-4 p-4 border rounded">
              <h4 className="font-semibold mb-3">Alterar Senha</h4>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Senha atual"
                  value={senhaForm.senhaAtual}
                  onChange={(e) =>
                    setSenhaForm({ ...senhaForm, senhaAtual: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Nova senha (mínimo 8 caracteres)"
                  value={senhaForm.novaSenha}
                  onChange={(e) =>
                    setSenhaForm({ ...senhaForm, novaSenha: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={8}
                />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={senhaForm.confirmarSenha}
                  onChange={(e) =>
                    setSenhaForm({
                      ...senhaForm,
                      confirmarSenha: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAlterarSenha}
                    disabled={salvando}
                    className="bg-sky-400 text-white px-4 py-2 rounded hover:bg-sky-500 flex-1 disabled:bg-gray-400"
                  >
                    {salvando ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    onClick={() => {
                      setMostrarAlterarSenha(false);
                      setSenhaForm({
                        senhaAtual: "",
                        novaSenha: "",
                        confirmarSenha: "",
                      });
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {mostrarExcluirConta && (
            <div className="mb-4 p-4 border rounded border-red-300 bg-red-50">
              <h4 className="font-semibold mb-3 text-red-800">Excluir Conta</h4>
              <p className="text-sm text-red-700 mb-3">
                Esta ação não pode ser desfeita. Todos os seus dados serão
                permanentemente excluídos.
              </p>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Digite sua senha para confirmar"
                  value={senhaExcluir}
                  onChange={(e) => setSenhaExcluir(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleExcluirConta}
                    disabled={salvando}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex-1 disabled:bg-gray-400"
                  >
                    {salvando ? "Excluindo..." : "Confirmar Exclusão"}
                  </button>
                  <button
                    onClick={() => {
                      setMostrarExcluirConta(false);
                      setSenhaExcluir("");
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
