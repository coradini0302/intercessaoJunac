import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ReuniaoResumo } from '../types';

export function useReuniaoResumos() {
  return useQuery<ReuniaoResumo[]>({
    queryKey: ['reuniao-resumos'],
    queryFn: async () => {
      const { data } = await api.get('/api/reuniao-resumos');
      return Array.isArray(data) ? data : [];
    },
  });
}

type ResumoPayload = { titulo: string; conteudo: string; dataReuniao: string };

export function useCriarReuniaoResumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ResumoPayload) => {
      const { data } = await api.post('/api/reuniao-resumos', body);
      return data as ReuniaoResumo;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reuniao-resumos'] });
    },
  });
}

export function useEditarReuniaoResumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number } & ResumoPayload) => {
      const { data } = await api.put(`/api/reuniao-resumos/${id}`, body);
      return data as ReuniaoResumo;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reuniao-resumos'] });
    },
  });
}

export function useDeletarReuniaoResumo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/reuniao-resumos/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reuniao-resumos'] });
    },
  });
}
