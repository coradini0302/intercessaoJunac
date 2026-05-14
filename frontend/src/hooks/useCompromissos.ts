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

// ── Compromissos Intercedidos (/api/compromissos-intercedidos) ────────────────
export function useIntercedidos(ativo?: boolean) {
  return useQuery<CompromissoIntercedido[]>({
    queryKey: ['intercedidos', ativo],
    queryFn: async () => {
      const params = ativo !== undefined ? `?ativo=${ativo}` : '';
      const { data } = await api.get(`/api/compromissos-intercedidos${params}`);
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useMeusIntercedidos(ativo?: boolean) {
  return useIntercedidos(ativo);
}

type IntercedidoPayload = { titulo: string; conteudo?: string | null; dataHora?: string | null; diaInteiro?: boolean };

export function useAdicionarIntercedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: IntercedidoPayload) => {
      const { data } = await api.post('/api/compromissos-intercedidos', body);
      return data as CompromissoIntercedido;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['intercedidos'] });
    },
  });
}

export function useEditarIntercedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number } & IntercedidoPayload) => {
      const { data } = await api.put(`/api/compromissos-intercedidos/${id}`, body);
      return data as CompromissoIntercedido;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['intercedidos'] });
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
      qc.invalidateQueries({ queryKey: ['intercedidos'] });
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
      qc.invalidateQueries({ queryKey: ['intercedidos'] });
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

type EquipePayload = { titulo: string; conteudo?: string | null; dataHora?: string | null; diaInteiro?: boolean };

export function useAdicionarCompromissoEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { encontroId: number; numeroSemana: number } & EquipePayload) => {
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
    mutationFn: async ({ id, ...body }: { id: number } & EquipePayload) => {
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
