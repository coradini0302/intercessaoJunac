import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AgendaSemanal } from '../types';

export function useAgendaAtual(encontroId: number | undefined) {
  return useQuery<AgendaSemanal>({
    queryKey: ['agenda-atual', encontroId],
    queryFn: async () => {
      const { data } = await api.get(`/api/agenda-semanal/atual?encontroId=${encontroId}`);
      return data;
    },
    enabled: !!encontroId,
  });
}

export function useAgendas(encontroId: number | undefined) {
  return useQuery<AgendaSemanal[]>({
    queryKey: ['agendas', encontroId],
    queryFn: async () => {
      const { data } = await api.get(`/api/agenda-semanal?encontroId=${encontroId}`);
      return data;
    },
    enabled: !!encontroId,
  });
}

export function useAgendaSemana(encontroId: number | undefined, semana: number | undefined) {
  return useQuery<AgendaSemanal>({
    queryKey: ['agenda-semana', encontroId, semana],
    queryFn: async () => {
      const { data } = await api.get(`/api/agenda-semanal?encontroId=${encontroId}&semana=${semana}`);
      return data;
    },
    enabled: !!encontroId && !!semana,
  });
}

export function useCriarAgenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { numeroSemana: number; titulo: string; conteudo?: string; encontroId: number }) => {
      const { data } = await api.post('/api/agenda-semanal', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendas'] }),
  });
}

export function useEditarAgenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number; titulo: string; conteudo?: string }) => {
      const { data } = await api.put(`/api/agenda-semanal/${id}`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agendas'] });
      qc.invalidateQueries({ queryKey: ['agenda-atual'] });
    },
  });
}

export function useDeletarAgenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/agenda-semanal/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agendas'] }),
  });
}
