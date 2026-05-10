import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { MembroEquipe, UsuarioAdmin, Perfil } from '../types';

export function usePerfil() {
  return useQuery<Perfil>({
    queryKey: ['perfil'],
    queryFn: async () => {
      const { data } = await api.get('/api/auth/perfil');
      return data;
    },
  });
}

export function useEquipe() {
  return useQuery<MembroEquipe[]>({
    queryKey: ['equipe'],
    queryFn: async () => {
      const { data } = await api.get('/api/usuarios/equipe');
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useUsuariosAdmin() {
  return useQuery<UsuarioAdmin[]>({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data } = await api.get('/api/usuarios');
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useAtualizarPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { nome: string; apelido?: string | null }) => {
      const { data } = await api.put('/api/auth/perfil', body);
      return data as { perfil: Perfil; novoToken: string; expiracao: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['perfil'] }),
  });
}

export function useUploadFoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('foto', file);
      const { data } = await api.post('/api/auth/perfil/foto', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as { fotoUrl: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['perfil'] }),
  });
}

export function useRemoverFoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/api/auth/perfil/foto');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['perfil'] }),
  });
}

export function useCriarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { nome: string; apelido?: string | null; login: string; role: string }) => {
      const { data } = await api.post('/api/usuarios', body);
      return data as { usuario: UsuarioAdmin; senhaTemporaria: string; mensagem: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useEditarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; nome: string; apelido?: string | null; email?: string | null; role?: string | null }) => {
      await api.put(`/api/usuarios/${id}`, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useAtivarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/usuarios/${id}/ativar`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useDesativarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/usuarios/${id}/desativar`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useResetarSenha() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/api/usuarios/${id}/resetar-senha`);
      return data as { senhaTemporaria: string; mensagem: string };
    },
  });
}
