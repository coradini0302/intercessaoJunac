import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, Plus, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEncontroAtivo } from '../hooks/useEncontro';
import { useVotacoes, useCriarVotacao } from '../hooks/useVotacoes';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageSpinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDateTime, isAdmin } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import type { Votacao } from '../types';

function VotacaoCard({ v, onClick }: { v: Votacao; onClick: () => void }) {
  return (
    <Card onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${v.ativa ? 'bg-purple-100' : 'bg-slate-100'}`}>
          <Vote size={20} className={v.ativa ? 'text-purple-600' : 'text-slate-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
              {v.pergunta}
            </p>
            <ChevronRight size={16} className="text-slate-300 shrink-0 mt-0.5" />
          </div>
          {v.descricao && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{v.descricao}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {!v.ativa && <Badge label="Encerrada" variant="gray" />}
            {v.ativa && v.jaVotei && <Badge label="Votado" variant="green" />}
            {v.ativa && !v.jaVotei && <Badge label="Vote agora" variant="purple" />}
            <span className="text-xs text-slate-400">
              {v.totalVotos} voto{v.totalVotos !== 1 ? 's' : ''}
            </span>
            {v.dataFim && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={11} />
                {formatDateTime(v.dataFim)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function VotacoesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const admin = user && isAdmin(user.role);

  const { data: encontro } = useEncontroAtivo();
  const { data: votacoes, isLoading } = useVotacoes(encontro?.id);
  const criar = useCriarVotacao();

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pergunta, setPergunta] = useState('');
  const [descricao, setDescricao] = useState('');
  const [opcoes, setOpcoes] = useState(['', '']);
  const [dataFim, setDataFim] = useState('');

  const setOpcao = (i: number, val: string) => {
    const next = [...opcoes];
    next[i] = val;
    setOpcoes(next);
  };

  const handleSalvar = async () => {
    if (!encontro || !pergunta.trim()) return;
    const opsFilled = opcoes.filter((o) => o.trim());
    if (opsFilled.length < 2) {
      toast.error('Informe ao menos 2 opções.');
      return;
    }
    setLoading(true);
    try {
      await criar.mutateAsync({
        pergunta,
        descricao: descricao || undefined,
        opcoes: opsFilled,
        dataFim: dataFim || undefined,
        encontroId: encontro.id,
      });
      toast.success('Votação criada!');
      setPergunta(''); setDescricao(''); setOpcoes(['', '']); setDataFim('');
      setShowModal(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const ativas = votacoes?.filter((v) => v.ativa) ?? [];
  const encerradas = votacoes?.filter((v) => !v.ativa) ?? [];

  return (
    <div className="flex flex-col">
      <TopBar
        title="Votações"
        back
        right={
          admin ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
            >
              <Plus size={22} />
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 px-4 py-4">
        {isLoading && <PageSpinner />}

        {!isLoading && !votacoes?.length && (
          <EmptyState
            icon={<Vote size={28} />}
            title="Nenhuma votação ainda"
            description="As votações da coordenação aparecerão aqui."
          />
        )}

        {ativas.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-0.5">Abertas</p>
            <div className="flex flex-col gap-2">
              {ativas.map((v) => (
                <VotacaoCard key={v.id} v={v} onClick={() => navigate(`/votacoes/${v.id}`)} />
              ))}
            </div>
          </div>
        )}

        {encerradas.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-0.5 mt-2">Encerradas</p>
            <div className="flex flex-col gap-2">
              {encerradas.map((v) => (
                <VotacaoCard key={v.id} v={v} onClick={() => navigate(`/votacoes/${v.id}`)} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Votação"
        footer={<Button fullWidth loading={loading} onClick={handleSalvar}>Criar votação</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Pergunta *</label>
            <input
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Ex: Qual dia preferem para o encontro?"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Descrição (opcional)</label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Contexto adicional..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Opções *</label>
            {opcoes.map((op, i) => (
              <input
                key={i}
                value={op}
                onChange={(e) => setOpcao(i, e.target.value)}
                placeholder={`Opção ${i + 1}`}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400"
              />
            ))}
            {opcoes.length < 4 && (
              <Button size="sm" variant="outline" onClick={() => setOpcoes([...opcoes, ''])}>
                + Adicionar opção
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Data de encerramento (opcional)</label>
            <input
              type="datetime-local"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
