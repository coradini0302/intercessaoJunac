import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Votacao } from '../types';

export function useVotacoes(encontroId: number | undefined) {
  return useQuery<Votacao[]>({
    queryKey: ['votacoes', encontroId],
    queryFn: async () => {
      const { data } = await api.get(`/api/votacoes?encontroId=${encontroId}`);
      return data;
    },
    enabled: !!encontroId,
  });
}

export function useVotacao(id: number | undefined) {
  return useQuery<Votacao>({
    queryKey: ['votacao', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/votacoes/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useVotar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ votacaoId, opcaoId }: { votacaoId: number; opcaoId: number }) => {
      const { data } = await api.post(`/api/votacoes/${votacaoId}/votar`, { opcaoId });
      return data as Votacao;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['votacao', vars.votacaoId] });
      qc.invalidateQueries({ queryKey: ['votacoes'] });
    },
  });
}

export function useCriarVotacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { pergunta: string; descricao?: string; opcoes: string[]; dataFim?: string; encontroId: number }) => {
      const { data } = await api.post('/api/votacoes', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['votacoes'] }),
  });
}

export function useEncerrarVotacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/api/votacoes/${id}/encerrar`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['votacoes'] });
      qc.invalidateQueries({ queryKey: ['votacao'] });
    },
  });
}

export function useDeletarVotacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/votacoes/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['votacoes'] }),
  });
}
