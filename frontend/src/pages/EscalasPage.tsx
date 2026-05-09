import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, MapPin, Clock, ChevronRight, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEncontroAtivo } from '../hooks/useEncontro';
import { useEscalas, useCriarEscala } from '../hooks/useEscalas';
import { useEquipe } from '../hooks/useUsuarios';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { PageSpinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDateTime, isAdmin, displayName } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import type { Escala } from '../types';

const statusConfig = {
  0: { label: 'Pendente', variant: 'yellow' as const },
  1: { label: 'Confirmada', variant: 'green' as const },
  2: { label: 'Cancelada', variant: 'red' as const },
};

function EscalaCard({ escala, onClick }: { escala: Escala; onClick: () => void }) {
  const st = statusConfig[escala.status];
  return (
    <Card onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <Calendar size={20} className="text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
              {escala.titulo}
            </p>
            <ChevronRight size={16} className="text-slate-300 shrink-0 mt-0.5" />
          </div>
          {escala.dataHora && (
            <div className="flex items-center gap-1 mt-1">
              <Clock size={12} className="text-primary-500" />
              <p className="text-xs text-primary-600 font-medium">{formatDateTime(escala.dataHora)}</p>
            </div>
          )}
          {escala.local && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-slate-400" />
              <p className="text-xs text-slate-400">{escala.local}</p>
            </div>
          )}
          {escala.nomeResponsavel && (
            <div className="flex items-center gap-1 mt-0.5">
              <User size={12} className="text-slate-400" />
              <p className="text-xs text-slate-400">
                {escala.apelidoResponsavel ?? escala.nomeResponsavel}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge label={st.label} variant={st.variant} />
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Users size={12} />
              {escala.participantes.length} participante{escala.participantes.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface EscalaForm {
  titulo: string;
  descricao: string;
  dataHora: string;
  local: string;
  responsavelId: string;
}

export function EscalasPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const admin = user && isAdmin(user.role);

  const { data: encontro } = useEncontroAtivo();
  const { data: escalas, isLoading } = useEscalas(encontro?.id);
  const { data: equipe } = useEquipe();
  const criar = useCriarEscala();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EscalaForm>();

  const onSubmit = async (values: EscalaForm) => {
    if (!encontro) return;
    setLoading(true);
    try {
      await criar.mutateAsync({
        titulo: values.titulo,
        descricao: values.descricao || undefined,
        dataHora: values.dataHora || undefined,
        local: values.local || undefined,
        encontroId: encontro.id,
        responsavelId: values.responsavelId || null,
      });
      toast.success('Escala criada!');
      reset();
      setShowModal(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <TopBar
        title="Escalas"
        gradient
        right={
          admin ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 text-white"
            >
              <Plus size={22} />
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 px-4 py-4">
        {isLoading && <PageSpinner />}

        {!isLoading && !escalas?.length && (
          <EmptyState
            icon={<Calendar size={28} />}
            title="Nenhuma escala cadastrada"
            description="As escalas de intercessão aparecerão aqui."
          />
        )}

        {escalas?.map((e) => (
          <EscalaCard key={e.id} escala={e} onClick={() => navigate(`/escalas/${e.id}`)} />
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Escala"
        footer={<Button fullWidth loading={loading} onClick={handleSubmit(onSubmit)}>Criar escala</Button>}
      >
        <form className="flex flex-col gap-4">
          <Input
            label="Título *"
            placeholder="Ex: Escala de intercessão"
            error={errors.titulo?.message}
            {...register('titulo', { required: 'Informe o título' })}
          />
          <Textarea label="Descrição" placeholder="Detalhes da escala..." rows={3} {...register('descricao')} />
          <Input label="Data e hora" type="datetime-local" {...register('dataHora')} />
          <Input label="Local" placeholder="Ex: Sala de oração" {...register('local')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Responsável (opcional)</label>
            <select
              {...register('responsavelId')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400"
            >
              <option value="">Nenhum</option>
              {equipe?.map((m) => (
                <option key={m.id} value={m.id}>{displayName(m.nome, m.apelido)}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
