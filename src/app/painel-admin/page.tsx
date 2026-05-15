"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { Lock, Unlock, Ban, Trash2, CheckCircle } from "lucide-react";

interface UserData {
  _id: string;
  nome: string;
  email: string;
  username: string;
  tipoUsuario: "ALUNO" | "PROFESSOR" | "ADMINISTRADOR" | "OWNER";
  status: "ATIVO" | "BLOQUEADO" | "BANIDO";
  bloqueadoAte?: string | null;
  canPromoteToAdmin?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PainelAdmin() {
  const { user, token } = useAuth();
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("TODOS");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  // Estado para o modal de bloqueio
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState<UserData | null>(null);
  const [blockDate, setBlockDate] = useState("");

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      } else {
        setError("Erro ao carregar usuários.");
      }
    } catch (err) {
      setError("Erro de conexão ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const canModify = (target: UserData) => {
    if (user?.id === target._id || user?._id === target._id) return false;
    if (user?.tipoUsuario === "OWNER") return true;
    if (user?.tipoUsuario === "ADMINISTRADOR") {
      if (target.tipoUsuario === "OWNER" || target.tipoUsuario === "ADMINISTRADOR") {
        return false;
      }
      return true;
    }
    return false;
  };

  const handleChangeTipo = async (id: string, novoTipo: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/usuarios/${id}/tipo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipoUsuario: novoTipo }),
      });
      if (res.ok) {
        showSuccess("Tipo de usuário atualizado.");
        fetchUsuarios();
      } else {
        const errData = await res.json();
        alert(`Erro: ${errData.message}`);
      }
    } catch (err) {
      alert("Erro ao alterar tipo de usuário.");
    }
  };

  const handleTogglePermission = async (id: string, canPromote: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/usuarios/${id}/permissoes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ canPromoteToAdmin: canPromote }),
      });
      if (res.ok) {
        showSuccess("Permissões atualizadas com sucesso.");
        fetchUsuarios();
      } else {
        const errData = await res.json();
        alert(`Erro: ${errData.message}`);
      }
    } catch (err) {
      alert("Erro ao atualizar permissões.");
    }
  };

  const handleStatusChange = async (id: string, novoStatus: string, bloqueadoAte: string | null = null) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/usuarios/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus, bloqueadoAte }),
      });
      if (res.ok) {
        showSuccess(`Status alterado para ${novoStatus}.`);
        fetchUsuarios();
        setShowBlockModal(false);
      } else {
        const errData = await res.json();
        alert(`Erro: ${errData.message}`);
      }
    } catch (err) {
      alert("Erro ao alterar status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("ATENÇÃO: Deseja realmente excluir esta conta permanentemente?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showSuccess("Usuário excluído com sucesso.");
        fetchUsuarios();
      } else {
        const errData = await res.json();
        alert(`Erro: ${errData.message}`);
      }
    } catch (err) {
      alert("Erro ao excluir usuário.");
    }
  };

  const openBlockModal = (u: UserData) => {
    setUserToBlock(u);
    setBlockDate("");
    setShowBlockModal(true);
  };

  const confirmBlock = () => {
    if (userToBlock) {
      handleStatusChange(userToBlock._id, "BLOQUEADO", blockDate || null);
    }
  };

  if (loading) return <div className="p-8 text-center text-xl text-[var(--text-primary)]">Carregando painel...</div>;

  const filteredUsuarios = usuarios.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (u.nome?.toLowerCase() || "").includes(term) ||
      (u.email?.toLowerCase() || "").includes(term) ||
      (u.username?.toLowerCase() || "").includes(term);

    const matchesStatus = filterStatus === "TODOS" || u.status === filterStatus;
    const matchesTipo = filterTipo === "TODOS" || u.tipoUsuario === filterTipo;

    return matchesSearch && matchesStatus && matchesTipo;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] p-6 md:p-12 transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <Lock className="text-purple-500 w-8 h-8" /> Painel de Administração
        </h1>

        {error && <div className="bg-red-500/20 text-red-500 border border-red-500/50 p-4 rounded-xl mb-6">{error}</div>}
        {successMsg && (
          <div className="bg-green-500/20 text-green-500 border border-green-500/50 p-4 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> {successMsg}
          </div>
        )}

        {/* Barra de Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)]">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome, username ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-purple-500 outline-none transition-colors"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-purple-500 outline-none transition-colors"
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="ALUNO">Aluno</option>
              <option value="PROFESSOR">Professor</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="OWNER">Owner</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-purple-500 outline-none transition-colors"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Ativo</option>
              <option value="BLOQUEADO">Bloqueado</option>
              <option value="BANIDO">Banido</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto bg-[var(--bg-card)] rounded-2xl shadow-xl border border-[var(--border-color)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-card-hover)] border-b border-[var(--border-color)]">
                <th className="p-4 font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">Usuário</th>
                <th className="p-4 font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">Contato</th>
                <th className="p-4 font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">Tipo</th>
                <th className="p-4 font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                <th className="p-4 font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((u) => {
                const disableActions = !canModify(u);
                
                return (
                  <tr key={u._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-page)] transition-colors">
                    <td className="p-4">
                      <div className="font-bold">{u.nome}</div>
                      <div className="text-xs text-[var(--text-secondary)]">@{u.username || "sem_user"}</div>
                    </td>
                    <td className="p-4 text-sm">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.tipoUsuario}
                        disabled={disableActions}
                        onChange={(e) => handleChangeTipo(u._id, e.target.value)}
                        className={`p-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-sm outline-none focus:border-purple-500 transition-colors ${disableActions ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <option value="ALUNO">Aluno</option>
                        <option value="PROFESSOR">Professor</option>
                        {/* Se for Owner ou tiver permissão de promover, exibe Administrador */}
                        {(user?.tipoUsuario === "OWNER" || user?.canPromoteToAdmin || u.tipoUsuario === "ADMINISTRADOR") && (
                          <option value="ADMINISTRADOR">Administrador</option>
                        )}
                        {user?.tipoUsuario === "OWNER" && <option value="OWNER">Owner</option>}
                      </select>
                      
                      {user?.tipoUsuario === "OWNER" && u.tipoUsuario === "ADMINISTRADOR" && (
                        <div className="mt-2 flex items-center gap-2">
                          <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={u.canPromoteToAdmin || false}
                              onChange={(e) => handleTogglePermission(u._id, e.target.checked)}
                              className="w-3 h-3 accent-purple-500"
                            />
                            Pode promover Admins
                          </label>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-center w-max ${
                          u.status === "ATIVO" ? "bg-green-500/20 text-green-500" :
                          u.status === "BLOQUEADO" ? "bg-yellow-500/20 text-yellow-500" :
                          "bg-red-500/20 text-red-500"
                        }`}>
                          {u.status}
                        </span>
                        {u.status === "BLOQUEADO" && u.bloqueadoAte && (
                          <span className="text-[10px] text-[var(--text-secondary)]">
                            Até: {new Date(u.bloqueadoAte).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {u.status === "BLOQUEADO" ? (
                          <button
                            onClick={() => handleStatusChange(u._id, "ATIVO")}
                            disabled={disableActions}
                            title="Desbloquear"
                            className={`p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all ${disableActions ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openBlockModal(u)}
                            disabled={disableActions || u.status === "BANIDO"}
                            title="Bloquear"
                            className={`p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-all ${(disableActions || u.status === "BANIDO") ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}

                        {u.status === "BANIDO" ? (
                          <button
                            onClick={() => handleStatusChange(u._id, "ATIVO")}
                            disabled={disableActions}
                            title="Desbanir"
                            className={`p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all ${disableActions ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(u._id, "BANIDO")}
                            disabled={disableActions}
                            title="Banir"
                            className={`p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all ${disableActions ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(u._id)}
                          disabled={disableActions}
                          title="Excluir Definitivamente"
                          className={`p-2 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all ${disableActions ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsuarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">
                    Nenhum usuário encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Bloqueio */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl w-full max-w-md shadow-2xl transform scale-100 transition-transform">
            <h2 className="text-2xl font-bold mb-4">Bloquear Usuário</h2>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              Bloqueando: <strong className="text-[var(--text-primary)]">{userToBlock?.nome}</strong>
            </p>
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-sm font-semibold">Data de Expiração (Opcional)</label>
              <input
                type="datetime-local"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="w-full p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-yellow-500 outline-none transition-colors"
              />
              <span className="text-xs text-[var(--text-secondary)]">Deixe em branco para tempo indeterminado.</span>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 rounded-lg font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmBlock}
                className="px-4 py-2 rounded-lg font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
              >
                Confirmar Bloqueio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
