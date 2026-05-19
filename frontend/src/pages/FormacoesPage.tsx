import { useState } from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { useEquipe } from '../hooks/useUsuarios';
import { useFormacoes, useCriarFormacao, useEditarFormacao, useDeletarFormacao } from '../hooks/useFormacoes';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { MentionTextarea } from '../components/ui/MentionTextarea';
import { PageSpinner } from '../components/ui/Spinner';
import { isAdmin } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import type { Formacao } from '../types';

interface FormState { titulo: string; conteudo: string }
const FORM_VAZIO: FormState = { titulo: '', conteudo: '' };

export function FormacoesPage() {
  const { user } = useAuth();
  const admin = user && isAdmin(user.role);
  const { data: membros = [] } = useEquipe();
  const { data: formacoes = [], isLoading } = useFormacoes();

  const [selected, setSelected] = useState<Formacao | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Formacao | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [saving, setSaving] = useState(false);

  const criar = useCriarFormacao();
  const editar = useEditarFormacao();
  const deletar = useDeletarFormacao();

  const openAdd = () => {
    setEditing(null);
    setForm(FORM_VAZIO);
    setFormOpen(true);
  };

  const openEdit = (f: Formacao) => {
    setEditing(f);
    setForm({ titulo: f.titulo, conteudo: f.conteudo });
    setSelected(null);
    setFormOpen(true);
  };

  const handleSalvar = async () => {
    if (!form.titulo.trim() || !form.conteudo.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await editar.mutateAsync({ id: editing.id, ...form });
        toast.success('Formação atualizada!');
      } else {
        await criar.mutateAsync(form);
        toast.success('Formação publicada!');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletar = async (f: Formacao) => {
    try {
      await deletar.mutateAsync(f.id);
      setSelected(null);
      toast.success('Formação removida!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col">
      <TopBar
        title="Formações"
        gradient
        right={
          admin ? (
            <button
              onClick={openAdd}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Nova formação"
            >
              <Plus size={18} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 py-4 flex flex-col gap-3 max-w-2xl w-full mx-auto">
        {isLoading && <PageSpinner />}

        {!isLoading && formacoes.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <GraduationCap size={40} className="text-slate-200" />
            <p className="text-slate-400 text-sm">Nenhuma formação publicada ainda.</p>
            {admin && (
              <button onClick={openAdd} className="text-sm text-primary-600 hover:underline">
                + Publicar primeira formação
              </button>
            )}
          </div>
        )}

        {!isLoading && formacoes.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelected(f)}
            className="w-full text-left bg-white rounded-2xl border border-slate-100 p-4 hover:border-primary-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <GraduationCap size={20} className="text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm leading-snug">{f.titulo}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{f.conteudo}</p>
                <p className="text-[11px] text-slate-300 mt-2">
                  Por {f.nomeCriador} · {formatDistanceToNow(parseISO(f.criadoEm), { addSuffix: true, locale: ptBR })}
                  {f.atualizadoEm && ' · editado'}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Modal de detalhe */}
      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          title={selected.titulo}
          footer={
            admin ? (
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(selected)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeletar(selected)}
                  className="flex-1 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Excluir
                </button>
              </div>
            ) : undefined
          }
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selected.conteudo}</p>
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-50">
              Publicado por {selected.nomeCriador}
              {selected.atualizadoEm && ' · editado'}
            </p>
          </div>
        </Modal>
      )}

      {/* Modal de formulário */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar formação' : 'Nova formação'}
        footer={<Button fullWidth loading={saving} onClick={handleSalvar}>Salvar</Button>}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Título *"
            placeholder="Ex: Oração intercessória, Jejum e propósito..."
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
          <MentionTextarea
            label="Conteúdo *"
            placeholder="Escreva o conteúdo da formação..."
            rows={6}
            value={form.conteudo}
            onChange={(v) => setForm({ ...form, conteudo: v })}
            membros={membros}
          />
        </div>
      </Modal>
    </div>
  );
}
