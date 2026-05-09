import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { LoginResponse, Role } from '../types';

const IS_MOCK = import.meta.env.VITE_MOCK === 'true';
const MOCK_USER = IS_MOCK ? {
  userId: 'user-1', nome: 'Gabriel Coradini', email: 'gabriel@junac.com',
  role: 'Admin' as Role, trocaSenhaObrigatoria: false,
} : null;
const MOCK_TOKEN = IS_MOCK ? 'mock-token' : null;

interface AuthUser {
  userId: string;
  nome: string;
  email: string;
  role: Role;
  trocaSenhaObrigatoria: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  updateToken: (data: LoginResponse) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseUser(data: LoginResponse): AuthUser {
  return {
    userId: data.userId,
    nome: data.nome,
    email: data.email,
    role: data.role,
    trocaSenhaObrigatoria: data.trocaSenhaObrigatoria,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => MOCK_TOKEN ?? localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (MOCK_USER) return MOCK_USER;
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((data: LoginResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(parseUser(data)));
    setToken(data.token);
    setUser(parseUser(data));
  }, []);

  const updateToken = useCallback((data: LoginResponse) => {
    login(data);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const t = localStorage.getItem('token');
      if (!t) {
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
