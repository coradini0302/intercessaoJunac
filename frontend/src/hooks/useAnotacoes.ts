import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Anotacao } from '../types';

export function useAnotacoes() {
  return useQuery<Anotacao[]>({
    queryKey: ['anotacoes'],
    queryFn: async () => {
      const { data } = await api.get('/api/anotacoes');
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useAnotacao(id: number | undefined) {
  return useQuery<Anotacao>({
    queryKey: ['anotacao', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/anotacoes/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCriarAnotacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { titulo?: string; conteudo: string }) => {
      const { data } = await api.post('/api/anotacoes', body);
      return data as Anotacao;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anotacoes'] }),
  });
}

export function useEditarAnotacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number; titulo?: string; conteudo: string }) => {
      const { data } = await api.put(`/api/anotacoes/${id}`, body);
      return data as Anotacao;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['anotacoes'] });
      qc.invalidateQueries({ queryKey: ['anotacao', vars.id] });
    },
  });
}

export function useDeletarAnotacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/anotacoes/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anotacoes'] }),
  });
}
