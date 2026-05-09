import type {
  Encontro, Perfil, MembroEquipe, UsuarioAdmin, Aviso, Escala,
  SemanaCompromisso, CompromissoOracao, AgendaSemanal, Votacao,
  Anotacao, InformacaoRestrita,
} from '../types';

export const mockEncontro: Encontro = {
  id: 1,
  nome: 'JUNAC XXIX',
  descricao: '29º Encontro de Jovens e Adultos no Caminho',
  dataInicio: '2026-08-22T00:00:00',
  dataFim: '2026-08-24T00:00:00',
  status: 1,
  statusDescricao: 'Ativo',
  criadoEm: '2026-01-10T10:00:00',
};

export const mockPerfil: Perfil = {
  id: 'user-1',
  nome: 'Gabriel Coradini',
  apelido: 'Ronaldo',
  email: 'gabrielcoradini3@gmail.com',
  fotoUrl: null,
  role: 'Admin',
  trocouSenha: true,
  ativo: true,
  criadoEm: '2026-01-10T10:00:00',
};

export const mockEquipe: MembroEquipe[] = [
  { id: 'user-1',  nome: 'Gabriel Coradini',  apelido: 'Ronaldo',     fotoUrl: null, role: 'Admin' },
  { id: 'user-2',  nome: 'Luana Ferreira',    apelido: 'Luana',       fotoUrl: null, role: 'Intercessor' },
  { id: 'user-3',  nome: 'Mavi Santos',       apelido: 'Mavi',        fotoUrl: null, role: 'Intercessor' },
  { id: 'user-4',  nome: 'João Pedro Silva',  apelido: 'João',        fotoUrl: null, role: 'Intercessor' },
  { id: 'user-5',  nome: 'Lara Oliveira',     apelido: 'Lara',        fotoUrl: null, role: 'Intercessor' },
  { id: 'user-6',  nome: 'Amanda Costa',      apelido: 'Amanda',      fotoUrl: null, role: 'Intercessor' },
  { id: 'user-7',  nome: 'Maria Clara Lima',  apelido: 'Maria Clara', fotoUrl: null, role: 'Intercessor' },
  { id: 'user-8',  nome: 'Alicia Rodrigues',  apelido: 'Alicia',      fotoUrl: null, role: 'Intercessor' },
  { id: 'user-9',  nome: 'Loss Nascimento',   apelido: 'Loss',        fotoUrl: null, role: 'Intercessor' },
  { id: 'user-10', nome: 'Kadu Mendes',       apelido: 'Kadu',        fotoUrl: null, role: 'Intercessor' },
  { id: 'user-11', nome: 'Cecilia Almeida',   apelido: 'Cecilia',     fotoUrl: null, role: 'Intercessor' },
  { id: 'user-12', nome: 'Otávio Carvalho',   apelido: 'Otávio',      fotoUrl: null, role: 'Intercessor' },
  { id: 'user-13', nome: 'Eduardo Duarte',    apelido: 'Dudu',        fotoUrl: null, role: 'Intercessor' },
  { id: 'user-14', nome: 'Leticia Martins',   apelido: 'Leticia',     fotoUrl: null, role: 'Intercessor' },
  { id: 'user-15', nome: 'Melyssa Pereira',   apelido: 'Melyssa',     fotoUrl: null, role: 'Intercessor' },
  { id: 'user-16', nome: 'Beatriz Alves',     apelido: 'Bia A',       fotoUrl: null, role: 'Intercessor' },
  { id: 'user-17', nome: 'Beatriz Rocha',     apelido: 'Bia R',       fotoUrl: null, role: 'Intercessor' },
  { id: 'user-18', nome: 'Ana Paula Souza',   apelido: 'Ana',         fotoUrl: null, role: 'Intercessor' },
  { id: 'user-19', nome: 'Luiza Campos',      apelido: 'Luiza',       fotoUrl: null, role: 'Intercessor' },
];

export const mockUsuariosAdmin: UsuarioAdmin[] = mockEquipe.map((m, i) => ({
  ...m,
  login: m.nome.split(' ')[0].toLowerCase(),
  email: `${m.nome.split(' ')[0].toLowerCase()}@junac.com`,
  ativo: true,
  trocouSenha: i !== 4,
  criadoEm: '2026-01-10T10:00:00',
}));

