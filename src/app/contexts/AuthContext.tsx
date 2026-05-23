"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, removeToken, setToken } from '../services/authHelpers';
import Cookies from 'js-cookie';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

interface User {
  id?: string;
  _id?: string;
  nome: string;
  email: string;
  username: string | null;
  personagem: string | null;
  tipoUsuario: 'ALUNO' | 'PROFESSOR' | 'ADMINISTRADOR' | 'OWNER' | null;
  tema?: string;
  idioma?: string;
  fotoPerfil?: string;
  xpTotal?: number;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
  status?: 'ATIVO' | 'BLOQUEADO' | 'BANIDO';
  bloqueadoAte?: Date | null;
  canPromoteToAdmin?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, userData?: User) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
  updateUserTheme: (novoTema: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setAuthState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();
  const pathname = usePathname();

  const handleSetUser = (userData: User) => {
    setUser(userData);
    if (userData.tema) {
      setTheme(userData.tema);
    }
  };

  const saveSafeCookie = (userData: User) => {
    const { tipoUsuario, ...safeData } = userData;
    Cookies.set('user_data', JSON.stringify(safeData), { expires: 7 });
  };

  useEffect(() => {
    const loadUser = async () => {
      const savedToken = getToken();
      if (!savedToken) {
        setLoading(false);
        return;
      }

      setAuthState(savedToken);

      // Tenta ler os dados cacheados nos cookies
      const cachedUserDataStr = Cookies.get('user_data');
      let hasCachedData = false;
      let cachedTipoUsuario = null;

      const tokenPayload = parseJwt(savedToken);
      if (tokenPayload && tokenPayload.tipoUsuario) {
        cachedTipoUsuario = tokenPayload.tipoUsuario;
      }

      if (cachedUserDataStr) {
        try {
          const cachedUser = JSON.parse(cachedUserDataStr) as User;
          cachedUser.tipoUsuario = cachedTipoUsuario; // Injeta de forma segura a partir do JWT assinado
          handleSetUser(cachedUser);
          hasCachedData = true;
        } catch (e) {
          console.error("Erro ao fazer parse do cookie user_data", e);
        }
      }

      // Verifica se a página atual exige validação rigorosa de professor/admin
      const isProfessorRoute = pathname && (
        pathname.startsWith("/gerenciarTrilha") ||
        pathname.startsWith("/gerenciarFases") ||
        pathname.startsWith("/criarFase") ||
        pathname.startsWith("/gerenciarPerguntas")
      );

      if (hasCachedData) {
        if (cachedTipoUsuario === 'ALUNO') {
          // Aluno sempre pula
          setLoading(false);
          return;
        }

        const isProfAdmin = cachedTipoUsuario === 'PROFESSOR' || cachedTipoUsuario === 'ADMINISTRADOR' || cachedTipoUsuario === 'OWNER';
        
        if (isProfAdmin && !isProfessorRoute) {
          // Professor e Admin pulam o fetch, EXCETO nas rotas sensíveis
          setLoading(false);
          return;
        }
      }

      // Se não tiver cookie ou for Prof/Admin numa rota sensível, faz o fetch para garantir segurança/atualização
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          handleSetUser(userData);
          // Atualiza o cookie sem expor a role
          saveSafeCookie(userData);
        } else {
          logout(); // se token estiver inválido
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        // Não faz logout em falha de rede se já tem cookie
        if (!hasCachedData) {
           logout();
        }
      }
      
      setLoading(false);
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (newToken: string, userData?: User) => {
    setToken(newToken);
    setAuthState(newToken);
    setLoading(true);
    try {
      if (userData) {
        handleSetUser(userData);
        saveSafeCookie(userData);
      } else {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        if (res.ok) {
          const fetchedUserData = await res.json();
          handleSetUser(fetchedUserData);
          saveSafeCookie(fetchedUserData);
        } else {
          throw new Error("Falha ao buscar dados do usuário após o login");
        }
      }
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    Cookies.remove('user_data');
    setUser(null);
    setAuthState(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const fetchedUserData = await res.json();
        handleSetUser(fetchedUserData);
        saveSafeCookie(fetchedUserData);
      }
    } catch (error) {
      console.error("Erro ao dar refresh no usuário:", error);
    }
  };

  const updateUserTheme = async (novoTema: string) => {
    if (!user || !token) return;

    const updatedUser = { ...user, tema: novoTema };
    setUser(updatedUser);
    saveSafeCookie(updatedUser);
    
    try {
      await fetch(`${API_URL}/api/users/tema`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tema: novoTema }),
      });
    } catch (error) {
      console.error("Erro ao salvar tema no backend:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, token, login, logout, refreshUser, loading, updateUserTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
