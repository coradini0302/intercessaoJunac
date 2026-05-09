import { useParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVotacao, useVotar, useEncerrarVotacao } from '../hooks/useVotacoes';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { formatDateTime, isAdmin } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import { useState } from 'react';

export function VotacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const votacaoId = Number(id);
  const admin = user && isAdmin(user.role);

  const { data: votacao, isLoading } = useVotacao(votacaoId);
  const votar = useVotar();
  const encerrar = useEncerrarVotacao();
  const [selectedOpcao, setSelectedOpcao] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);

  const handleVotar = async () => {
    const opcaoId = selectedOpcao ?? votacao?.minhaOpcaoId;
    if (!opcaoId) return;
    setVoting(true);
    try {
      await votar.mutateAsync({ votacaoId, opcaoId });
      toast.success('Voto registrado!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setVoting(false);
    }
  };

  const handleEncerrar = async () => {
    try {
      await encerrar.mutateAsync(votacaoId);
      toast.success('Votação encerrada');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (isLoading) return <PageSpinner />;
  if (!votacao) return null;

  const showResults = votacao.jaVotei || !votacao.ativa;
  const canVote = votacao.ativa && !votacao.jaVotei;

  return (
    <div className="flex flex-col">
      <TopBar title="Votação" back />

      <div className="flex flex-col gap-4 px-4 py-4">
        <Card>
          <div className="flex items-start gap-2 mb-3">
            {votacao.ativa ? (
              <Badge label="Aberta" variant="purple" size="md" />
            ) : (
              <Badge label="Encerrada" variant="gray" size="md" />
            )}
            {votacao.jaVotei && <Badge label="Seu voto registrado" variant="green" size="md" />}
          </div>

          <h1 className="text-base font-bold text-slate-800 mb-1 leading-snug">
            {votacao.pergunta}
          </h1>
          {votacao.descricao && (
            <p className="text-sm text-slate-500 mb-2">{votacao.descricao}</p>
          )}
          <p className="text-xs text-slate-400">
            {votacao.totalVotos} voto{votacao.totalVotos !== 1 ? 's' : ''} registrado{votacao.totalVotos !== 1 ? 's' : ''}
          </p>
          {votacao.dataFim && (
            <p className="text-xs text-slate-400 mt-0.5">
              Encerra: {formatDateTime(votacao.dataFim)}
            </p>
          )}
        </Card>

        <div className="flex flex-col gap-2">
          {votacao.opcoes
            .sort((a, b) => a.ordem - b.ordem)
            .map((opcao) => {
              const isMinha = votacao.minhaOpcaoId === opcao.id;
              const isSelected = selectedOpcao === opcao.id;
              const isWinner = !votacao.ativa && opcao.totalVotos === Math.max(...votacao.opcoes.map((o) => o.totalVotos));

              return (
                <button
                  key={opcao.id}
                  onClick={() => canVote && setSelectedOpcao(opcao.id)}
                  disabled={!canVote}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                    isMinha || isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : isWinner && !votacao.ativa
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-100 bg-white'
                  } ${canVote ? 'cursor-pointer hover:border-primary-300' : 'cursor-default'}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-sm font-medium ${isMinha || isSelected ? 'text-primary-700' : 'text-slate-800'}`}>
                      {opcao.texto}
                    </span>
                    {(isMinha || isSelected) && <CheckCircle2 size={18} className="text-primary-500 shrink-0" />}
                    {isWinner && !votacao.ativa && !isMinha && (
                      <span className="text-xs text-emerald-600 font-medium">Vencedora</span>
                    )}
                  </div>
                  {showResults && (
                    <div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isMinha ? 'bg-primary-500' : 'bg-slate-300'}`}
                          style={{ width: `${opcao.percentual}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {opcao.totalVotos} voto{opcao.totalVotos !== 1 ? 's' : ''} · {opcao.percentual.toFixed(0)}%
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
        </div>

        {canVote && (
          <Button
            fullWidth
            size="lg"
            disabled={!selectedOpcao}
            loading={voting}
            onClick={handleVotar}
          >
            Confirmar voto
          </Button>
        )}

        {admin && votacao.ativa && (
          <Button
            variant="outline"
            fullWidth
            onClick={handleEncerrar}
            leftIcon={<XCircle size={16} />}
          >
            Encerrar votação
          </Button>
        )}
      </div>
    </div>
  );
}