export const mockAvisos: Aviso[] = [
  {
    id: 1,
    encontroId: 1,
    titulo: '📢 Reunião de preparação — sábado às 9h',
    conteudo: 'Lembrem-se que este sábado temos nossa reunião de preparação presencial na igreja. A reunião começa às 9h e terminará ao meio-dia. Vamos cobrir em oração cada detalhe do encontro JUNAC XXIX. Tragam seus cadernos e corações abertos!',
    permiteComentarios: true,
    tipoMidia: 0,
    urlMidia: null,
    ativo: true,
    criadoPorId: 'user-1',
    nomeCriador: 'Gabriel Coradini',
    criadoEm: '2026-05-08T14:30:00',
    atualizadoEm: null,
    totalComentarios: 4,
    comentarios: [
      { id: 1, usuarioId: 'user-2', nomeUsuario: 'Luana Ferreira', apelidoUsuario: 'Luana', texto: 'Confirmada! 🙏', criadoEm: '2026-05-08T15:00:00' },
      { id: 2, usuarioId: 'user-3', nomeUsuario: 'Mavi Santos', apelidoUsuario: 'Mavi', texto: 'Estarei lá com certeza!', criadoEm: '2026-05-08T15:30:00' },
      { id: 3, usuarioId: 'user-5', nomeUsuario: 'Lara Oliveira', apelidoUsuario: 'Lara', texto: 'Tá na agenda ✅', criadoEm: '2026-05-08T16:00:00' },
      { id: 4, usuarioId: 'user-6', nomeUsuario: 'Amanda Costa', apelidoUsuario: 'Amanda', texto: 'Amém! Até sábado 🕊️', criadoEm: '2026-05-08T17:00:00' },
    ],
  },
  {
    id: 2,
    encontroId: 1,
    titulo: '🕊️ Jejum coletivo da equipe — próxima quarta',
    conteudo: 'Convidamos toda a equipe de intercessão para um dia de jejum coletivo na próxima quarta-feira. Cada um faz conforme o Senhor guiar (total ou parcial). Às 20h faremos uma oração online pelo Zoom — link no grupo do WhatsApp.\n\nFoco de intercessão: salvação dos jovens que virão ao JUNAC.',
    permiteComentarios: true,
    tipoMidia: 0,
    urlMidia: null,
    ativo: true,
    criadoPorId: 'user-1',
    nomeCriador: 'Gabriel Coradini',
    criadoEm: '2026-05-07T10:00:00',
    atualizadoEm: null,
    totalComentarios: 2,
    comentarios: [
      { id: 5, usuarioId: 'user-4', nomeUsuario: 'João Pedro Silva', apelidoUsuario: 'João', texto: 'Que bom! Vou participar 🙌', criadoEm: '2026-05-07T11:00:00' },
      { id: 6, usuarioId: 'user-7', nomeUsuario: 'Maria Clara Lima', apelidoUsuario: 'Maria Clara', texto: 'Participarei do jejum e da oração online!', criadoEm: '2026-05-07T12:00:00' },
    ],
  },
  {
    id: 3,
    encontroId: 1,
    titulo: '📖 Material de intercessão disponível',
    conteudo: 'O material de intercessão para o JUNAC XXIX já está disponível. Acesse pelo link enviado no grupo e leia com atenção os tópicos de oração para cada momento do encontro. O material cobre: abertura, adoração, ministração, compromisso e envio.',
    permiteComentarios: false,
    tipoMidia: 0,
    urlMidia: null,
    ativo: true,
    criadoPorId: 'user-1',
    nomeCriador: 'Gabriel Coradini',
    criadoEm: '2026-05-05T09:00:00',
    atualizadoEm: null,
    totalComentarios: 0,
    comentarios: [],
  },
  {
    id: 4,
    encontroId: 1,
    titulo: '🗓️ Escala do fim de semana publicada',
    conteudo: 'A escala de intercessão para este fim de semana já foi publicada. Acesse a aba "Escalas" para verificar seu horário e função. Se houver algum impedimento, entre em contato com a coordenação até quinta-feira.',
    permiteComentarios: true,
    tipoMidia: 0,
    urlMidia: null,
    ativo: true,
    criadoPorId: 'user-1',
    nomeCriador: 'Gabriel Coradini',
    criadoEm: '2026-05-04T18:00:00',
    atualizadoEm: null,
    totalComentarios: 1,
    comentarios: [
      { id: 7, usuarioId: 'user-8', nomeUsuario: 'Alicia Rodrigues', apelidoUsuario: 'Alicia', texto: 'Vi meu nome! Obrigada 🙏', criadoEm: '2026-05-04T19:00:00' },
    ],
  },
  {
    id: 5,
    encontroId: 1,
    titulo: '✨ Palavra da semana — Isaías 62:6-7',
    conteudo: '"Sobre os seus muros, ó Jerusalém, coloquei sentinelas. Nem de dia, nem de noite elas se calarão. Vós que fazeis o Senhor lembrar-se, não vos aquieteis, nem lhe deis descanso, até que ele estabeleça e faça de Jerusalém um louvor na terra."\n\nQue essa palavra nos inspire a intercessão incessante por cada vida que virá ao JUNAC XXIX!',
    permiteComentarios: true,
    tipoMidia: 0,
    urlMidia: null,
    ativo: true,
    criadoPorId: 'user-1',
    nomeCriador: 'Gabriel Coradini',
    criadoEm: '2026-05-03T08:00:00',
    atualizadoEm: null,
    totalComentarios: 3,
    comentarios: [
      { id: 8, usuarioId: 'user-9', nomeUsuario: 'Loss Nascimento', apelidoUsuario: 'Loss', texto: 'Que palavra poderosa! 🔥', criadoEm: '2026-05-03T09:00:00' },
      { id: 9, usuarioId: 'user-10', nomeUsuario: 'Kadu Mendes', apelidoUsuario: 'Kadu', texto: 'Amém! Somos sentinelas!', criadoEm: '2026-05-03T10:00:00' },
      { id: 10, usuarioId: 'user-2', nomeUsuario: 'Luana Ferreira', apelidoUsuario: 'Luana', texto: 'Palavra no coração. Obrigada! 🕊️', criadoEm: '2026-05-03T11:00:00' },
    ],
  },
];

