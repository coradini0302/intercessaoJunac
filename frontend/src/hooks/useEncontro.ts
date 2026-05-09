import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Encontro } from '../types';

export function useEncontroAtivo() {
  return useQuery<Encontro>({
    queryKey: ['encontro-ativo'],
    queryFn: async () => {
      const { data } = await api.get('/api/encontros/ativo');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
