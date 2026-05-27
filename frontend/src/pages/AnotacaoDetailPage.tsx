import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
  const draftKey = `anotacao-draft-${anotacaoId}`;

  const { data: anotacao, isLoading } = useAnotacao(anotacaoId);
  const editar = useEditarAnotacao();
  const deletar = useDeletarAnotacao();

  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [changed, setChanged] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!anotacao || initialized.current) return;
    initialized.current = true;
    const raw = localStorage.getItem(draftKey);
    if (raw) {
      try {
        const draft = JSON.parse(raw) as { titulo: string; conteudo: string; savedAt: string };
        const serverDate = new Date(anotacao.atualizadoEm ?? anotacao.criadoEm);
        if (new Date(draft.savedAt) > serverDate) {
          setTitulo(draft.titulo);
          setConteudo(draft.conteudo);
          setChanged(true);
          return;
        }
      } catch { /**/ }
      localStorage.removeItem(draftKey);
    }
    setTitulo(anotacao.titulo ?? '');
    setConteudo(anotacao.conteudo);
  }, [anotacao, draftKey]);

  const saveDraft = (newTitulo: string, newConteudo: string) => {
    localStorage.setItem(draftKey, JSON.stringify({
      titulo: newTitulo,
      conteudo: newConteudo,
      savedAt: new Date().toISOString(),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await editar.mutateAsync({ id: anotacaoId, titulo: titulo || undefined, conteudo });
      localStorage.removeItem(draftKey);
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
      localStorage.removeItem(draftKey);
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
          onChange={(e) => {
            setTitulo(e.target.value);
            setChanged(true);
            saveDraft(e.target.value, conteudo);
          }}
          placeholder="Título (opcional)"
          className="text-xl font-bold text-slate-800 outline-none placeholder:text-slate-300 bg-transparent w-full"
        />
        <p className="text-xs text-slate-400">
          {changed ? <><span className="text-amber-500">Rascunho</span> · </> : null}
          {anotacao.atualizadoEm
            ? `Editado ${formatDateTime(anotacao.atualizadoEm)}`
            : `Criado ${formatDateTime(anotacao.criadoEm)}`}
        </p>
        <textarea
          value={conteudo}
          onChange={(e) => {
            setConteudo(e.target.value);
            setChanged(true);
            saveDraft(titulo, e.target.value);
          }}
          placeholder="Escreva suas anotações..."
          className="flex-1 resize-none outline-none text-sm text-slate-700 leading-relaxed placeholder:text-slate-300 bg-transparent min-h-64"
        />
      </div>
    </div>
  );
}
