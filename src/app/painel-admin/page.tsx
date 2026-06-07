"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import BackButton from "@/app/components/BackButton";
import { Lock, Unlock, Ban, Trash2, CheckCircle, BookOpen, Plus, Search, Users, Pencil, Check, X, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

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
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t, language } = useLanguage();

  const getTipoUsuarioTranslated = (tipo: string) => {
    const activeLang = language || "pt-BR";
    if (tipo === "ALUNO") {
      if (activeLang.startsWith("en")) return "Student";
      if (activeLang.startsWith("es")) return "Alumno";
      return "Aluno";
    }
    if (tipo === "PROFESSOR") {
      if (activeLang.startsWith("en")) return "Teacher";
      if (activeLang.startsWith("es")) return "Profesor";
      return "Professor";
    }
    if (tipo === "ADMINISTRADOR") {
      if (activeLang.startsWith("en")) return "Administrator";
      if (activeLang.startsWith("es")) return "Administrador";
      return "Administrador";
    }
    if (tipo === "OWNER") {
      if (activeLang.startsWith("en")) return "Owner";
      if (activeLang.startsWith("es")) return "Propietario";
      return "Owner";
    }
    return tipo;
  };

  const getStatusTranslated = (status: string) => {
    if (status === "ATIVO") return t("adminPanel.active");
    if (status === "BLOQUEADO") return t("adminPanel.blocked");
    if (status === "BANIDO") return t("adminPanel.banned");
    return status;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const backgroundImage = resolvedTheme === "dark" 
    ? "/img/backgrounds/background_login_darkmode.jpg"
    : "/img/backgrounds/background_login_lightmode.png";

  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Abas
  const [activeTab, setActiveTab] = useState<"usuarios" | "materias">("usuarios");

  // Filtros de Usuários
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("TODOS");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  // Estado para o modal de bloqueio
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState<UserData | null>(null);
  const [blockDate, setBlockDate] = useState("");

  // Matérias
  const [materias, setMaterias] = useState<string[]>([]);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [newMateriaName, setNewMateriaName] = useState("");
  const [addingMateria, setAddingMateria] = useState(false);
  const [searchMateriaTerm, setSearchMateriaTerm] = useState("");
  const [deletingMateriaName, setDeletingMateriaName] = useState<string | null>(null);

  // Estados para Edição de Matéria
  const [editingMateriaName, setEditingMateriaName] = useState<string | null>(null);
  const [editedMateriaValue, setEditedMateriaValue] = useState("");
  const [updatingMateria, setUpdatingMateria] = useState(false);

  useEffect(() => {
    fetchUsuarios();
    fetchMaterias();
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
        setError(t("adminPanel.errorUsers"));
      }
    } catch (err) {
      setError(t("adminPanel.errorUsersConnection"));
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterias = async () => {
    try {
      setLoadingMaterias(true);
      const res = await fetch(`${API_URL}/api/materias`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMaterias(data);
      } else {
        setError(t("adminPanel.errorSubjects"));
      }
    } catch (err) {
      setError(t("adminPanel.errorSubjectsConnection"));
    } finally {
      setLoadingMaterias(false);
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
        showSuccess(t("adminPanel.typeUpdated"));
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
        showSuccess(t("adminPanel.permissionsUpdated"));
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
        showSuccess(t("adminPanel.statusChanged").replace("{status}", getStatusTranslated(novoStatus)));
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
    if (!window.confirm(t("adminPanel.confirmDeleteUser"))) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showSuccess(t("adminPanel.userDeleted"));
        fetchUsuarios();
      } else {
        const errData = await res.json();
        alert(`Erro: ${errData.message}`);
      }
    } catch (err) {
      alert("Erro ao excluir usuário.");
    }
  };

  const handleAddMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMateriaName.trim()) return;

    try {
      setAddingMateria(true);
      setError("");
      const res = await fetch(`${API_URL}/api/admin/materias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: newMateriaName.trim() }),
      });

      if (res.ok) {
        showSuccess(t("adminPanel.subjectAdded").replace("{name}", newMateriaName.trim()));
        setNewMateriaName("");
        fetchMaterias();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Erro ao adicionar matéria.");
      }
    } catch (err) {
      setError("Erro de conexão ao adicionar matéria.");
    } finally {
      setAddingMateria(false);
    }
  };

  const handleEditMateria = async (nomeAntigo: string) => {
    const novoNome = editedMateriaValue.trim();
    if (!novoNome || novoNome.toLowerCase() === nomeAntigo.toLowerCase()) {
      setEditingMateriaName(null);
      return;
    }

    try {
      setUpdatingMateria(true);
      setError("");
      const res = await fetch(`${API_URL}/api/admin/materias/${encodeURIComponent(nomeAntigo)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ novoNome }),
      });

      if (res.ok) {
        showSuccess(t("adminPanel.subjectUpdated").replace("{old}", nomeAntigo).replace("{new}", novoNome));
        setEditingMateriaName(null);
        fetchMaterias();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Erro ao atualizar matéria.");
      }
    } catch (err) {
      setError("Erro de conexão ao atualizar matéria.");
    } finally {
      setUpdatingMateria(false);
    }
  };

  const handleDeleteMateria = async (nome: string) => {
    if (!window.confirm(t("adminPanel.confirmDeleteSubject").replace("{name}", nome))) return;

    try {
      setDeletingMateriaName(nome);
      setError("");
      const res = await fetch(`${API_URL}/api/admin/materias/${encodeURIComponent(nome)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        showSuccess(t("adminPanel.subjectDeleted").replace("{name}", nome));
        fetchMaterias();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Erro ao excluir matéria.");
      }
    } catch (err) {
      setError("Erro de conexão ao excluir matéria.");
    } finally {
      setDeletingMateriaName(null);
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

  if (loading && usuarios.length === 0) {
    return <div className="p-8 text-center text-xl text-[var(--text-primary)]">{t("adminPanel.loading")}</div>;
  }

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

  const filteredMaterias = materias.filter((m) =>
    m.toLowerCase().includes(searchMateriaTerm.toLowerCase())
  );

  return (
    <div 
      className="min-h-screen text-[var(--text-primary)] p-6 md:p-12 transition-colors duration-300 relative bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: mounted ? `url('${backgroundImage}')` : "none",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Lock className="text-purple-500 w-8 h-8" /> {t("adminPanel.title")}
          </h1>
          <BackButton href="/home" />
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-500 border border-red-500/50 p-4 rounded-xl mb-6 relative flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="hover:opacity-75 font-bold text-lg px-2">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-500/20 text-green-500 border border-green-500/50 p-4 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> {successMsg}
          </div>
        )}

        {/* Abas Modernas com Glassmorphism */}
        <div className="flex gap-4 mb-8 border-b border-[var(--border-color)] pb-3">
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === "usuarios"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
            }`}
          >
            <Users className="w-4 h-4" /> {t("adminPanel.users")}
          </button>
          <button
            onClick={() => setActiveTab("materias")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === "materias"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
            }`}
          >
            <BookOpen className="w-4 h-4" /> {t("adminPanel.subjects")}
          </button>
        </div>

        {activeTab === "usuarios" ? (
          <>
            {/* Barra de Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)]">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t("adminPanel.searchPlaceholder")}
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
                  style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                >
                  <option value="TODOS" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{t("adminPanel.allTypes")}</option>
                  <option value="ALUNO" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{getTipoUsuarioTranslated("ALUNO")}</option>
                  <option value="PROFESSOR" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{getTipoUsuarioTranslated("PROFESSOR")}</option>
                  <option value="ADMINISTRADOR" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{getTipoUsuarioTranslated("ADMINISTRADOR")}</option>
                  <option value="OWNER" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{getTipoUsuarioTranslated("OWNER")}</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-purple-500 outline-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                >
                  <option value="TODOS" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{t("adminPanel.allStatus")}</option>
                  <option value="ATIVO" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{getStatusTranslated("ATIVO")}</option>
                  <option value="BLOQUEADO" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{getStatusTranslated("BLOQUEADO")}</option>
                  <option value="BANIDO" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{getStatusTranslated("BANIDO")}</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto bg-[var(--bg-card)] rounded-2xl shadow-xl border border-[var(--border-color)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-card-hover)] border-b border-[var(--border-color)]">
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">{t("adminPanel.user")}</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">{t("adminPanel.contact")}</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">{t("adminPanel.type")}</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">{t("adminPanel.status")}</th>
                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">{t("adminPanel.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((u) => {
                    const disableActions = !canModify(u);
                    
                    return (
                      <tr key={u._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-page)] transition-colors">
                        <td className="p-4">
                          <div className="font-bold">{u.nome}</div>
                          <div className="text-xs text-[var(--text-secondary)]">@{u.username || (language === "en-US" ? "no_username" : language === "es-ES" ? "sin_usuario" : "sem_user")}</div>
                        </td>
                        <td className="p-4 text-sm">{u.email}</td>
                        <td className="p-4">
                          <select
                            value={u.tipoUsuario}
                            disabled={disableActions}
                            onChange={(e) => handleChangeTipo(u._id, e.target.value)}
                            className={`p-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm outline-none focus:border-purple-500 transition-colors ${disableActions ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                          >
                            <option value="ALUNO" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{getTipoUsuarioTranslated("ALUNO")}</option>
                            <option value="PROFESSOR" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{getTipoUsuarioTranslated("PROFESSOR")}</option>
                            {(user?.tipoUsuario === "OWNER" || user?.canPromoteToAdmin || u.tipoUsuario === "ADMINISTRADOR") && (
                              <option value="ADMINISTRADOR" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{getTipoUsuarioTranslated("ADMINISTRADOR")}</option>
                            )}
                            {user?.tipoUsuario === "OWNER" && <option value="OWNER" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>{getTipoUsuarioTranslated("OWNER")}</option>}
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
                                {t("adminPanel.canPromote")}
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
                              {getStatusTranslated(u.status)}
                            </span>
                            {u.status === "BLOQUEADO" && u.bloqueadoAte && (
                              <span className="text-[10px] text-[var(--text-secondary)]">
                                {language === "en-US" ? "Until" : language === "es-ES" ? "Hasta" : "Até"}: {new Date(u.bloqueadoAte).toLocaleString()}
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
                                title={t("adminPanel.unlock")}
                                className={`p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all ${disableActions ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                <Unlock className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => openBlockModal(u)}
                                disabled={disableActions || u.status === "BANIDO"}
                                title={t("adminPanel.block")}
                                className={`p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-all ${(disableActions || u.status === "BANIDO") ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                            )}

                            {u.status === "BANIDO" ? (
                              <button
                                onClick={() => handleStatusChange(u._id, "ATIVO")}
                                disabled={disableActions}
                                title={t("adminPanel.unban")}
                                className={`p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all ${disableActions ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(u._id, "BANIDO")}
                                disabled={disableActions}
                                title={t("adminPanel.ban")}
                                className={`p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all ${disableActions ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(u._id)}
                              disabled={disableActions}
                              title={t("adminPanel.deletePermanently")}
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
                        {t("adminPanel.noUsersFound")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Esquerda: Adicionar / Editar */}
            <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-xl h-fit">
              {editingMateriaName ? (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Pencil className="text-blue-500 w-5 h-5" /> {t("adminPanel.editSubject")}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mb-4">
                    {t("adminPanel.editingSubjectName").split("{name}")[0]}
                    <strong className="text-[var(--text-primary)]">{editingMateriaName}</strong>
                    {t("adminPanel.editingSubjectName").split("{name}")[1] || ""}
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditMateria(editingMateriaName);
                    }}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <label className="text-sm text-[var(--text-secondary)] mb-1 block">{t("adminPanel.newName")}</label>
                      <input
                        type="text"
                        placeholder={t("adminPanel.newName") + "..."}
                        value={editedMateriaValue}
                        onChange={(e) => setEditedMateriaValue(e.target.value)}
                        className="w-full p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-500 outline-none transition-colors"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updatingMateria || !editedMateriaValue.trim()}
                        className="flex-1 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {updatingMateria ? (
                          <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                            {t("settings.saving") || "Salvando..."}
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> {t("common.save")}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMateriaName(null);
                          setEditedMateriaValue("");
                        }}
                        className="px-4 py-3 rounded-lg font-bold bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-all flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" /> {t("common.cancel")}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Plus className="text-purple-500 w-5 h-5" /> {t("adminPanel.newSubject")}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mb-4">
                    {t("adminPanel.newSubjectDesc")}
                  </p>
                  <form onSubmit={handleAddMateria} className="flex flex-col gap-4">
                    <div>
                      <label className="text-sm text-[var(--text-secondary)] mb-1 block">{t("adminPanel.subjectName")}</label>
                      <input
                        type="text"
                        placeholder={t("adminPanel.subjectName") + "..."}
                        value={newMateriaName}
                        onChange={(e) => setNewMateriaName(e.target.value)}
                        className="w-full p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-purple-500 outline-none transition-colors"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={addingMateria || !newMateriaName.trim()}
                      className="w-full py-3 rounded-lg font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {addingMateria ? (
                        <>
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                          {t("settings.saving") || "Adicionando..."}
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> {t("adminPanel.addSubject")}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Direita: Matérias Cadastradas */}
            <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="text-purple-500 w-5 h-5" /> {t("adminPanel.registeredSubjects").replace("{count}", materias.length.toString())}
                </h2>
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder={t("manageTrails.search") + "..."}
                    value={searchMateriaTerm}
                    onChange={(e) => setSearchMateriaTerm(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-purple-500 outline-none transition-colors text-xs"
                  />
                </div>
              </div>

              {loadingMaterias && materias.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-secondary)] flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full" />
                  {t("adminPanel.loading")}
                </div>
              ) : filteredMaterias.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-secondary)]">
                  {materias.length === 0 ? t("adminPanel.noSubjectsRegistered") : t("adminPanel.noSubjectsFound")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredMaterias.map((mat) => {
                    const isSelectedForEdit = editingMateriaName === mat;
                    return (
                      <div
                        key={mat}
                        className={`flex items-center justify-between p-4 rounded-xl bg-[var(--bg-page)] border transition-all group shadow-sm ${
                          isSelectedForEdit 
                            ? "border-purple-500 bg-purple-500/5 shadow-purple-500/5" 
                            : "border-[var(--border-color)] hover:border-purple-500/50 hover:shadow-purple-500/5"
                        }`}
                      >
                        <span className={`font-semibold ${isSelectedForEdit ? "text-purple-500 font-bold" : "text-[var(--text-primary)]"}`}>
                          {mat}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => {
                              setEditingMateriaName(mat);
                              setEditedMateriaValue(mat);
                            }}
                            title={t("adminPanel.editSubject")}
                            className={`p-2 rounded-lg transition-all inline-flex items-center ${
                              isSelectedForEdit
                                ? "bg-purple-500 text-white"
                                : "bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white"
                            }`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMateria(mat)}
                            disabled={deletingMateriaName === mat}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                            title={t("manageTrails.delete")}
                          >
                            {deletingMateriaName === mat ? (
                              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Bloqueio */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl w-full max-w-md shadow-2xl transform scale-100 transition-transform">
            <h2 className="text-2xl font-bold mb-4">{t("adminPanel.blockUser")}</h2>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              {t("adminPanel.blockUser")}: <strong className="text-[var(--text-primary)]">{userToBlock?.nome}</strong>
            </p>
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-sm font-semibold">{t("adminPanel.expirationDate")}</label>
              <input
                type="datetime-local"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="w-full p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-yellow-500 outline-none transition-colors"
              />
              <span className="text-xs text-[var(--text-secondary)]">{t("adminPanel.indefiniteTimeDesc")}</span>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 rounded-lg font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmBlock}
                className="px-4 py-2 rounded-lg font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
              >
                {t("adminPanel.confirmBlock")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
