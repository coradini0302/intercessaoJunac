import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Aviso } from '../types';

export function useAvisos(encontroId: number | undefined) {
  return useQuery<Aviso[]>({
    queryKey: ['avisos', encontroId],
    queryFn: async () => {
      const { data } = await api.get(`/api/avisos?encontroId=${encontroId}`);
      return data;
    },
    enabled: !!encontroId,
  });
}

export function useAviso(id: number | undefined) {
  return useQuery<Aviso>({
    queryKey: ['aviso', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/avisos/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useComentarAviso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ avisoId, texto }: { avisoId: number; texto: string }) => {
      const { data } = await api.post(`/api/avisos/${avisoId}/comentarios`, { texto });
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['aviso', vars.avisoId] });
    },
  });
}

export function useDeletarComentario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ avisoId, comentarioId }: { avisoId: number; comentarioId: number }) => {
      await api.delete(`/api/avisos/${avisoId}/comentarios/${comentarioId}`);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['aviso', vars.avisoId] });
    },
  });
}

export function useCriarAviso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { titulo: string; conteudo: string; permiteComentarios: boolean; encontroId: number }) => {
      const { data } = await api.post('/api/avisos', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['avisos'] }),
  });
}

export function useEditarAviso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number; titulo: string; conteudo: string; permiteComentarios: boolean; ativo: boolean }) => {
      const { data } = await api.put(`/api/avisos/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['avisos'] }),
  });
}

export function useDeletarAviso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/avisos/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['avisos'] }),
  });
}

export function useUploadMidiaAviso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const form = new FormData();
      form.append('arquivo', file);
      const { data } = await api.post(`/api/avisos/${id}/midia`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as { urlMidia: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['avisos'] }),
  });
}
