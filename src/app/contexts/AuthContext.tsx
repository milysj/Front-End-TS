"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, removeToken, setToken } from '../services/authHelpers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  id: string;
  nome: string;
  email: string;
  username: string | null;
  personagem: string | null;
  tipoUsuario: 'ALUNO' | 'PROFESSOR' | 'ADMINISTRADOR' | null;
  // ... outros campos
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setAuthState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const savedToken = getToken();
      if (savedToken) {
        try {
          const res = await fetch(`${API_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setAuthState(savedToken);
          } else {
            removeToken();
            setUser(null);
            setAuthState(null);
          }
        } catch (error) {
          console.error("Erro ao carregar usuário:", error);
          removeToken();
          setUser(null);
          setAuthState(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    setAuthState(newToken);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        throw new Error("Falha ao buscar dados do usuário após o login");
      }
    } catch (error) {
      console.error(error);
      // Mesmo com erro no fetch, o token está salvo. O que fazer?
      // Por enquanto, deixamos o usuário como null e o token setado.
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setAuthState(null);
    // Opcional: redirecionar para a página de login
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, token, login, logout, loading }}>
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
