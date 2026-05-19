import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { DinamicaMembrosTipo, DinamicaPost, TipoDinamica } from '../types';

export function useMinhasDinamicas() {
  return useQuery<TipoDinamica[]>({
    queryKey: ['dinamicas', 'minhas'],
    queryFn: async () => {
      const { data } = await api.get('/api/dinamicas/minhas');
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useDinamicasMembros() {
  return useQuery<DinamicaMembrosTipo[]>({
    queryKey: ['dinamicas', 'membros'],
    queryFn: async () => {
      const { data } = await api.get('/api/dinamicas/membros');
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useSetDinamicaMembros() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tipo, usuarioIds }: { tipo: number; usuarioIds: string[] }) => {
      await api.put(`/api/dinamicas/${tipo}/membros`, { usuarioIds });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dinamicas', 'membros'] });
    },
  });
}

export function useDinamicaPosts(tipo: number | null) {
  return useQuery<DinamicaPost[]>({
    queryKey: ['dinamicas', 'posts', tipo],
    queryFn: async () => {
      const { data } = await api.get(`/api/dinamicas/${tipo}/posts`);
      return Array.isArray(data) ? data : [];
    },
    enabled: tipo !== null,
  });
}

type PostPayload = { titulo?: string; conteudo: string };

export function useCriarDinamicaPost(tipo: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: PostPayload) => {
      const { data } = await api.post(`/api/dinamicas/${tipo}/posts`, body);
      return data as DinamicaPost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dinamicas', 'posts', tipo] });
    },
  });
}

export function useEditarDinamicaPost(tipo: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number } & PostPayload) => {
      const { data } = await api.put(`/api/dinamicas/${tipo}/posts/${id}`, body);
      return data as DinamicaPost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dinamicas', 'posts', tipo] });
    },
  });
}

export function useDeletarDinamicaPost(tipo: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: number) => {
      await api.delete(`/api/dinamicas/${tipo}/posts/${postId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dinamicas', 'posts', tipo] });
    },
  });
}