export const mockEscalas: Escala[] = [
  {
    id: 1,
    encontroId: 1,
    titulo: 'Condutores dos Momentos',
    descricao: 'Escala de condução dos momentos de intercessão durante o JUNAC XXIX.',
    dataHora: '2026-08-22T09:00:00',
    local: 'JUNAC XXIX',
    status: 1,
    statusDescricao: 'Confirmada',
    responsavelId: null,
    nomeResponsavel: null,
    apelidoResponsavel: null,
    criadoEm: '2026-04-01T10:00:00',
    participantes: [
      // Lava-pés
      { id: 1,  usuarioId: 'user-2',  nomeUsuario: 'Luana Ferreira',   apelido: 'Luana',       fotoUrl: null, funcao: 'Lava-pés',       confirmado: true },
      { id: 2,  usuarioId: 'user-3',  nomeUsuario: 'Mavi Santos',      apelido: 'Mavi',        fotoUrl: null, funcao: 'Lava-pés',       confirmado: true },
      { id: 3,  usuarioId: 'user-4',  nomeUsuario: 'João Pedro Silva', apelido: 'João',        fotoUrl: null, funcao: 'Lava-pés',       confirmado: true },
      { id: 4,  usuarioId: 'user-5',  nomeUsuario: 'Lara Oliveira',    apelido: 'Lara',        fotoUrl: null, funcao: 'Lava-pés',       confirmado: true },
      { id: 5,  usuarioId: 'user-1',  nomeUsuario: 'Gabriel Coradini', apelido: 'Ronaldo',     fotoUrl: null, funcao: 'Lava-pés',       confirmado: true },
      // Saco do choro
      { id: 6,  usuarioId: 'user-6',  nomeUsuario: 'Amanda Costa',     apelido: 'Amanda',      fotoUrl: null, funcao: 'Saco do choro',  confirmado: true },
      { id: 7,  usuarioId: 'user-7',  nomeUsuario: 'Maria Clara Lima', apelido: 'Maria Clara', fotoUrl: null, funcao: 'Saco do choro',  confirmado: true },
      { id: 8,  usuarioId: 'user-8',  nomeUsuario: 'Alicia Rodrigues', apelido: 'Alicia',      fotoUrl: null, funcao: 'Saco do choro',  confirmado: true },
      { id: 9,  usuarioId: 'user-9',  nomeUsuario: 'Loss Nascimento',  apelido: 'Loss',        fotoUrl: null, funcao: 'Saco do choro',  confirmado: true },
      { id: 10, usuarioId: 'user-10', nomeUsuario: 'Kadu Mendes',      apelido: 'Kadu',        fotoUrl: null, funcao: 'Saco do choro',  confirmado: true },
      // Partilha do pão
      { id: 11, usuarioId: 'user-11', nomeUsuario: 'Cecilia Almeida',  apelido: 'Cecilia',     fotoUrl: null, funcao: 'Partilha do pão', confirmado: true },
      { id: 12, usuarioId: 'user-12', nomeUsuario: 'Otávio Carvalho',  apelido: 'Otávio',      fotoUrl: null, funcao: 'Partilha do pão', confirmado: true },
      { id: 13, usuarioId: 'user-13', nomeUsuario: 'Eduardo Duarte',   apelido: 'Dudu',        fotoUrl: null, funcao: 'Partilha do pão', confirmado: true },
      { id: 14, usuarioId: 'user-14', nomeUsuario: 'Leticia Martins',  apelido: 'Leticia',     fotoUrl: null, funcao: 'Partilha do pão', confirmado: true },
      { id: 15, usuarioId: 'user-15', nomeUsuario: 'Melyssa Pereira',  apelido: 'Melyssa',     fotoUrl: null, funcao: 'Partilha do pão', confirmado: true },
      // Fogueira
      { id: 16, usuarioId: 'user-16', nomeUsuario: 'Beatriz Alves',    apelido: 'Bia A',       fotoUrl: null, funcao: 'Fogueira',        confirmado: true },
      { id: 17, usuarioId: 'user-17', nomeUsuario: 'Beatriz Rocha',    apelido: 'Bia R',       fotoUrl: null, funcao: 'Fogueira',        confirmado: true },
      { id: 18, usuarioId: 'user-18', nomeUsuario: 'Ana Paula Souza',  apelido: 'Ana',         fotoUrl: null, funcao: 'Fogueira',        confirmado: true },
      { id: 19, usuarioId: 'user-19', nomeUsuario: 'Luiza Campos',     apelido: 'Luiza',       fotoUrl: null, funcao: 'Fogueira',        confirmado: true },
    ],
  },
  {
    id: 2,
    encontroId: 1,
    titulo: 'Acompanhamento das Pregações',
    descricao: 'Equipe responsável por interceder durante cada pregação do encontro.',
    dataHora: '2026-08-22T09:00:00',
    local: 'JUNAC XXIX',
    status: 1,
    statusDescricao: 'Confirmada',
    responsavelId: null,
    nomeResponsavel: null,
    apelidoResponsavel: null,
    criadoEm: '2026-04-01T10:00:00',
    participantes: [
      // Amor de Deus — ★ = responsável
      { id: 20, usuarioId: 'user-2',  nomeUsuario: 'Luana Ferreira',   apelido: 'Luana',       fotoUrl: null, funcao: '★ Amor de Deus',    confirmado: true },
      { id: 21, usuarioId: 'user-3',  nomeUsuario: 'Mavi Santos',      apelido: 'Mavi',        fotoUrl: null, funcao: 'Amor de Deus',       confirmado: true },
      { id: 22, usuarioId: 'user-6',  nomeUsuario: 'Amanda Costa',     apelido: 'Amanda',      fotoUrl: null, funcao: 'Amor de Deus',       confirmado: true },
      // Pecado
      { id: 23, usuarioId: 'user-4',  nomeUsuario: 'João Pedro Silva', apelido: 'João',        fotoUrl: null, funcao: '★ Pecado',           confirmado: true },
      { id: 24, usuarioId: 'user-5',  nomeUsuario: 'Lara Oliveira',    apelido: 'Lara',        fotoUrl: null, funcao: 'Pecado',             confirmado: true },
      { id: 25, usuarioId: 'user-9',  nomeUsuario: 'Loss Nascimento',  apelido: 'Loss',        fotoUrl: null, funcao: 'Pecado',             confirmado: true },
      // Jesus
      { id: 26, usuarioId: 'user-1',  nomeUsuario: 'Gabriel Coradini', apelido: 'Ronaldo',     fotoUrl: null, funcao: '★ Jesus',            confirmado: true },
      { id: 27, usuarioId: 'user-10', nomeUsuario: 'Kadu Mendes',      apelido: 'Kadu',        fotoUrl: null, funcao: 'Jesus',              confirmado: true },
      { id: 28, usuarioId: 'user-11', nomeUsuario: 'Cecilia Almeida',  apelido: 'Cecilia',     fotoUrl: null, funcao: 'Jesus',              confirmado: true },
      // Espírito Santo
      { id: 29, usuarioId: 'user-12', nomeUsuario: 'Otávio Carvalho',  apelido: 'Otávio',      fotoUrl: null, funcao: '★ Espírito Santo',   confirmado: true },
      { id: 30, usuarioId: 'user-13', nomeUsuario: 'Eduardo Duarte',   apelido: 'Dudu',        fotoUrl: null, funcao: 'Espírito Santo',     confirmado: true },
      { id: 31, usuarioId: 'user-14', nomeUsuario: 'Leticia Martins',  apelido: 'Leticia',     fotoUrl: null, funcao: 'Espírito Santo',     confirmado: true },
      // Maria
      { id: 32, usuarioId: 'user-15', nomeUsuario: 'Melyssa Pereira',  apelido: 'Melyssa',     fotoUrl: null, funcao: '★ Maria',            confirmado: true },
      { id: 33, usuarioId: 'user-16', nomeUsuario: 'Beatriz Alves',    apelido: 'Bia A',       fotoUrl: null, funcao: 'Maria',              confirmado: true },
      { id: 34, usuarioId: 'user-18', nomeUsuario: 'Ana Paula Souza',  apelido: 'Ana',         fotoUrl: null, funcao: 'Maria',              confirmado: true },
      // Testemunho
      { id: 35, usuarioId: 'user-17', nomeUsuario: 'Beatriz Rocha',    apelido: 'Bia R',       fotoUrl: null, funcao: '★ Testemunho',       confirmado: true },
      { id: 36, usuarioId: 'user-19', nomeUsuario: 'Luiza Campos',     apelido: 'Luiza',       fotoUrl: null, funcao: 'Testemunho',         confirmado: true },
      // Família
      { id: 37, usuarioId: 'user-7',  nomeUsuario: 'Maria Clara Lima', apelido: 'Maria Clara', fotoUrl: null, funcao: '★ Família',          confirmado: true },
      { id: 38, usuarioId: 'user-8',  nomeUsuario: 'Alicia Rodrigues', apelido: 'Alicia',      fotoUrl: null, funcao: 'Família',            confirmado: true },
    ],
  },
];

