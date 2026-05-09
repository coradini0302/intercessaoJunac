import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SemanaCompromisso, CompromissoOracao, CompromissoIntercedido, CompromissoEquipe } from '../types';

// ── Legacy (mock only) ────────────────────────────────────────────────────────
export function useSemanas() {
  return useQuery<SemanaCompromisso[]>({
    queryKey: ['semanas'],
    queryFn: async () => {
      const { data } = await api.get('/api/compromissos-oracao/semanas');
      return data;
    },
    enabled: false,
  });
}

export function useMeusCompromissos(semana: number | undefined) {
  return useQuery<CompromissoOracao[]>({
    queryKey: ['meus-compromissos', semana],
    queryFn: async () => {
      const { data } = await api.get(`/api/compromissos-oracao/meus?semana=${semana}`);
      return data;
    },
    enabled: false,
  });
}

// ── Meus Compromissos Intercedidos (/api/compromissos-intercedidos) ───────────
export function useMeusIntercedidos(ativo = true) {
  return useQuery<CompromissoIntercedido[]>({
    queryKey: ['meus-intercedidos', ativo],
    queryFn: async () => {
      const { data } = await api.get(`/api/compromissos-intercedidos/meus?ativo=${ativo}`);
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useAdicionarIntercedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { titulo: string; conteudo: string }) => {
      const { data } = await api.post('/api/compromissos-intercedidos', body);
      return data as CompromissoIntercedido;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meus-intercedidos'] });
    },
  });
}

export function useEditarIntercedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number; titulo: string; conteudo: string }) => {
      const { data } = await api.put(`/api/compromissos-intercedidos/${id}`, body);
      return data as CompromissoIntercedido;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meus-intercedidos'] });
    },
  });
}

export function useArquivarIntercedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/api/compromissos-intercedidos/${id}/arquivar`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meus-intercedidos'] });
    },
  });
}

export function useDeletarIntercedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/compromissos-intercedidos/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meus-intercedidos'] });
    },
  });
}

// ── Compromissos da Equipe (/api/compromissos-equipe) ─────────────────────────
export function useCompromissosEquipe(encontroId: number | undefined) {
  return useQuery<CompromissoEquipe[]>({
    queryKey: ['compromissos-equipe', encontroId],
    queryFn: async () => {
      const { data } = await api.get(`/api/compromissos-equipe?encontroId=${encontroId}`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!encontroId,
  });
}

export function useAdicionarCompromissoEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { encontroId: number; numeroSemana: number; titulo: string; conteudo: string }) => {
      const { data } = await api.post('/api/compromissos-equipe', body);
      return data as CompromissoEquipe;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['compromissos-equipe'] });
    },
  });
}

export function useEditarCompromissoEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number; titulo: string; conteudo: string }) => {
      const { data } = await api.put(`/api/compromissos-equipe/${id}`, body);
      return data as CompromissoEquipe;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['compromissos-equipe'] });
    },
  });
}

export function useDeletarCompromissoEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/compromissos-equipe/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['compromissos-equipe'] });
    },
  });
}
