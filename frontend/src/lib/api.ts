import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types';
import { mockAdapter } from './mockAdapter';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const IS_MOCK = import.meta.env.VITE_MOCK === 'true';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  adapter: IS_MOCK ? mockAdapter : undefined,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (
      error.response?.status === 403 &&
      error.response.data?.codigo === 'TROCA_SENHA_OBRIGATORIA'
    ) {
      window.location.href = '/trocar-senha';
    }
    return Promise.reject(error);
  }
);

export function buildImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError;
    if (data?.erros?.length) return data.erros.join(', ');
    if (data?.erro) return data.erro;
    if (error.response?.status === 404) return 'Recurso não encontrado.';
    if (error.response?.status === 409) return 'Conflito: operação não permitida.';
    if (error.response?.status === 403) return 'Sem permissão para esta ação.';
  }
  return 'Erro inesperado. Tente novamente.';
}
