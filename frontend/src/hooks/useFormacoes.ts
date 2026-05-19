import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Formacao } from '../types';

export function useFormacoes() {
  return useQuery<Formacao[]>({
    queryKey: ['formacoes'],
    queryFn: async () => {
      const { data } = await api.get('/api/formacoes');
      return Array.isArray(data) ? data : [];
    },
  });
}

type FormacaoPayload = { titulo: string; conteudo: string };

export function useCriarFormacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: FormacaoPayload) => {
      const { data } = await api.post('/api/formacoes', body);
      return data as Formacao;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['formacoes'] }),
  });
}

export function useEditarFormacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number } & FormacaoPayload) => {
      const { data } = await api.put(`/api/formacoes/${id}`, body);
      return data as Formacao;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['formacoes'] }),
  });
}

export function useDeletarFormacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/formacoes/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['formacoes'] }),
  });
}
