"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "react-bootstrap";

type UsuarioTipo = "ALUNO" | "PROFESSOR";
 
interface Termos {
  termosUso: {
    titulo: string;
    versao: string;
    dataAtualizacao: string;
    conteudo: string;
  };
  politicaPrivacidade: {
    titulo: string;
    versao: string;
    dataAtualizacao: string;
    conteudo: string;
  };
}

const Cadastrar = () => {
  const [tipoUsuario, setTipoUsuario] = useState<UsuarioTipo | "">("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [registro, setRegistro] = useState("");
  const [titulacao, setTitulacao] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [message, setMessage] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [termos, setTermos] = useState<Termos | null>(null);
  const [mostrarModalTermos, setMostrarModalTermos] = useState(false);
  const [tipoTermo, setTipoTermo] = useState<"termos" | "privacidade">(
    "termos"
  );
  const [carregandoTermos, setCarregandoTermos] = useState(false);

  // Função para buscar termos quando o modal for aberto
  const buscarTermos = async () => {
    // Se já tiver os termos carregados, não busca novamente
    if (termos) {
      return;
    }

    try {
      setCarregandoTermos(true);
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/auth/termos`);
      if (res.ok) {
        const data = await res.json();
        setTermos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar termos:", error);
      setMessage("Erro ao carregar os termos. Tente novamente.");
    } finally {
      setCarregandoTermos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setMessage("");

    if (!tipoUsuario) {
      setMessage("Selecione o tipo de usuário.");
      return;
    }
    if (!dataNascimento) {
      setMessage("A data de nascimento é obrigatória.");
      return;
    }
    if (!senha || senha.length < 8) {
      setMessage("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setMessage("As senhas não coincidem.");
      return;
    }
    if (!aceiteTermos) {
      setMessage(
        "É necessário aceitar os termos de uso e política de privacidade para criar uma conta."
      );
      return;
    }

    try {
      interface DadosCadastro {
        nome: string;
        email: string;
        senha: string;
        dataNascimento: string;
        tipoUsuario: UsuarioTipo;
        aceiteTermos: boolean;
        registro?: string;
        titulacao?: string;
      }

      const dados: DadosCadastro = {
        nome,
        email,
        senha,
        dataNascimento,
        tipoUsuario: tipoUsuario,
        aceiteTermos: true,
      };

      if (tipoUsuario === "PROFESSOR") {
        dados.registro = registro;
        dados.titulacao = titulacao;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Erro no cadastro");
        setErro(data.error);
        return;
      }

      setSucesso("Usuário cadastrado com sucesso!");
      console.log("Usuário cadastrado:", data);
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      setMessage("Erro ao conectar com o servidor.");
    }
  };

  const handleTipoUsuarioChange = (tipo: UsuarioTipo) => {
    setTipoUsuario(tipo);
    // Limpar os campos ao trocar o tipo de usuário
    setNome("");
    setEmail("");
    setDataNascimento("");
    setSenha("");
    setConfirmarSenha("");
    setRegistro("");
    setTitulacao("");
    setErro("");
    setSucesso("");
  };

  const camposComuns = (
    <>
      <div className="flex flex-col">
        <label className="text-sm text-left text-[var(--text-primary)]">Nome Completo:</label>
        <input
          type="text"
          placeholder="Seu nome completo"
          className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm mb-1 text-left text-[var(--text-primary)]">Email:</label>
        <input
          type="email"
          placeholder="Seu email"
          className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm mb-1 text-left text-[var(--text-primary)]">Data de Nascimento:</label>
        <input
          type="date"
          className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          required
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
        />
      </div>
    </>
  );

  const camposSenha = (
    <>
      <div className="flex flex-col">
        <label className="text-sm mb-1 text-left text-[var(--text-primary)]">Senha:</label>
        <div className="relative">
          <input
            type={mostrarSenha ? "text" : "password"}
            placeholder="Digite sua senha (mínimo 8 caracteres)"
            className="w-full rounded-lg py-2 px-4 pr-10 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            required
            minLength={8}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300"
            style={{ color: 'var(--text-secondary)' }}
            title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarSenha ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.964 9.964 0 012.41-4.042M6.112 6.112A9.967 9.967 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zM3 3l18 18"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-col">
        <label className="text-sm mb-1 text-left text-[var(--text-primary)]">Confirme a senha:</label>
        <div className="relative">
          <input
            type={mostrarConfirmarSenha ? "text" : "password"}
            placeholder="Repita sua senha"
            className="w-full rounded-lg py-2 px-4 pr-10 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            required
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
            className="absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300"
            style={{ color: 'var(--text-secondary)' }}
            title={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarConfirmarSenha ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.964 9.964 0 012.41-4.042M6.112 6.112A9.967 9.967 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zM3 3l18 18"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );

  const camposProfessor = (
    <>
      <div className="flex flex-col">
        <label className="text-sm mb-1 text-left text-[var(--text-primary)]">Registro Profissional:</label>
        <input
          type="text"
          placeholder="Número do registro"
          className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          required
          value={registro}
          onChange={(e) => setRegistro(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm mb-1 text-left text-[var(--text-primary)]">Titulação:</label>
        <select
          className="rounded-lg py-2 px-4 text-sm border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          required
          value={titulacao}
          onChange={(e) => setTitulacao(e.target.value)}
        >
          <option value="">Selecione a titulação</option>
          <option value="Graduacao">Graduação</option>
          <option value="Especializacao">Especialização</option>
          <option value="Mestrado">Mestrado</option>
          <option value="Doutorado">Doutorado</option>
          <option value="PosDoutorado">Pós-Doutorado</option>
        </select>
      </div>
    </>
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
    >
      <style jsx>{`
        input::placeholder,
        textarea::placeholder,
        select::placeholder {
          color: var(--text-muted) !important;
          opacity: 0.7;
        }
      `}</style>
      <div
        className={`w-full p-6 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-color)] transition-all duration-300 ease-in-out ${
          tipoUsuario === "PROFESSOR" ? "max-w-4xl" : "max-w-md"
        }`}
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <div className="mb-6 flex justify-center">
          <Image
            width={400}
            height={128}
            src="/svg/EstudeMyLogo.svg"
            alt="Logo"
          />
        </div>

        <div className="mb-6">
          <h5 className="text-lg font-semibold mb-3 text-center text-[var(--text-primary)]">
            Selecione o tipo de cadastro:
          </h5>
          <div className="flex gap-4 justify-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tipoUsuario"
                value="ALUNO"
                checked={tipoUsuario === "ALUNO"}
                onChange={() => handleTipoUsuarioChange("ALUNO")}
                className="mr-2"
              />
              <span className="text-sm text-[var(--text-primary)]">Aluno</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tipoUsuario"
                value="PROFESSOR"
                checked={tipoUsuario === "PROFESSOR"}
                onChange={() => handleTipoUsuarioChange("PROFESSOR")}
                className="mr-2"
              />
              <span className="text-sm text-[var(--text-primary)]">Professor</span>
            </label>
          </div>
        </div>

        {tipoUsuario && (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {tipoUsuario === "PROFESSOR" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex flex-col gap-3">{camposComuns}</div>
                <div className="flex flex-col gap-3">
                  {camposProfessor}
                  {camposSenha}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {camposComuns}
                {camposSenha}
              </div>
            )}

            {/* Seção de Termos de Consentimento */}
            <div className="mt-4 p-4 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="aceiteTermos"
                  checked={aceiteTermos}
                  onChange={(e) => setAceiteTermos(e.target.checked)}
                  className="mt-1 cursor-pointer"
                  required
                />
                <label
                  htmlFor="aceiteTermos"
                  className="text-sm text-[var(--text-primary)] cursor-pointer flex-1"
                >
                  Eu aceito os{" "}
                  <button
                    type="button"
                    onClick={async () => {
                      setTipoTermo("termos");
                      setMostrarModalTermos(true);
                      await buscarTermos();
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-300"
                  >
                    Termos de Uso
                  </button>
                  {" e a "}
                  <button
                    type="button"
                    onClick={async () => {
                      setTipoTermo("privacidade");
                      setMostrarModalTermos(true);
                      await buscarTermos();
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-300"
                  >
                    Política de Privacidade
                  </button>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="mt-2"
              disabled={!aceiteTermos}
            >
              Cadastrar
            </Button>

            {message && (
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{message}</p>
            )}
            {erro && <p className="text-red-600 dark:text-red-400 text-sm text-center">{erro}</p>}
            {sucesso && (
              <p className="text-green-600 dark:text-green-400 text-sm text-center">{sucesso}</p>
            )}
          </form>
        )}
      </div>

      {/* Modal de Termos */}
      {mostrarModalTermos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[var(--border-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center transition-colors duration-300" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {carregandoTermos
                  ? "Carregando..."
                  : termos
                  ? tipoTermo === "termos"
                    ? termos.termosUso.titulo
                    : termos.politicaPrivacidade.titulo
                  : "Termos"}
              </h2>
              <button
                onClick={() => {
                  setMostrarModalTermos(false);
                  setCarregandoTermos(false);
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl font-bold transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {carregandoTermos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
                    <p className="text-[var(--text-secondary)]">Carregando termos...</p>
                  </div>
                </div>
              ) : termos ? (
                <>
                  <div className="mb-4 text-sm text-[var(--text-secondary)]">
                    <p>
                      Versão:{" "}
                      {tipoTermo === "termos"
                        ? termos.termosUso.versao
                        : termos.politicaPrivacidade.versao}
                    </p>
                    <p>
                      Data de atualização:{" "}
                      {tipoTermo === "termos"
                        ? termos.termosUso.dataAtualizacao
                        : termos.politicaPrivacidade.dataAtualizacao}
                    </p>
                  </div>
                  <div className="whitespace-pre-line text-sm text-[var(--text-primary)] leading-relaxed">
                    {tipoTermo === "termos"
                      ? termos.termosUso.conteudo
                      : termos.politicaPrivacidade.conteudo}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-red-600 dark:text-red-400 mb-4">
                    Erro ao carregar os termos.
                  </p>
                  <Button variant="primary" onClick={buscarTermos}>
                    Tentar novamente
                  </Button>
                </div>
              )}
            </div>
            {termos && !carregandoTermos && (
              <div className="p-6 border-t border-[var(--border-color)] flex gap-4 justify-end transition-colors duration-300" style={{ borderColor: 'var(--border-color)' }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (tipoTermo === "termos") {
                      setTipoTermo("privacidade");
                    } else {
                      setTipoTermo("termos");
                    }
                  }}
                >
                  {tipoTermo === "termos"
                    ? "Ver Política de Privacidade"
                    : "Ver Termos de Uso"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setAceiteTermos(true);
                    setMostrarModalTermos(false);
                  }}
                >
                  Aceitar e Fechar
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setMostrarModalTermos(false)}
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cadastrar;
