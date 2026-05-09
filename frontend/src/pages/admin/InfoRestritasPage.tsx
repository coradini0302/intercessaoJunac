import { useState } from 'react';
import { Lock, Plus, Edit2, Trash2 } from 'lucide-react';
import { useEncontroAtivo } from '../../hooks/useEncontro';
import { useInfoRestritas, useCriarInfoRestrita, useEditarInfoRestrita, useDeletarInfoRestrita } from '../../hooks/useInfoRestritas';
import { TopBar } from '../../components/layout/TopBar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRelativeDate } from '../../lib/utils';
import { extractErrorMessage } from '../../lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import type { InformacaoRestrita } from '../../types';

interface InfoForm {
  titulo: string;
  conteudo: string;
}

export function InfoRestritasPage() {
  const { data: encontro } = useEncontroAtivo();
  const { data: infos, isLoading } = useInfoRestritas(encontro?.id);
  const criar = useCriarInfoRestrita();
  const editar = useEditarInfoRestrita();
  const deletar = useDeletarInfoRestrita();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<InformacaoRestrita | null>(null);
  const [viewItem, setViewItem] = useState<InformacaoRestrita | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<InfoForm>();

  const openCreate = () => {
    reset({ titulo: '', conteudo: '' });
    setEditItem(null);
    setShowModal(true);
  };

  const openEdit = (info: InformacaoRestrita) => {
    reset({ titulo: info.titulo, conteudo: info.conteudo });
    setEditItem(info);
    setShowModal(true);
  };

  const onSubmit = async (values: InfoForm) => {
    if (!encontro) return;
    setLoading(true);
    try {
      if (editItem) {
        await editar.mutateAsync({ id: editItem.id, ...values });
        toast.success('Informação atualizada!');
      } else {
        await criar.mutateAsync({ ...values, encontroId: encontro.id });
        toast.success('Informação criada!');
      }
      reset();
      setShowModal(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remover esta informação?')) return;
    try {
      await deletar.mutateAsync(id);
      toast.success('Removido');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col">
      <TopBar
        title="Informações Restritas"
        back
        right={
          <button
            onClick={openCreate}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
          >
            <Plus size={22} />
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-2">
          <Lock size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Estas informações são visíveis apenas para Admin e DevAdmin.
          </p>
        </div>

        {isLoading && <PageSpinner />}

        {!isLoading && !infos?.length && (
          <EmptyState
            icon={<Lock size={28} />}
            title="Nenhuma informação restrita"
            description="Crie informações confidenciais da coordenação."
          />
        )}

        {infos?.map((info) => (
          <Card key={info.id} onClick={() => setViewItem(info)}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Lock size={16} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm line-clamp-1">{info.titulo}</p>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{info.conteudo}</p>
                <p className="text-[10px] text-slate-400 mt-1">{formatRelativeDate(info.criadoEm)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(info); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-50 text-primary-500"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => handleDelete(info.id, e)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? 'Editar Informação' : 'Nova Informação Restrita'}
        footer={<Button fullWidth loading={loading} onClick={handleSubmit(onSubmit)}>Salvar</Button>}
      >
        <form className="flex flex-col gap-4">
          <Input label="Título" placeholder="Ex: Lista de participantes confirmados" {...register('titulo')} />
          <Textarea label="Conteúdo" placeholder="Informação confidencial..." rows={6} {...register('conteudo')} />
        </form>
      </Modal>

      {viewItem && (
        <Modal
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          title={viewItem.titulo}
        >
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {viewItem.conteudo}
          </p>
          <p className="text-xs text-slate-400 mt-4">
            Por {viewItem.nomeCriador} · {formatRelativeDate(viewItem.criadoEm)}
          </p>
        </Modal>
      )}
    </div>
  );
}
