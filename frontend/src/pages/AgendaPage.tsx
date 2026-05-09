import { useState } from 'react';
import { CalendarDays, Plus, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEncontroAtivo } from '../hooks/useEncontro';
import { useAgendas, useCriarAgenda, useEditarAgenda } from '../hooks/useAgenda';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { PageSpinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate, isAdmin } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import type { AgendaSemanal } from '../types';

interface AgendaForm {
  numeroSemana: number;
  titulo: string;
  conteudo: string;
}

export function AgendaPage() {
  const { user } = useAuth();
  const admin = user && isAdmin(user.role);

  const { data: encontro } = useEncontroAtivo();
  const { data: agendas, isLoading } = useAgendas(encontro?.id);
  const criar = useCriarAgenda();
  const editar = useEditarAgenda();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<AgendaSemanal | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<AgendaForm>();

  const openCreate = () => {
    reset({ numeroSemana: undefined, titulo: '', conteudo: '' });
    setEditItem(null);
    setShowModal(true);
  };

  const openEdit = (agenda: AgendaSemanal) => {
    reset({ titulo: agenda.titulo, conteudo: agenda.conteudo ?? '' });
    setEditItem(agenda);
    setShowModal(true);
  };

  const onSubmit = async (values: AgendaForm) => {
    if (!encontro) return;
    setLoading(true);
    try {
      if (editItem) {
        await editar.mutateAsync({ id: editItem.id, titulo: values.titulo, conteudo: values.conteudo || undefined });
        toast.success('Agenda atualizada!');
      } else {
        await criar.mutateAsync({ ...values, encontroId: encontro.id });
        toast.success('Agenda criada!');
      }
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
        title="Agenda Semanal"
        back
        right={
          admin ? (
            <button
              onClick={openCreate}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
            >
              <Plus size={22} />
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 px-4 py-4">
        {isLoading && <PageSpinner />}

        {!isLoading && !agendas?.length && (
          <EmptyState
            icon={<CalendarDays size={28} />}
            title="Nenhuma agenda cadastrada"
            description="A agenda semanal da equipe aparecerá aqui."
          />
        )}

        {agendas?.map((agenda) => (
          <Card key={agenda.id}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-800 text-sm">{agenda.titulo}</p>
                {agenda.semanaAtual && <Badge label="Semana atual" variant="blue" />}
              </div>
              {admin && (
                <button
                  onClick={() => openEdit(agenda)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-50 text-primary-500 shrink-0"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            <p className="text-xs text-primary-600 font-medium mb-2">
              Semana {agenda.numeroSemana} · {formatDate(agenda.dataInicio)} – {formatDate(agenda.dataFim)}
            </p>
            {agenda.conteudo && (
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{agenda.conteudo}</p>
            )}
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? 'Editar Agenda' : 'Nova Agenda'}
        footer={<Button fullWidth loading={loading} onClick={handleSubmit(onSubmit)}>Salvar</Button>}
      >
        <form className="flex flex-col gap-4">
          {!editItem && (
            <Input
              label="Número da semana (1–16)"
              type="number"
              min={1}
              max={16}
              placeholder="Ex: 3"
              {...register('numeroSemana', { valueAsNumber: true })}
            />
          )}
          <Input label="Título" placeholder="Ex: Foco em jejum e oração" {...register('titulo')} />
          <Textarea label="Conteúdo" placeholder="Descreva a agenda da semana..." rows={5} {...register('conteudo')} />
        </form>
      </Modal>
    </div>
  );
}
