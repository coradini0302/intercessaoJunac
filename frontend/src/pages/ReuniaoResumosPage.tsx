import { useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { useEquipe } from '../hooks/useUsuarios';
import {
  useReuniaoResumos,
  useCriarReuniaoResumo,
  useEditarReuniaoResumo,
  useDeletarReuniaoResumo,
} from '../hooks/useReuniaoResumos';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { MentionTextarea } from '../components/ui/MentionTextarea';
import { PageSpinner } from '../components/ui/Spinner';
import { isAdmin } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import type { ReuniaoResumo } from '../types';

interface ResumoForm {
  titulo: string;
  conteudo: string;
  dataReuniao: string;
}

const FORM_VAZIO: ResumoForm = { titulo: '', conteudo: '', dataReuniao: '' };

function formatDataReuniao(iso: string): { dia: string; mes: string; completa: string } {
  // Usa apenas a parte da data (YYYY-MM-DD) para evitar deslocamento por fuso horário
  const d = parseISO(iso.slice(0, 10));
  return {
    dia: format(d, 'dd'),
    mes: format(d, 'MMM', { locale: ptBR }),
    completa: format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
  };
}

export function ReuniaoResumosPage() {
  const { user } = useAuth();
  const admin = user && isAdmin(user.role);
  const { data: membros = [] } = useEquipe();
  const { data: resumos = [], isLoading } = useReuniaoResumos();

  const [selected, setSelected] = useState<ReuniaoResumo | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ReuniaoResumo | null>(null);
  const [form, setForm] = useState<ResumoForm>(FORM_VAZIO);
  const [saving, setSaving] = useState(false);

  const criar = useCriarReuniaoResumo();
  const editar = useEditarReuniaoResumo();
  const deletar = useDeletarReuniaoResumo();

  const openAdd = () => {
    setEditing(null);
    setForm({ ...FORM_VAZIO, dataReuniao: format(new Date(), 'yyyy-MM-dd') });
    setFormOpen(true);
  };

  const openEdit = (r: ReuniaoResumo) => {
    setEditing(r);
    setForm({
      titulo: r.titulo,
      conteudo: r.conteudo,
      dataReuniao: r.dataReuniao.slice(0, 10),
    });
    setSelected(null);
    setFormOpen(true);
  };

  const handleSalvar = async () => {
    if (!form.titulo.trim() || !form.conteudo.trim() || !form.dataReuniao) return;
    setSaving(true);
    try {
      if (editing) {
        await editar.mutateAsync({ id: editing.id, ...form });
        toast.success('Resumo atualizado!');
      } else {
        await criar.mutateAsync(form);
        toast.success('Resumo publicado!');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletar = async (r: ReuniaoResumo) => {
    try {
      await deletar.mutateAsync(r.id);
      setSelected(null);
      toast.success('Resumo removido!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col">
      <TopBar
        title="Resumo - Reuniões"
        gradient
        right={
          admin ? (
            <button
              onClick={openAdd}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Publicar resumo"
            >
              <Plus size={18} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 py-4 flex flex-col gap-3 max-w-2xl w-full mx-auto">
        {isLoading && <PageSpinner />}

        {!isLoading && resumos.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ClipboardList size={40} className="text-slate-200" />
            <p className="text-slate-400 text-sm">Nenhum resumo publicado ainda.</p>
            {admin && (
              <button onClick={openAdd} className="text-sm text-primary-600 hover:underline">
                + Publicar primeiro resumo
              </button>
            )}
          </div>
        )}

        {!isLoading && resumos.map((r) => {
          const { dia, mes } = formatDataReuniao(r.dataReuniao);
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="w-full text-left bg-white rounded-2xl border border-slate-100 p-4 hover:border-primary-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary-600 leading-none">{dia}</span>
                  <span className="text-[10px] font-medium text-primary-400 uppercase mt-0.5">{mes}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm leading-snug">{r.titulo}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{r.conteudo}</p>
                  <p className="text-[11px] text-slate-300 mt-2">Por {r.nomeCriador}</p>
                </div>
              </div>
            </button>
          );
        })}
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
            <p className="text-sm font-medium text-primary-600">
              {formatDataReuniao(selected.dataReuniao).completa}
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {selected.conteudo}
            </p>
            <p className="text-xs text-slate-400 pt-1 border-t border-slate-50">
              Publicado por {selected.nomeCriador}
            </p>
          </div>
        </Modal>
      )}

      {/* Modal de formulário */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar resumo' : 'Publicar resumo'}
        footer={<Button fullWidth loading={saving} onClick={handleSalvar}>Salvar</Button>}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Título *"
            placeholder="Ex: Reunião de liderança, Encontro de equipe..."
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Data da reunião *</label>
            <input
              type="date"
              value={form.dataReuniao}
              onChange={(e) => setForm({ ...form, dataReuniao: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400"
            />
          </div>
          <MentionTextarea
            label="Resumo *"
            placeholder="Escreva aqui o resumo da reunião..."
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
