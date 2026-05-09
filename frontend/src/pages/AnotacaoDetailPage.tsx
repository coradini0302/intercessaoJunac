import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { useAnotacao, useEditarAnotacao, useDeletarAnotacao } from '../hooks/useAnotacoes';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { formatDateTime } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';

export function AnotacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const anotacaoId = Number(id);

  const { data: anotacao, isLoading } = useAnotacao(anotacaoId);
  const editar = useEditarAnotacao();
  const deletar = useDeletarAnotacao();

  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (anotacao) {
      setTitulo(anotacao.titulo ?? '');
      setConteudo(anotacao.conteudo);
    }
  }, [anotacao]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await editar.mutateAsync({ id: anotacaoId, titulo: titulo || undefined, conteudo });
      toast.success('Anotação salva');
      setChanged(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remover esta anotação?')) return;
    try {
      await deletar.mutateAsync(anotacaoId);
      navigate('/anotacoes', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (isLoading) return <PageSpinner />;
  if (!anotacao) return null;

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <TopBar
        title="Anotação"
        back="/anotacoes"
        right={
          <div className="flex gap-1">
            {changed && (
              <Button size="sm" loading={loading} onClick={handleSave} leftIcon={<Save size={14} />}>
                Salvar
              </Button>
            )}
            <button
              onClick={handleDelete}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 text-red-400"
            >
              <Trash2 size={18} />
            </button>
          </div>
        }
      />

      <div className="flex flex-col flex-1 px-5 py-4 gap-3">
        <input
          value={titulo}
          onChange={(e) => { setTitulo(e.target.value); setChanged(true); }}
          placeholder="Título (opcional)"
          className="text-xl font-bold text-slate-800 outline-none placeholder:text-slate-300 bg-transparent w-full"
        />
        <p className="text-xs text-slate-400">
          {anotacao.atualizadoEm
            ? `Editado ${formatDateTime(anotacao.atualizadoEm)}`
            : `Criado ${formatDateTime(anotacao.criadoEm)}`}
        </p>
        <textarea
          value={conteudo}
          onChange={(e) => { setConteudo(e.target.value); setChanged(true); }}
          placeholder="Escreva suas anotações..."
          className="flex-1 resize-none outline-none text-sm text-slate-700 leading-relaxed placeholder:text-slate-300 bg-transparent min-h-64"
        />
      </div>
    </div>
  );
}