export const mockSemanas: SemanaCompromisso[] = Array.from({ length: 16 }, (_, i) => {
  const start = new Date('2026-05-02');
  start.setDate(start.getDate() + i * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return {
    numeroSemana: i + 1,
    dataInicio: start.toISOString(),
    dataFim: end.toISOString(),
    atual: i === 1,
    meuRegistroFeito: i === 0,
    totalRegistros: i === 0 ? 7 : i === 1 ? 3 : 0,
  };
});

export const mockMeusCompromissos: CompromissoOracao[] = [
  {
    id: 1,
    usuarioId: 'user-1',
    nomeUsuario: 'Gabriel Coradini',
    apelidoUsuario: 'Ronaldo',
    fotoUrl: null,
    numeroSemana: 1,
    dataInicioSemana: '2026-05-02T00:00:00',
    dataFimSemana: '2026-05-08T23:59:59',
    conteudo: 'Orei diariamente de manhã pelos jovens que virão ao encontro. Fiz jejum na quarta-feira e intercedi especificamente pelos líderes de grupo. Senti muito a presença do Senhor nesta semana.',
    criadoEm: '2026-05-07T08:00:00',
    atualizadoEm: null,
  },
];

export const mockAgendaAtual: AgendaSemanal = {
  id: 2,
  encontroId: 1,
  numeroSemana: 2,
  titulo: 'Semana de Jejum e Intercessão Intensiva',
  conteudo: '🗓️ Segunda: Oração individual pelos jovens do seu bairro\n🗓️ Terça: Leitura do material de intercessão\n🗓️ Quarta: Jejum e oração online às 20h (Zoom)\n🗓️ Quinta: Intercessão pelos líderes e pregadores\n🗓️ Sexta: Preparação espiritual pessoal\n🗓️ Sábado: Reunião presencial às 9h',
  dataInicio: '2026-05-09T00:00:00',
  dataFim: '2026-05-15T23:59:59',
  semanaAtual: true,
  criadoPorId: 'user-1',
  nomeCriador: 'Gabriel Coradini',
  criadoEm: '2026-05-08T08:00:00',
  atualizadoEm: null,
};

export const mockAgendas: AgendaSemanal[] = [
  {
    id: 1, encontroId: 1, numeroSemana: 1,
    titulo: 'Início da Jornada de Oração',
    conteudo: 'Primeira semana de compromisso de oração pelo JUNAC XXIX. Foco: entender o chamado e se comprometer com a intercessão.',
    dataInicio: '2026-05-02T00:00:00', dataFim: '2026-05-08T23:59:59',
    semanaAtual: false, criadoPorId: 'user-1', nomeCriador: 'Gabriel Coradini',
    criadoEm: '2026-05-01T10:00:00', atualizadoEm: null,
  },
  mockAgendaAtual,
];

export const mockVotacoes: Votacao[] = [
  {
    id: 1,
    encontroId: 1,
    pergunta: 'Qual horário preferem para a reunião de oração semanal?',
    descricao: 'Queremos escolher o melhor horário para que a maior parte da equipe possa participar.',
    ativa: true,
    dataFim: '2026-05-15T23:59:59',
    criadoPorId: 'user-1',
    nomeCriador: 'Gabriel Coradini',
    criadoEm: '2026-05-08T10:00:00',
    totalVotos: 7,
    jaVotei: false,
    minhaOpcaoId: null,
    opcoes: [
      { id: 1, texto: 'Terça às 19h30', ordem: 1, totalVotos: 3, percentual: 42.9 },
      { id: 2, texto: 'Quarta às 20h', ordem: 2, totalVotos: 2, percentual: 28.6 },
      { id: 3, texto: 'Sábado às 9h', ordem: 3, totalVotos: 2, percentual: 28.6 },
    ],
  },
  {
    id: 2,
    encontroId: 1,
    pergunta: 'Tema para a camisa da equipe de intercessão?',
    descricao: null,
    ativa: true,
    dataFim: null,
    criadoPorId: 'user-1',
    nomeCriador: 'Gabriel Coradini',
    criadoEm: '2026-05-06T14:00:00',
    totalVotos: 5,
    jaVotei: true,
    minhaOpcaoId: 4,
    opcoes: [
      { id: 4, texto: '"Sentinelas" — Isaías 62:6', ordem: 1, totalVotos: 3, percentual: 60 },
      { id: 5, texto: '"Intercessão" — simples e direto', ordem: 2, totalVotos: 2, percentual: 40 },
    ],
  },
];

export const mockAnotacoes: Anotacao[] = [
  {
    id: 1,
    titulo: 'Palavras recebidas na oração',
    conteudo: 'Durante a oração do dia 05/05, recebi uma imagem de um campo de trigo pronto para a colheita. Sinto que o Senhor está dizendo que muitos jovens estão prontos para encontrá-Lo no JUNAC. Intercessão específica: pela coragem dos líderes de célula em convidar.',
    criadoEm: '2026-05-05T07:30:00',
    atualizadoEm: '2026-05-05T08:00:00',
  },
  {
    id: 2,
    titulo: 'Lista de oração pessoal',
    conteudo: '• João (primo) — afastado da igreja há 2 anos\n• Turma da faculdade — 3 amigos não cristãos\n• Liderança do grupo jovem — desgaste e cansaço\n• Pregadores do encontro — unção e clareza\n• Logística do evento — tudo no tempo certo',
    criadoEm: '2026-05-03T20:00:00',
    atualizadoEm: null,
  },
  {
    id: 3,
    titulo: 'Versículos para o encontro',
    conteudo: 'Isaías 62:6-7 — Sentinelas nos muros\nSalmo 126:5-6 — Semear com lágrimas, colher com alegria\nJoão 17:21 — Para que todos sejam um\nRomanos 8:26 — O Espírito intercede por nós',
    criadoEm: '2026-05-01T15:00:00',
    atualizadoEm: null,
  },
];

export const mockInfoRestritas: InformacaoRestrita[] = [
  {
    id: 1,
    encontroId: 1,
    titulo: 'Lista de participantes confirmados',
    conteudo: 'Total confirmado até 08/05: 87 participantes\nGrupo A (sexta): 29\nGrupo B (sábado manhã): 31\nGrupo C (sábado tarde): 27\n\nMeta: 120 participantes',
    criadoPorId: 'user-1',
    nomeCriador: 'Gabriel Coradini',
    criadoEm: '2026-05-08T09:00:00',
    atualizadoEm: null,
  },
  {
    id: 2,
    encontroId: 1,
    titulo: 'Contatos dos pregadores',
    conteudo: 'Pregador principal: Pr. Marcos Vinicius — (11) 99999-0001\nTestemunho: Irmã Débora — (21) 99999-0002\nLouvor: Ministério Águas Vivas — (11) 99999-0003',
    criadoPorId: 'user-1',
    nomeCriador: 'Gabriel Coradini',
    criadoEm: '2026-05-01T10:00:00',
    atualizadoEm: null,
  },
];
