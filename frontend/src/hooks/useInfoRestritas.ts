import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { InformacaoRestrita } from '../types';

export function useInfoRestritas(encontroId: number | undefined) {
  return useQuery<InformacaoRestrita[]>({
    queryKey: ['info-restritas', encontroId],
    queryFn: async () => {
      const { data } = await api.get(`/api/informacoes-restritas?encontroId=${encontroId}`);
      return data;
    },
    enabled: !!encontroId,
  });
}

export function useInfoRestrita(id: number | undefined) {
  return useQuery<InformacaoRestrita>({
    queryKey: ['info-restrita', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/informacoes-restritas/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCriarInfoRestrita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { titulo: string; conteudo: string; encontroId: number }) => {
      const { data } = await api.post('/api/informacoes-restritas', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['info-restritas'] }),
  });
}

export function useEditarInfoRestrita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number; titulo: string; conteudo: string }) => {
      const { data } = await api.put(`/api/informacoes-restritas/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['info-restritas'] }),
  });
}

export function useDeletarInfoRestrita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/informacoes-restritas/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['info-restritas'] }),
  });
}
