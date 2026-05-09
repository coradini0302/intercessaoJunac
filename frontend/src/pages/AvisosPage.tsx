import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Plus, MessageCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEncontroAtivo } from '../hooks/useEncontro';
import { useAvisos, useCriarAviso } from '../hooks/useAvisos';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { PageSpinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { formatRelativeDate, isAdmin } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface AvisoForm {
  titulo: string;
  conteudo: string;
  permiteComentarios: boolean;
}

export function AvisosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const admin = user && isAdmin(user.role);

  const { data: encontro } = useEncontroAtivo();
  const { data: avisos, isLoading } = useAvisos(encontro?.id);
  const criar = useCriarAviso();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AvisoForm>({
    defaultValues: { permiteComentarios: true },
  });

  const onSubmit = async (values: AvisoForm) => {
    if (!encontro) return;
    setLoading(true);
    try {
      await criar.mutateAsync({ ...values, encontroId: encontro.id });
      toast.success('Aviso criado!');
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
        title="Avisos"
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

        {!isLoading && !avisos?.length && (
          <EmptyState
            icon={<Megaphone size={28} />}
            title="Nenhum aviso ainda"
            description="Os avisos da coordenação aparecerão aqui."
          />
        )}

        {avisos?.map((aviso) => (
          <Card key={aviso.id} onClick={() => navigate(`/avisos/${aviso.id}`)}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                <Megaphone size={18} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
                    {aviso.titulo}
                  </p>
                  <ChevronRight size={16} className="text-slate-300 shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{aviso.conteudo}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">
                    {formatRelativeDate(aviso.criadoEm)}
                  </span>
                  {aviso.permiteComentarios && aviso.totalComentarios > 0 && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MessageCircle size={12} />
                      {aviso.totalComentarios}
                    </span>
                  )}
                  {!aviso.ativo && <Badge label="Inativo" variant="gray" />}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Aviso"
        footer={
          <Button fullWidth loading={loading} onClick={handleSubmit(onSubmit)}>
            Publicar aviso
          </Button>
        }
      >
        <form className="flex flex-col gap-4">
          <Input
            label="Título"
            placeholder="Ex: Reunião de oração"
            error={errors.titulo?.message}
            {...register('titulo', { required: 'Informe o título' })}
          />
          <Textarea
            label="Conteúdo"
            placeholder="Escreva o aviso..."
            rows={5}
            error={errors.conteudo?.message}
            {...register('conteudo', { required: 'Informe o conteúdo' })}
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('permiteComentarios')} className="w-4 h-4 rounded accent-primary-500" />
            <span className="text-sm text-slate-700">Permitir comentários</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}
