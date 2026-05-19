import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AltoMarIdeia, AltoMarComentario } from '../types';

export function useAltoMarIdeias() {
  return useQuery<AltoMarIdeia[]>({
    queryKey: ['alto-mar'],
    queryFn: async () => {
      const { data } = await api.get('/api/alto-mar');
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCriarAltoMarIdeia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { titulo: string; conteudo: string }) => {
      const { data } = await api.post('/api/alto-mar', body);
      return data as AltoMarIdeia;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alto-mar'] }),
  });
}

export function useEditarAltoMarIdeia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number; titulo: string; conteudo: string }) => {
      const { data } = await api.put(`/api/alto-mar/${id}`, body);
      return data as AltoMarIdeia;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alto-mar'] }),
  });
}

export function useDeletarAltoMarIdeia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/alto-mar/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alto-mar'] }),
  });
}

export function useCriarAltoMarComentario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ideiaId, texto }: { ideiaId: number; texto: string }) => {
      const { data } = await api.post(`/api/alto-mar/${ideiaId}/comentarios`, { texto });
      return data as AltoMarComentario;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alto-mar'] }),
  });
}

export function useDeletarAltoMarComentario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ideiaId, comentarioId }: { ideiaId: number; comentarioId: number }) => {
      await api.delete(`/api/alto-mar/${ideiaId}/comentarios/${comentarioId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alto-mar'] }),
  });
}
