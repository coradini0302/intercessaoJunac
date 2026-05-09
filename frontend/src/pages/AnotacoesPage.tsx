import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useAnotacoes, useCriarAnotacao, useDeletarAnotacao } from '../hooks/useAnotacoes';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { PageSpinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { formatRelativeDate } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface AnotacaoForm {
  titulo: string;
  conteudo: string;
}

export function AnotacoesPage() {
  const navigate = useNavigate();
  const { data: anotacoes, isLoading } = useAnotacoes();
  const criar = useCriarAnotacao();
  const deletar = useDeletarAnotacao();

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AnotacaoForm>();

  const onSubmit = async (values: AnotacaoForm) => {
    setLoading(true);
    try {
      const nova = await criar.mutateAsync({ titulo: values.titulo || undefined, conteudo: values.conteudo });
      toast.success('Anotação criada!');
      reset();
      setShowModal(false);
      navigate(`/anotacoes/${nova.id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remover esta anotação?')) return;
    setDeletingId(id);
    try {
      await deletar.mutateAsync(id);
      toast.success('Anotação removida');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col">
      <TopBar
        title="Minhas Anotações"
        back
        right={
          <button
            onClick={() => setShowModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
          >
            <Plus size={22} />
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-4 py-4">
        {isLoading && <PageSpinner />}

        {!isLoading && !anotacoes?.length && (
          <EmptyState
            icon={<FileText size={28} />}
            title="Nenhuma anotação ainda"
            description="Suas anotações privadas ficam aqui. Só você vê."
            action={
              <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowModal(true)}>
                Nova anotação
              </Button>
            }
          />
        )}

        {anotacoes?.map((a) => (
          <Card key={a.id} onClick={() => navigate(`/anotacoes/${a.id}`)}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm line-clamp-1">
                  {a.titulo || 'Sem título'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.conteudo}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {formatRelativeDate(a.atualizadoEm ?? a.criadoEm)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleDelete(a.id, e)}
                  disabled={deletingId === a.id}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-red-400"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Anotação"
        footer={<Button fullWidth loading={loading} onClick={handleSubmit(onSubmit)}>Criar anotação</Button>}
      >
        <form className="flex flex-col gap-4">
          <Input label="Título (opcional)" placeholder="Ex: Palavras recebidas" {...register('titulo')} />
          <Textarea
            label="Conteúdo *"
            placeholder="Escreva suas anotações..."
            rows={6}
            error={errors.conteudo?.message}
            {...register('conteudo', { required: 'Informe o conteúdo' })}
          />
        </form>
      </Modal>
    </div>
  );
}
