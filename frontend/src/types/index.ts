export type Role = 'DevAdmin' | 'Admin' | 'Intercessor';

export interface LoginResponse {
  token: string;
  userId: string;
  nome: string;
  email: string;
  role: Role;
  trocaSenhaObrigatoria: boolean;
  expiracao: string;
}

export interface Perfil {
  id: string;
  nome: string;
  apelido: string | null;
  email: string;
  fotoUrl: string | null;
  role: Role;
  trocouSenha: boolean;
  ativo: boolean;
  criadoEm: string;
}

export interface PerfilPublico {
  id: string;
  nome: string;
  apelido: string | null;
  fotoUrl: string | null;
  role: Role;
}

export interface MembroEquipe {
  id: string;
  nome: string;
  apelido: string | null;
  fotoUrl: string | null;
  role: Role;
}

export interface UsuarioAdmin {
  id: string;
  nome: string;
  apelido: string | null;
  email: string;
  role: Role;
  ativo: boolean;
  trocouSenha: boolean;
  criadoEm: string;
}

export interface Encontro {
  id: number;
  nome: string;
  descricao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  status: 0 | 1 | 2 | 3;
  statusDescricao: string;
  criadoEm: string;
}

export interface ParticipanteEscala {
  id: number;
  usuarioId: string;
  nomeUsuario: string;
  apelido: string | null;
  fotoUrl: string | null;
  funcao: string | null;
  confirmado: boolean;
}

export interface Escala {
  id: number;
  encontroId: number;
  titulo: string;
  descricao: string | null;
  dataHora: string | null;
  local: string | null;
  status: 0 | 1 | 2;
  statusDescricao: string;
  responsavelId: string | null;
  nomeResponsavel: string | null;
  apelidoResponsavel: string | null;
  criadoEm: string;
  participantes: ParticipanteEscala[];
}

export type TipoMidia = 0 | 1 | 2;

export interface Comentario {
  id: number;
  usuarioId: string;
  nomeUsuario: string;
  apelidoUsuario: string | null;
  texto: string;
  criadoEm: string;
}

export interface Aviso {
  id: number;
  encontroId: number;
  titulo: string;
  conteudo: string;
  permiteComentarios: boolean;
  tipoMidia: TipoMidia;
  urlMidia: string | null;
  ativo: boolean;
  criadoPorId: string;
  nomeCriador: string;
  criadoEm: string;
  atualizadoEm: string | null;
  totalComentarios: number;
  comentarios: Comentario[];
}

export interface Anotacao {
  id: number;
  titulo: string | null;
  conteudo: string;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface InformacaoRestrita {
  id: number;
  encontroId: number;
  titulo: string;
  conteudo: string;
  criadoPorId: string;
  nomeCriador: string;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface SemanaCompromisso {
  numeroSemana: number;
  dataInicio: string;
  dataFim: string;
  atual: boolean;
  meuRegistroFeito: boolean;
  totalRegistros: number;
}

export interface CompromissoOracao {
  id: number;
  usuarioId: string;
  nomeUsuario: string;
  apelidoUsuario: string | null;
  fotoUrl: string | null;
  numeroSemana: number;
  dataInicioSemana: string;
  dataFimSemana: string;
  conteudo: string;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface CompromissoIntercedido {
  id: number;
  titulo: string;
  conteudo: string;
  ativo: boolean;
  equipeIntercessao: string | null;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface CompromissoEquipe {
  id: number;
  numeroSemana: number;
  dataInicioSemana: string;
  dataFimSemana: string;
  semanaAtual: boolean;
  titulo: string;
  conteudo: string | null;
  nomeCriadoPor: string;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface AgendaSemanal {
  id: number;
  encontroId: number;
  numeroSemana: number;
  titulo: string;
  conteudo: string | null;
  dataInicio: string;
  dataFim: string;
  semanaAtual: boolean;
  criadoPorId: string;
  nomeCriador: string;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface OpcaoVotacao {
  id: number;
  texto: string;
  ordem: number;
  totalVotos: number;
  percentual: number;
}

export interface Votacao {
  id: number;
  encontroId: number;
  pergunta: string;
  descricao: string | null;
  ativa: boolean;
  dataFim: string | null;
  criadoPorId: string;
  nomeCriador: string;
  criadoEm: string;
  totalVotos: number;
  jaVotei: boolean;
  minhaOpcaoId: number | null;
  opcoes: OpcaoVotacao[];
}

export interface ApiError {
  erro?: string;
  erros?: string[];
  codigo?: string;
}
