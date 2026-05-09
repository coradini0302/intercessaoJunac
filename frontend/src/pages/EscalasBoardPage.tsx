import { TopBar } from '../components/layout/TopBar';

const conducao = {
  titulo: 'Condutores dos Momentos',
  cabecalho: ['Momentos', 'Condutores'],
  linhas: [
    { momento: 'Lava-pés',       equipe: ['Luana', 'Mavi', 'João', 'Lara', 'Gabriel'] },
    { momento: 'Saco do choro',  equipe: ['Amanda', 'Maria Clara', 'Alicia', 'Loss', 'Kadu'] },
    { momento: 'Partilha do pão',equipe: ['Cecilia', 'Otávio', 'Dudu', 'Leticia', 'Melyssa'] },
    { momento: 'Fogueira',       equipe: ['Bia A', 'Bia R', 'Ana', 'Luiza'] },
  ],
  obs: [
    'OBS: todos participarão, mas os grupos serão separados para conduzir',
    'OBS: quem assistiu a pregação de pecado conduz a fogueira',
    'Quem conduz o saco de choro assiste a pregação de família',
  ],
};

const pregacoes = {
  titulo: 'Acompanhamento das Pregações',
  cabecalho: ['Pregação', 'Quem vai acompanhar?', 'Responsável'],
  linhas: [
    { pregacao: 'Amor de Deus', equipe: ['Letícia', 'Kadu', 'Loss', 'Maria Clara', 'Melyssa'], responsavel: 'Letícia' },
    { pregacao: 'Pecado',       equipe: ['Bia R', 'Bia A', 'Ana', 'Luiza', 'João', 'Luana'],   responsavel: 'Bia Rosário' },
    { pregacao: 'Jesus',        equipe: ['Gabriel', 'Lara', 'Luiza', 'Cecilia', 'Otávio'],     responsavel: 'Gabriel' },
    { pregacao: 'ES',           equipe: ['Dudu', 'Lara', 'Alicia', 'Luana', 'Mavi'],           responsavel: 'Dudu' },
    { pregacao: 'Maria',        equipe: ['Ana', 'Gabriel', 'Cecilia', 'Otávio', 'João', 'Melyssa'], responsavel: 'Ana' },
    { pregacao: 'Testemunho',   equipe: ['Mavi', 'Amanda', 'Bia A', 'Bia R', 'Leticia'],       responsavel: 'Mavi' },
    { pregacao: 'Família',      equipe: ['Amanda', 'Maria Clara', 'Alicia', 'Loss', 'Kadu', 'Dudu'], responsavel: 'Alícia' },
  ],
  obs: ['Ir a pregação = finalidade de rezar e interceder pelo momento'],
};

export function EscalasBoardPage() {
  return (
    <div className="flex flex-col">
      <TopBar title="Pregadores / Condução" gradient />

      <div className="flex flex-col gap-6 px-4 py-4 md:px-6 md:py-5 max-w-4xl w-full">

        {/* Board 1 — Condução dos Momentos */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2 px-0.5">{conducao.titulo}</p>
          <div className="rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_2fr] bg-primary-800 px-4 py-3 gap-x-3">
              {conducao.cabecalho.map((h) => (
                <span key={h} className="text-xs font-bold text-white uppercase tracking-wider">{h}</span>
              ))}
            </div>

            {/* Rows */}
            {conducao.linhas.map(({ momento, equipe }, i) => (
              <div
                key={momento}
                className={`grid grid-cols-[1fr_2fr] px-4 py-3 border-b border-slate-100 last:border-0 items-center gap-x-3 ${i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
              >
                <p className="text-sm font-semibold text-slate-800">
                  {momento}
                  <span className="ml-1 text-xs font-normal text-slate-400">({equipe.length})</span>
                </p>
                <p className="text-sm text-slate-600">{equipe.join(' | ')}</p>
              </div>
            ))}

            {/* Footer */}
            <div className="px-4 py-3 bg-sky-50 border-t border-sky-100 flex flex-col gap-1">
              {conducao.obs.map((o) => (
                <p key={o} className="text-xs text-sky-800 font-medium text-center">{o}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Board 2 — Acompanhamento das Pregações */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2 px-0.5">{pregacoes.titulo}</p>
          <div className="rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_2fr_1fr] bg-primary-800 px-4 py-3 gap-x-3">
              {pregacoes.cabecalho.map((h, i) => (
                <span
                  key={h}
                  className={`text-xs font-bold text-white uppercase tracking-wider ${i === 2 ? 'text-right' : ''}`}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {pregacoes.linhas.map(({ pregacao, equipe, responsavel }, i) => (
              <div
                key={pregacao}
                className={`grid grid-cols-[1fr_2fr_1fr] px-4 py-3 border-b border-slate-100 last:border-0 items-center gap-x-3 ${i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
              >
                <p className="text-sm font-semibold text-slate-800">
                  {pregacao}
                  <span className="ml-1 text-xs font-normal text-slate-400">({equipe.length + 1})</span>
                </p>
                <p className="text-sm text-slate-600">{equipe.join(' | ')}</p>
                <p className="text-sm font-semibold text-primary-700 text-right">{responsavel}</p>
              </div>
            ))}

            {/* Footer */}
            <div className="px-4 py-3 bg-sky-50 border-t border-sky-100">
              {pregacoes.obs.map((o) => (
                <p key={o} className="text-xs text-sky-800 font-medium text-center">{o}</p>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
