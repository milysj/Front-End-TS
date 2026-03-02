"use client";

import { useState, useEffect } from "react";
import { Lock, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Mock de fases - usando as imagens reais das fases
const fases = [
  { id: 1, nome: "Vila", img: "/img/fases/vila.jpg", paga: false },
  { id: 2, nome: "Montanha", img: "/img/fases/montanha.jpg", paga: true },
  { id: 3, nome: "Deserto", img: "/img/fases/deserto.jpg", paga: false },
  { id: 4, nome: "Castelo", img: "/img/fases/castelo.jpg", paga: false },
];

// Lista de matérias
const materias = [
  "Matemática",
  "Português",
  "Ciências",
  "História",
  "Geografia",
  "Inglês",
  "Física",
  "Química",
  "Biologia",
];

// Imagens disponíveis

// Interface da trilha
interface Trilha {
  id?: number;
  _id?: string;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataTermino: string;
  materia: string;
  dificuldade: string;
  disponibilidade: string;
  pagamento: string;
  faseSelecionada: number | null;
  imagem?: string;
  usuario?: {
    _id: string;
    nome: string;
    username: string;
    email: string;
    tipoUsuario: string;
  };
}

// Interface para usuário com trilhas
interface UsuarioComTrilhas {
  _id: string;
  nome: string;
  username: string;
  email: string;
  tipoUsuario: string;
  trilhas: Trilha[];
}

export default function GerenciarTrilha() {
  // Estados principais
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [trilha, setTrilha] = useState<Trilha>({
    titulo: "",
    descricao: "",
    dataCriacao: "",
    dataTermino: "",
    materia: "",
    dificuldade: "Facil",
    disponibilidade: "Privado",
    pagamento: "Gratuita",
    faseSelecionada: null,
    imagem: "/img/fases/vila.jpg",
  });
  const [modoEdicao, setModoEdicao] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Estados para administrador
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [usuariosComTrilhas, setUsuariosComTrilhas] = useState<UsuarioComTrilhas[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string | null>(null);
  const [filtroBusca, setFiltroBusca] = useState<string>("");
  const [filtroMateria, setFiltroMateria] = useState<string>("");
  const [filtroDificuldade, setFiltroDificuldade] = useState<string>("");

  const router = useRouter();

  // ================== Funções CRUD ==================
  // ================== Funções CRUD ==================

  // Função para agrupar trilhas por usuário
  const agruparTrilhasPorUsuario = (trilhasData: Trilha[]) => {
    const agrupamento: { [key: string]: UsuarioComTrilhas } = {};

    trilhasData.forEach((trilha) => {
      if (trilha.usuario) {
        const userId = trilha.usuario._id;
        if (!agrupamento[userId]) {
          agrupamento[userId] = {
            _id: trilha.usuario._id,
            nome: trilha.usuario.nome,
            username: trilha.usuario.username,
            email: trilha.usuario.email,
            tipoUsuario: trilha.usuario.tipoUsuario,
            trilhas: [],
          };
        }
        agrupamento[userId].trilhas.push(trilha);
      }
    });

    const usuariosArray = Object.values(agrupamento).sort((a, b) => 
      b.trilhas.length - a.trilhas.length // Ordenar por quantidade de trilhas
    );

    setUsuariosComTrilhas(usuariosArray);
  };

  // Buscar tipo de usuário
  useEffect(() => {
    const buscarTipoUsuario = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setTipoUsuario(userData.tipoUsuario || null);
        }
      } catch (error) {
        console.error("Erro ao buscar tipo de usuário:", error);
      }
    };

    buscarTipoUsuario();
  }, []);

  // Buscar trilhas
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchTrilhas = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token || !isMounted) return;

        try {
          const response = await fetch(`${API_URL}/api/trilhas`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
          });

          if (!isMounted) return;

          if (!response.ok) {
            console.error("Erro ao carregar trilhas:", response.statusText);
            return;
          }

          const data = await response.json();
          if (isMounted) {
            setTrilhas(data);
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
          if (!isMounted) return;
          console.error("Erro ao carregar trilhas:", error);
        }
      }
    };

    if (tipoUsuario) {
      fetchTrilhas();
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [tipoUsuario]);

  // Agrupar trilhas por usuário quando as trilhas ou tipoUsuario mudarem
  useEffect(() => {
    if (tipoUsuario === "ADMINISTRADOR" && trilhas.length > 0) {
      agruparTrilhasPorUsuario(trilhas);
    }
  }, [trilhas, tipoUsuario]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTrilha((prev) => ({ ...prev, [name]: value }));
  };

  const handleFaseClick = (id: number) => {
    // Buscar a fase selecionada e vincular sua imagem à trilha
    const faseSelecionada = fases.find((f) => f.id === id);
    if (faseSelecionada) {
      setTrilha((prev) => ({
        ...prev,
        faseSelecionada: id,
        imagem: faseSelecionada.img, // Vincula a imagem da fase à trilha
      }));
    }
  };

  const validarTrilha = () => {
    const newErros: { [key: string]: string } = {};
    if (!trilha.titulo.trim()) newErros.titulo = "Título é obrigatório";
    if (!trilha.descricao.trim())
      newErros.descricao = "Descrição é obrigatória";
    if (!trilha.materia) newErros.materia = "Matéria é obrigatória";
    if (trilha.faseSelecionada === null)
      newErros.faseSelecionada = "Selecione uma fase";

    setErros(newErros);
    return Object.keys(newErros).length === 0;
  };

  const salvarTrilha = async () => {
    if (!validarTrilha()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }

    // Garantir que a imagem esteja sempre definida
    let imagemFinal = trilha.imagem;
    if (!imagemFinal && trilha.faseSelecionada !== null) {
      const fase = fases.find((f) => f.id === trilha.faseSelecionada);
      imagemFinal = fase ? fase.img : "/img/fases/vila.jpg";
    }

    const trilhaParaEnviar = {
      ...trilha,
      imagem: imagemFinal || "/img/fases/vila.jpg", // Sempre inclui a imagem
    };

    const url = modoEdicao
      ? `${API_URL}/api/trilhas/${trilha.id}`
      : `${API_URL}/api/trilhas`;
    const method = modoEdicao ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token incluído aqui
        },
        body: JSON.stringify(trilhaParaEnviar),
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("Erro ao salvar trilha:", errData);
        alert("Erro ao salvar trilha. Verifique o login ou os dados.");
        return;
      }

      const novaTrilha = await response.json();

      if (modoEdicao) {
        setTrilhas((prev) => {
          const trilhasAtualizadas = prev.map((t) => (t.id === novaTrilha.id || (t as any)._id === novaTrilha._id ? novaTrilha : t));
          // Se for ADMINISTRADOR, atualizar também a lista agrupada
          if (tipoUsuario === "ADMINISTRADOR") {
            agruparTrilhasPorUsuario(trilhasAtualizadas);
          }
          return trilhasAtualizadas;
        });
      } else {
        setTrilhas((prev) => {
          const novasTrilhas = [...prev, novaTrilha];
          // Se for ADMINISTRADOR, atualizar também a lista agrupada
          if (tipoUsuario === "ADMINISTRADOR") {
            agruparTrilhasPorUsuario(novasTrilhas);
          }
          return novasTrilhas;
        });
      }

      resetForm();
      setMostrarFormulario(false);
    } catch (err) {
      console.error("Erro de rede ao salvar trilha:", err);
    }
  };

  const editarTrilha = (t: Trilha) => {
    // Se não tiver imagem, busca a imagem da fase selecionada
    let imagemTrilha = t.imagem;
    if (
      !imagemTrilha &&
      t.faseSelecionada !== null &&
      t.faseSelecionada !== undefined
    ) {
      const fase = fases.find((f) => f.id === t.faseSelecionada);
      imagemTrilha = fase ? fase.img : "/img/fases/vila.jpg";
    }

    setTrilha({
      ...t,
      id: t.id ?? (t as any)._id, // garante que id receba o valor de _id caso exista
      imagem: imagemTrilha || "/img/fases/vila.jpg", // Garante que tenha uma imagem padrão
    });
    setModoEdicao(true);
    setMostrarFormulario(true);
  };

  const deletarTrilha = async (id?: string) => {
    if (!id) return;
    const confirm = window.confirm("Deseja realmente deletar esta trilha?");
    if (!confirm) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Usuário não autenticado!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/trilhas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTrilhas((prev) => {
          const novasTrilhas = prev.filter((t) => t.id?.toString() !== id && (t as any)._id !== id);
          // Se for ADMINISTRADOR, atualizar também a lista agrupada
          if (tipoUsuario === "ADMINISTRADOR" && novasTrilhas.length > 0) {
            agruparTrilhasPorUsuario(novasTrilhas);
          }
          return novasTrilhas;
        });
        
        // Atualizar também a lista de usuários se for ADMINISTRADOR
        if (tipoUsuario === "ADMINISTRADOR") {
          setUsuariosComTrilhas((prev) => {
            return prev.map((usuario) => ({
              ...usuario,
              trilhas: usuario.trilhas.filter((t) => t.id?.toString() !== id && (t as any)._id !== id),
            })).filter((usuario) => usuario.trilhas.length > 0);
          });
        }
      } else {
        const erro = await response.json();
        console.error("Erro ao deletar trilha:", erro);
        alert(erro.message || "Erro ao deletar trilha");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTrilha({
      titulo: "",
      descricao: "",
      dataCriacao: "",
      dataTermino: "",
      materia: "",
      dificuldade: "Facil",
      disponibilidade: "Privado",
      pagamento: "Gratuita",
      faseSelecionada: null,
      imagem: "/img/fases/vila.jpg",
    });
    setErros({});
    setModoEdicao(false);
  };

  // Efeito para garantir que a imagem esteja vinculada à fase selecionada ao editar
  useEffect(() => {
    if (
      modoEdicao &&
      trilha.faseSelecionada !== null &&
      trilha.faseSelecionada !== undefined
    ) {
      const fase = fases.find((f) => f.id === trilha.faseSelecionada);
      if (fase && (!trilha.imagem || trilha.imagem === "/img/fases/vila.jpg")) {
        // Se não tiver imagem ou tiver a padrão, atualiza com a da fase
        setTrilha((prev) => ({ ...prev, imagem: fase.img }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modoEdicao, trilha.faseSelecionada]);

  // Funções de filtro para administrador
  const trilhasFiltradas = usuarioSelecionado
    ? usuariosComTrilhas
        .find((u) => u._id === usuarioSelecionado)
        ?.trilhas.filter((t) => {
          const matchBusca =
            filtroBusca === "" ||
            t.titulo.toLowerCase().includes(filtroBusca.toLowerCase()) ||
            t.descricao.toLowerCase().includes(filtroBusca.toLowerCase()) ||
            (t.usuario && t.usuario.nome.toLowerCase().includes(filtroBusca.toLowerCase()));
          const matchMateria = filtroMateria === "" || t.materia === filtroMateria;
          const matchDificuldade = filtroDificuldade === "" || t.dificuldade === filtroDificuldade;
          return matchBusca && matchMateria && matchDificuldade;
        }) || []
    : [];

  const usuariosFiltrados = usuariosComTrilhas.filter((usuario) => {
    const matchBusca =
      filtroBusca === "" ||
      usuario.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      usuario.username.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      usuario.email.toLowerCase().includes(filtroBusca.toLowerCase());
    return matchBusca;
  });

  // ================== JSX ==================
  // Se for ADMINISTRADOR, mostrar interface de administrador
  if (tipoUsuario === "ADMINISTRADOR") {
    return (
      <div className="flex flex-col items-center p-2 sm:p-4 mx-auto w-full max-w-6xl relative">
        {/* ================= Botão Criar Trilha ================= */}
        <button
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition mb-6 mx-auto"
          onClick={() => {
            resetForm();
            setMostrarFormulario(true);
          }}
        >
          Criar Trilha
        </button>

        {/* ================= Filtros ================= */}
        <div className="mt-4 w-full mb-6 bg-[var(--bg-card)] p-4 rounded shadow-md border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-bold mb-4 text-[var(--text-primary)]">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Buscar</label>
              <input
                type="text"
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                placeholder="Buscar por nome, título..."
                className="w-full border border-[var(--border-color)] rounded px-3 py-2 text-sm bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>
            {usuarioSelecionado && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-1">Matéria</label>
                  <select
                    value={filtroMateria}
                    onChange={(e) => setFiltroMateria(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">Todas</option>
                    {materias.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Dificuldade</label>
                  <select
                    value={filtroDificuldade}
                    onChange={(e) => setFiltroDificuldade(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">Todas</option>
                    <option value="Facil">Fácil</option>
                    <option value="Medio">Médio</option>
                    <option value="Dificil">Difícil</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= Lista de Usuários ou Trilhas ================= */}
        {!usuarioSelecionado ? (
          <div className="w-full mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center mt-4">
              Usuários que Criaram Trilhas
            </h2>
            {usuariosFiltrados.length === 0 ? (
              <p className="text-center">Nenhum usuário encontrado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {usuariosFiltrados.map((usuario) => (
                  <div
                    key={usuario._id}
                    onClick={() => setUsuarioSelecionado(usuario._id)}
                    className="bg-[var(--bg-card)] rounded shadow-md p-4 cursor-pointer hover:shadow-lg transition border-2 border-transparent hover:border-blue-500 border-[var(--border-color)]"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">{usuario.nome}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-1">@{usuario.username}</p>
                    <p className="text-sm text-[var(--text-muted)] mb-2">{usuario.email}</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {usuario.trilhas.length} {usuario.trilhas.length === 1 ? "trilha" : "trilhas"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                Trilhas de {usuariosComTrilhas.find((u) => u._id === usuarioSelecionado)?.nome}
              </h2>
              <button
                onClick={() => {
                  setUsuarioSelecionado(null);
                  setFiltroMateria("");
                  setFiltroDificuldade("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Voltar
              </button>
            </div>
            {trilhasFiltradas.length === 0 ? (
              <p className="text-center">Nenhuma trilha encontrada.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                {trilhasFiltradas.map((t) => (
                  <div
                    key={t.id ?? (t as any)._id}
                    className="bg-[var(--bg-card)] rounded shadow-md p-3 sm:p-4 flex flex-col gap-2 overflow-hidden w-full max-w-sm border border-[var(--border-color)] transition-colors duration-300"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    {t.imagem && (
                      <img
                        src={t.imagem}
                        alt={t.titulo}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="font-semibold text-base sm:text-lg break-words">
                      {t.titulo}
                    </h3>
                    <p className="text-xs sm:text-sm break-words">{t.descricao}</p>
                    <p className="text-xs text-[var(--text-muted)] break-words">
                      {t.materia} - {t.dificuldade} -{" "}
                      {t.pagamento === "Paga" ? "Pago" : "Gratuito"}
                    </p>
                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        className="bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600 w-full whitespace-nowrap"
                        onClick={() => editarTrilha(t)}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/gerenciarFases?trilhaId=${t._id}&titulo=${t.titulo}`
                          )
                        }
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 w-full whitespace-nowrap"
                      >
                        Gerenciar Fases
                      </button>

                      <button
                        className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 w-full whitespace-nowrap"
                        onClick={() => deletarTrilha(t.id ?? (t as any)._id)}
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= Formulário de criação/edição ================= */}
        {mostrarFormulario && (
          <>
            {/* Overlay/Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
              onClick={() => {
                resetForm();
                setMostrarFormulario(false);
              }}
            />

            {/* Formulário */}
            <div className="fixed inset-x-0 top-0 sm:relative sm:inset-auto bg-[var(--bg-card)] p-3 sm:p-4 md:p-6 rounded shadow-lg w-full max-w-3xl mb-8 overflow-y-auto max-h-screen sm:max-h-none z-50 sm:z-auto mx-auto sm:shadow-md border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                  {modoEdicao ? "Editar" : "Criar nova"}{" "}
                  <span className="text-pink-500">trilha</span>
                </h1>
                {/* Botão de fechar no mobile */}
                <button
                  onClick={() => {
                    resetForm();
                    setMostrarFormulario(false);
                  }}
                  className="sm:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl font-bold leading-none transition-colors duration-300"
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Título */}
                <div>
                  <label className="block font-semibold mb-1 text-sm sm:text-base">
                    Nome da trilha
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={trilha.titulo}
                    onChange={handleChange}
                    placeholder="Título"
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                  />
                  {erros.titulo && (
                    <p className="text-red-500 text-sm mt-1">{erros.titulo}</p>
                  )}
                </div>

                {/* Descrição */}
                <div>
                  <label className="block font-semibold mb-1 text-sm sm:text-base">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    value={trilha.descricao}
                    onChange={handleChange}
                    placeholder="Descrição"
                    className="w-full border rounded px-3 py-2 h-24 sm:h-28 resize-none text-sm sm:text-base"
                  />
                  {erros.descricao && (
                    <p className="text-red-500 text-sm mt-1">{erros.descricao}</p>
                  )}
                </div>

                {/* Datas */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block font-semibold mb-1 text-sm sm:text-base">
                      Data de início
                    </label>
                    <input
                      type="date"
                      name="dataCriacao"
                      value={trilha.dataCriacao}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold mb-1 text-sm sm:text-base">
                      Data de término (opcional)
                    </label>
                    <input
                      type="date"
                      name="dataTermino"
                      value={trilha.dataTermino}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Matéria e dificuldade */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block font-semibold mb-1 text-sm sm:text-base">
                      Matéria
                    </label>
                    <select
                      name="materia"
                      value={trilha.materia}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                    >
                      <option value="" disabled>
                        Selecione uma matéria
                      </option>
                      {materias.map((m, i) => (
                        <option key={i} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {erros.materia && (
                      <p className="text-red-500 text-sm mt-1">{erros.materia}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold mb-1 text-sm sm:text-base">
                      Dificuldade
                    </label>
                    <select
                      name="dificuldade"
                      value={trilha.dificuldade}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                    >
                      <option value="Facil">Fácil</option>
                      <option value="Medio">Médio</option>
                      <option value="Dificil">Difícil</option>
                    </select>
                  </div>
                </div>

                {/* Disponibilidade e pagamento */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-20 justify-center sm:justify-start">
                  <div>
                    <p className="font-semibold mb-1 text-sm sm:text-base">
                      Disponibilidade
                    </p>
                    <label className="mr-4">
                      <input
                        type="radio"
                        name="disponibilidade"
                        value="Privado"
                        checked={trilha.disponibilidade === "Privado"}
                        onChange={handleChange}
                        className="mr-1"
                      />{" "}
                      Privado
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="disponibilidade"
                        value="Aberto"
                        checked={trilha.disponibilidade === "Aberto"}
                        onChange={handleChange}
                        className="mr-1"
                      />{" "}
                      Aberto
                    </label>
                  </div>
                  <div>
                    <p className="font-semibold mb-1 text-sm sm:text-base">
                      Paga ou gratuita
                    </p>
                    <label className="mr-4">
                      <input
                        type="radio"
                        name="pagamento"
                        value="Paga"
                        checked={trilha.pagamento === "Paga"}
                        onChange={handleChange}
                        className="mr-1"
                      />{" "}
                      Paga
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="pagamento"
                        value="Gratuita"
                        checked={trilha.pagamento === "Gratuita"}
                        onChange={handleChange}
                        className="mr-1"
                      />{" "}
                      Gratuita
                    </label>
                  </div>
                </div>

                {/* Carrossel de fases */}
                <div className="w-full">
                  <p className="font-semibold mb-2 text-sm sm:text-base">
                    Fases da trilha
                  </p>
                  {erros.faseSelecionada && (
                    <p className="text-red-500 text-sm mb-2">
                      {erros.faseSelecionada}
                    </p>
                  )}
                  <div className="flex overflow-x-auto gap-3 sm:gap-4 py-2 pb-3">
                    {fases.map((fase) => {
                      const isSelected = trilha.faseSelecionada === fase.id;
                      return (
                        <div
                          key={fase.id}
                          onClick={() => handleFaseClick(fase.id)}
                          className={`shrink-0 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 border-4 rounded-xl overflow-hidden relative cursor-pointer transition-all duration-200 transform
                          ${
                            isSelected
                              ? "border-blue-600 shadow-lg scale-105"
                              : "border-gray-300 hover:scale-105 hover:shadow-md"
                          }`}
                        >
                          <img
                            src={fase.img}
                            alt={fase.nome}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex items-center gap-1 bg-black/50 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                            {fase.paga ? (
                              <Lock size={12} className="sm:w-3.5 sm:h-3.5" />
                            ) : (
                              <Unlock size={12} className="sm:w-3.5 sm:h-3.5" />
                            )}
                            <span className="hidden sm:inline">
                              {fase.paga ? "Paga" : "Gratuita"}
                            </span>
                            <span className="sm:hidden">
                              {fase.paga ? "P" : "G"}
                            </span>
                          </div>
                          <div className="absolute bottom-0 w-full bg-black/40 text-white text-center py-0.5 sm:py-1 text-xs sm:text-sm">
                            {fase.nome}
                          </div>
                          {isSelected && (
                            <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-blue-600 text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-2 py-0.5 rounded shadow-md">
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botões Salvar / Cancelar */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mt-4 mb-2 sm:mb-0">
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded hover:bg-blue-700 transition w-full sm:w-auto min-w-0 sm:min-w-[100px] text-sm sm:text-base"
                    onClick={salvarTrilha}
                  >
                    {modoEdicao ? "Atualizar" : "Salvar"}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded hover:bg-gray-600 transition w-full sm:w-auto min-w-0 sm:min-w-[100px] text-sm sm:text-base"
                    onClick={() => {
                      resetForm();
                      setMostrarFormulario(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ================== Interface para PROFESSOR ==================
  return (
    <div className="flex flex-col items-center p-2 sm:p-4 mx-auto w-full max-w-6xl relative">
      {/* ================= Botão Criar Trilha ================= */}
      <button
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition mb-6 mx-auto"
        onClick={() => {
          resetForm();
          setMostrarFormulario(true);
        }}
      >
        Criar Trilha
      </button>

      {/* ================= Lista de Trilhas ================= */}
      <div className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center mt-4">
          Minhas Trilhas
        </h2>
        {trilhas.length === 0 && (
          <p className="text-center">Nenhuma trilha criada ainda.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
          {trilhas.map((t) => (
            <div
              key={t.id ?? (t as any)._id} // usa id ou _id do MongoDB
              className="bg-white rounded shadow-md p-3 sm:p-4 flex flex-col gap-2 overflow-hidden w-full max-w-sm"
            >
              {t.imagem && (
                <img
                  src={t.imagem}
                  alt={t.titulo}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold text-base sm:text-lg break-words">
                {t.titulo}
              </h3>
              <p className="text-xs sm:text-sm break-words">{t.descricao}</p>
              <p className="text-xs text-[var(--text-muted)] break-words">
                {t.materia} - {t.dificuldade} -{" "}
                {t.pagamento === "Paga" ? "Pago" : "Gratuito"}
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600 w-full whitespace-nowrap"
                  onClick={() => editarTrilha(t)}
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    router.push(
                      `/gerenciarFases?trilhaId=${t._id}&titulo=${t.titulo}`
                    )
                  }
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 w-full whitespace-nowrap"
                >
                  Gerenciar Fases
                </button>

                <button
                  className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 w-full whitespace-nowrap"
                  onClick={() => deletarTrilha(t.id ?? (t as any)._id)}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Formulário de criação/edição ================= */}
      {mostrarFormulario && (
        <>
          {/* Overlay/Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => {
              resetForm();
              setMostrarFormulario(false);
            }}
          />

          {/* Formulário */}
          <div className="fixed inset-x-0 top-0 sm:relative sm:inset-auto bg-white p-3 sm:p-4 md:p-6 rounded shadow-lg w-full max-w-3xl mb-8 overflow-y-auto max-h-screen sm:max-h-none z-50 sm:z-auto mx-auto sm:shadow-md">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                {modoEdicao ? "Editar" : "Criar nova"}{" "}
                <span className="text-pink-500">trilha</span>
              </h1>
              {/* Botão de fechar no mobile */}
              <button
                onClick={() => {
                  resetForm();
                  setMostrarFormulario(false);
                }}
                className="sm:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl font-bold leading-none transition-colors duration-300"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Título */}
              <div>
                <label className="block font-semibold mb-1 text-sm sm:text-base">
                  Nome da trilha
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={trilha.titulo}
                  onChange={handleChange}
                  placeholder="Título"
                  className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                />
                {erros.titulo && (
                  <p className="text-red-500 text-sm mt-1">{erros.titulo}</p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block font-semibold mb-1 text-sm sm:text-base">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={trilha.descricao}
                  onChange={handleChange}
                  placeholder="Descrição"
                  className="w-full border rounded px-3 py-2 h-24 sm:h-28 resize-none text-sm sm:text-base"
                />
                {erros.descricao && (
                  <p className="text-red-500 text-sm mt-1">{erros.descricao}</p>
                )}
              </div>

              {/* Datas */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-1 text-sm sm:text-base">
                    Data de início
                  </label>
                  <input
                    type="date"
                    name="dataCriacao"
                    value={trilha.dataCriacao}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1 text-sm sm:text-base">
                    Data de término (opcional)
                  </label>
                  <input
                    type="date"
                    name="dataTermino"
                    value={trilha.dataTermino}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Matéria e dificuldade */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-1 text-sm sm:text-base">
                    Matéria
                  </label>
                  <select
                    name="materia"
                    value={trilha.materia}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                  >
                    <option value="" disabled>
                      Selecione uma matéria
                    </option>
                    {materias.map((m, i) => (
                      <option key={i} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  {erros.materia && (
                    <p className="text-red-500 text-sm mt-1">{erros.materia}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1 text-sm sm:text-base">
                    Dificuldade
                  </label>
                  <select
                    name="dificuldade"
                    value={trilha.dificuldade}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-sm sm:text-base"
                  >
                    <option value="Facil">Fácil</option>
                    <option value="Medio">Médio</option>
                    <option value="Dificil">Difícil</option>
                  </select>
                </div>
              </div>

              {/* Disponibilidade e pagamento */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-20 justify-center sm:justify-start">
                <div>
                  <p className="font-semibold mb-1 text-sm sm:text-base">
                    Disponibilidade
                  </p>
                  <label className="mr-4">
                    <input
                      type="radio"
                      name="disponibilidade"
                      value="Privado"
                      checked={trilha.disponibilidade === "Privado"}
                      onChange={handleChange}
                      className="mr-1"
                    />{" "}
                    Privado
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="disponibilidade"
                      value="Aberto"
                      checked={trilha.disponibilidade === "Aberto"}
                      onChange={handleChange}
                      className="mr-1"
                    />{" "}
                    Aberto
                  </label>
                </div>
                <div>
                  <p className="font-semibold mb-1 text-sm sm:text-base">
                    Paga ou gratuita
                  </p>
                  <label className="mr-4">
                    <input
                      type="radio"
                      name="pagamento"
                      value="Paga"
                      checked={trilha.pagamento === "Paga"}
                      onChange={handleChange}
                      className="mr-1"
                    />{" "}
                    Paga
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="pagamento"
                      value="Gratuita"
                      checked={trilha.pagamento === "Gratuita"}
                      onChange={handleChange}
                      className="mr-1"
                    />{" "}
                    Gratuita
                  </label>
                </div>
              </div>

              {/* Carrossel de fases */}
              <div className="w-full">
                <p className="font-semibold mb-2 text-sm sm:text-base">
                  Fases da trilha
                </p>
                {erros.faseSelecionada && (
                  <p className="text-red-500 text-sm mb-2">
                    {erros.faseSelecionada}
                  </p>
                )}
                <div className="flex overflow-x-auto gap-3 sm:gap-4 py-2 pb-3">
                  {fases.map((fase) => {
                    const isSelected = trilha.faseSelecionada === fase.id;
                    return (
                      <div
                        key={fase.id}
                        onClick={() => handleFaseClick(fase.id)}
                        className={`shrink-0 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 border-4 rounded-xl overflow-hidden relative cursor-pointer transition-all duration-200 transform
                        ${
                          isSelected
                            ? "border-blue-600 shadow-lg scale-105"
                            : "border-gray-300 hover:scale-105 hover:shadow-md"
                        }`}
                      >
                        <img
                          src={fase.img}
                          alt={fase.nome}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex items-center gap-1 bg-black/50 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                          {fase.paga ? (
                            <Lock size={12} className="sm:w-3.5 sm:h-3.5" />
                          ) : (
                            <Unlock size={12} className="sm:w-3.5 sm:h-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {fase.paga ? "Paga" : "Gratuita"}
                          </span>
                          <span className="sm:hidden">
                            {fase.paga ? "P" : "G"}
                          </span>
                        </div>
                        <div className="absolute bottom-0 w-full bg-black/40 text-white text-center py-0.5 sm:py-1 text-xs sm:text-sm">
                          {fase.nome}
                        </div>
                        {isSelected && (
                          <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-blue-600 text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-2 py-0.5 rounded shadow-md">
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botões Salvar / Cancelar */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mt-4 mb-2 sm:mb-0">
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded hover:bg-blue-700 transition w-full sm:w-auto min-w-0 sm:min-w-[100px] text-sm sm:text-base"
                  onClick={salvarTrilha}
                >
                  {modoEdicao ? "Atualizar" : "Salvar"}
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded hover:bg-gray-600 transition w-full sm:w-auto min-w-0 sm:min-w-[100px] text-sm sm:text-base"
                  onClick={() => {
                    resetForm();
                    setMostrarFormulario(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
