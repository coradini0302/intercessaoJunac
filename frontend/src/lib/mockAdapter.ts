import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  mockEncontro, mockPerfil, mockEquipe, mockUsuariosAdmin,
  mockAvisos, mockEscalas, mockSemanas, mockMeusCompromissos,
  mockAgendaAtual, mockAgendas, mockVotacoes, mockAnotacoes, mockInfoRestritas,
} from './mockData';

function ok(data: unknown): AxiosResponse {
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} as InternalAxiosRequestConfig, request: {} };
}

function getMockData(method: string, url: string): unknown {
  const u = url.split('?')[0];

  if (method === 'get') {
    if (u === '/api/encontros/ativo') return mockEncontro;
    if (u === '/api/auth/perfil') return mockPerfil;
    if (u === '/api/usuarios/equipe') return mockEquipe;
    if (u === '/api/usuarios') return mockUsuariosAdmin;

    if (u === '/api/avisos') return mockAvisos;
    if (u.match(/^\/api\/avisos\/\d+$/)) {
      const id = Number(u.split('/').pop());
      return mockAvisos.find((a) => a.id === id) ?? mockAvisos[0];
    }

    if (u === '/api/escalas') return mockEscalas;
    if (u === '/api/escalas/minhas') return mockEscalas.slice(0, 1);
    if (u.match(/^\/api\/escalas\/\d+$/)) {
      const id = Number(u.split('/').pop());
      return mockEscalas.find((e) => e.id === id) ?? mockEscalas[0];
    }

    if (u === '/api/compromissos-oracao/semanas') return mockSemanas;
    if (u === '/api/compromissos-oracao/meus') return mockMeusCompromissos;
    if (u === '/api/compromissos-oracao') return mockMeusCompromissos;
    if (u === '/api/compromissos-intercedidos/meus') return [];
    if (u === '/api/compromissos-equipe') return [];

    if (u === '/api/agenda-semanal/atual') return mockAgendaAtual;
    if (u === '/api/agenda-semanal') return mockAgendas;
    if (u.match(/^\/api\/agenda-semanal\/\d+$/)) return mockAgendaAtual;

    if (u === '/api/votacoes') return mockVotacoes;
    if (u.match(/^\/api\/votacoes\/\d+$/)) {
      const id = Number(u.split('/').pop());
      return mockVotacoes.find((v) => v.id === id) ?? mockVotacoes[0];
    }

    if (u === '/api/anotacoes') return mockAnotacoes;
    if (u.match(/^\/api\/anotacoes\/\d+$/)) {
      const id = Number(u.split('/').pop());
      return mockAnotacoes.find((a) => a.id === id) ?? mockAnotacoes[0];
    }

    if (u === '/api/informacoes-restritas') return mockInfoRestritas;
    if (u.match(/^\/api\/informacoes-restritas\/\d+$/)) return mockInfoRestritas[0];
  }

  // POST mutations — return sensible responses
  if (method === 'post') {
    if (u === '/api/auth/login') return { token: 'mock-token', userId: 'user-1', nome: 'Gabriel Coradini', email: 'gabriel@junac.com', role: 'Admin', trocaSenhaObrigatoria: false, expiracao: '2026-12-31T23:59:59' };
    if (u === '/api/auth/trocar-senha') return { token: 'mock-token', userId: 'user-1', nome: 'Gabriel Coradini', email: 'gabriel@junac.com', role: 'Admin', trocaSenhaObrigatoria: false, expiracao: '2026-12-31T23:59:59' };
    if (u.match(/\/votar$/)) return { ...mockVotacoes[0], jaVotei: true };
    if (u.match(/\/encerrar$/)) return { ...mockVotacoes[0], ativa: false };
    if (u === '/api/usuarios') return { usuario: mockUsuariosAdmin[0], senhaTemporaria: 'Senha@123', mensagem: 'Usuário criado.' };
    if (u.match(/\/resetar-senha$/)) return { senhaTemporaria: 'Nova@456', mensagem: 'Senha resetada.' };
    if (u.match(/\/ativar$/) || u.match(/\/desativar$/) || u.match(/\/foto$/)) return {};
    if (u.match(/\/comentarios$/)) return { id: 99, usuarioId: 'user-1', nomeUsuario: 'Gabriel Coradini', apelidoUsuario: 'Ronaldo', texto: 'Comentário adicionado', criadoEm: new Date().toISOString() };
    if (u.match(/\/participantes$/)) return { id: 99, usuarioId: 'user-1', nomeUsuario: 'Gabriel Coradini', apelido: 'Ronaldo', fotoUrl: null, funcao: null, confirmado: false };
    return {};
  }

  // PUT / DELETE
  if (method === 'put') {
    if (u === '/api/auth/perfil') return { perfil: mockPerfil, novoToken: 'mock-token', expiracao: '2026-12-31T23:59:59' };
    return {};
  }
  if (method === 'delete') return null;

  return {};
}

export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await new Promise((r) => setTimeout(r, 120));
  const method = (config.method ?? 'get').toLowerCase();
  const url = config.url ?? '';
  const data = getMockData(method, url);
  return ok(data);
}
