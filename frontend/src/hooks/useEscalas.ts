import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Escala } from '../types';

export function useEscalas(encontroId: number | undefined) {
  return useQuery<Escala[]>({
    queryKey: ['escalas', encontroId],
    queryFn: async () => {
      const { data } = await api.get(`/api/escalas?encontroId=${encontroId}`);
      return data;
    },
    enabled: !!encontroId,
  });
}

export function useMinhasEscalas(encontroId: number | undefined) {
  return useQuery<Escala[]>({
    queryKey: ['escalas-minhas', encontroId],
    queryFn: async () => {
      const { data } = await api.get(`/api/escalas/minhas?encontroId=${encontroId}`);
      return data;
    },
    enabled: !!encontroId,
  });
}

export function useEscala(id: number | undefined) {
  return useQuery<Escala>({
    queryKey: ['escala', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/escalas/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCriarEscala() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { titulo: string; descricao?: string; dataHora?: string; local?: string; encontroId: number; responsavelId?: string | null }) => {
      const { data } = await api.post('/api/escalas', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['escalas'] }),
  });
}

export function useEditarEscala() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number; titulo: string; descricao?: string; dataHora?: string; local?: string; status: number; responsavelId?: string | null }) => {
      const { data } = await api.put(`/api/escalas/${id}`, body);
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['escalas'] });
      qc.invalidateQueries({ queryKey: ['escala', vars.id] });
    },
  });
}

export function useDeletarEscala() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/escalas/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['escalas'] }),
  });
}

export function useAdicionarParticipante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ escalaId, usuarioId, funcao }: { escalaId: number; usuarioId: string; funcao?: string }) => {
      const { data } = await api.post(`/api/escalas/${escalaId}/participantes`, { usuarioId, funcao });
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['escala', vars.escalaId] });
      qc.invalidateQueries({ queryKey: ['escalas'] });
    },
  });
}

export function useRemoverParticipante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ escalaId, participanteId }: { escalaId: number; participanteId: number }) => {
      await api.delete(`/api/escalas/${escalaId}/participantes/${participanteId}`);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['escala', vars.escalaId] });
      qc.invalidateQueries({ queryKey: ['escalas'] });
    },
  });
}
