import { useState } from 'react';
import { Plus, Trash2, Edit2, MessageCircle, Send, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import {
  useAltoMarIdeias, useCriarAltoMarIdeia, useEditarAltoMarIdeia,
  useDeletarAltoMarIdeia, useCriarAltoMarComentario, useDeletarAltoMarComentario,
} from '../hooks/useAltoMar';
import { TopBar } from '../components/layout/TopBar';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageSpinner } from '../components/ui/Spinner';
import { isAdmin } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import type { AltoMarIdeia, AltoMarComentario } from '../types';

function timeAgo(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ptBR });
}

function ComentarioItem({
  comentario, userId, admin, ideiaId,
}: {
  comentario: AltoMarComentario; userId: string; admin: boolean; ideiaId: number;
}) {
  const deletar = useDeletarAltoMarComentario();
  const canDelete = comentario.criadoPorId === userId || admin;

  const handleDelete = async () => {
    try {
      await deletar.mutateAsync({ ideiaId, comentarioId: comentario.id });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="flex items-start gap-2 py-2">
      <Avatar nome={comentario.nomeCriador} fotoUrl={comentario.fotoCriador} size="xs" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-700">{comentario.nomeCriador}</span>
          <span className="text-[10px] text-slate-400">{timeAgo(comentario.criadoEm)}</span>
        </div>
        <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-wrap leading-relaxed">{comentario.texto}</p>
      </div>
      {canDelete && (
        <button onClick={handleDelete} className="shrink-0 text-slate-300 hover:text-red-400 transition-colors mt-0.5">
          <Trash2 size={11} />
        </button>
      )}
    </div>
  );
}

function IdeiaCard({
  ideia, userId, admin,
}: {
  ideia: AltoMarIdeia; userId: string; admin: boolean;
}) {
  const deletarIdeia = useDeletarAltoMarIdeia();
  const criarComentario = useCriarAltoMarComentario();

  const [showComments, setShowComments] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitulo, setEditTitulo] = useState(ideia.titulo);
  const [editConteudo, setEditConteudo] = useState(ideia.conteudo);
  const editarIdeia = useEditarAltoMarIdeia();

  const isOwn = ideia.criadoPorId === userId;
  const canDelete = isOwn || admin;

  const handleDelete = async () => {
    try {
      await deletarIdeia.mutateAsync(ideia.id);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleEditar = async () => {
    if (!editTitulo.trim() || !editConteudo.trim()) return;
    try {
      await editarIdeia.mutateAsync({ id: ideia.id, titulo: editTitulo.trim(), conteudo: editConteudo.trim() });
      toast.success('Ideia atualizada!');
      setEditOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleComentar = async () => {
    if (!comentarioTexto.trim()) return;
    setSendingComment(true);
    try {
      await criarComentario.mutateAsync({ ideiaId: ideia.id, texto: comentarioTexto.trim() });
      setComentarioTexto('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-2.5">
          <Avatar nome={ideia.nomeCriador} fotoUrl={ideia.fotoCriador} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-slate-800">{ideia.nomeCriador}</span>
              <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(ideia.criadoEm)}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-1 leading-snug">{ideia.titulo}</h3>
            <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-wrap leading-relaxed">{ideia.conteudo}</p>
            {ideia.atualizadoEm && (
              <span className="text-[10px] text-slate-300 italic">editado</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-50">
          <button
            onClick={() => setShowComments(v => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-600 transition-colors px-2 py-1 rounded-lg hover:bg-primary-50"
          >
            <MessageCircle size={13} />
            {ideia.comentarios.length > 0 ? `${ideia.comentarios.length} comentário${ideia.comentarios.length !== 1 ? 's' : ''}` : 'Comentar'}
            {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <div className="flex-1" />
          {isOwn && (
            <button
              onClick={() => { setEditOpen(true); setEditTitulo(ideia.titulo); setEditConteudo(ideia.conteudo); }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 transition-colors px-1.5 py-1 rounded-lg hover:bg-primary-50"
            >
              <Edit2 size={12} /> Editar
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors px-1.5 py-1 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={12} /> Excluir
            </button>
          )}
        </div>
      </div>

      {/* Comentários */}
      {showComments && (
        <div className="border-t border-slate-50 px-4 pb-3">
          {ideia.comentarios.length > 0 && (
            <div className="divide-y divide-slate-50">
              {ideia.comentarios.map(c => (
                <ComentarioItem
                  key={c.id}
                  comentario={c}
                  userId={userId}
                  admin={admin}
                  ideiaId={ideia.id}
                />
              ))}
            </div>
          )}
          {ideia.comentarios.length === 0 && (
            <p className="text-xs text-slate-400 py-2 text-center">Nenhum comentário ainda.</p>
          )}
          {/* Input comentário */}
          <div className="flex items-end gap-2 mt-2 pt-2 border-t border-slate-50">
            <textarea
              value={comentarioTexto}
              onChange={e => setComentarioTexto(e.target.value)}
              placeholder="Escreva um comentário..."
              rows={2}
              className="flex-1 text-xs text-slate-700 placeholder:text-slate-300 outline-none resize-none rounded-xl border border-slate-200 px-3 py-2 focus:border-primary-300"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComentar(); }
              }}
            />
            <button
              onClick={handleComentar}
              disabled={!comentarioTexto.trim() || sendingComment}
              className="shrink-0 w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-700 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editOpen && (
        <Modal
          isOpen
          onClose={() => setEditOpen(false)}
          title="Editar ideia"
          footer={<Button fullWidth onClick={handleEditar}>Salvar</Button>}
        >
          <div className="flex flex-col gap-3">
            <Input
              label="Título *"
              value={editTitulo}
              onChange={e => setEditTitulo(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Descrição *</label>
              <textarea
                rows={4}
                value={editConteudo}
                onChange={e => setEditConteudo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary-400 resize-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function AltoMarPage() {
  const { user } = useAuth();
  const admin = user && isAdmin(user.role);
  const { data: ideias = [], isLoading } = useAltoMarIdeias();
  const criarIdeia = useCriarAltoMarIdeia();

  const [formOpen, setFormOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCriar = async () => {
    if (!titulo.trim() || !conteudo.trim()) return;
    setSaving(true);
    try {
      await criarIdeia.mutateAsync({ titulo: titulo.trim(), conteudo: conteudo.trim() });
      toast.success('Ideia publicada!');
      setFormOpen(false);
      setTitulo('');
      setConteudo('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      <TopBar
        title="Alto Mar"
        gradient
        right={
          <button
            onClick={() => setFormOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Nova ideia"
          >
            <Plus size={18} />
          </button>
        }
      />

      <div className="px-4 py-4 flex flex-col gap-3 max-w-2xl w-full mx-auto">
        {isLoading && <PageSpinner />}

        {!isLoading && ideias.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Lightbulb size={40} className="text-slate-200" />
            <p className="text-slate-400 text-sm">Nenhuma ideia ainda.<br />Seja o primeiro a compartilhar!</p>
            <button onClick={() => setFormOpen(true)} className="text-sm text-primary-600 hover:underline">
              + Publicar ideia
            </button>
          </div>
        )}

        {!isLoading && ideias.map(ideia => (
          <IdeiaCard
            key={ideia.id}
            ideia={ideia}
            userId={user?.userId ?? ''}
            admin={!!admin}
          />
        ))}
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Nova ideia"
        footer={<Button fullWidth loading={saving} onClick={handleCriar}>Publicar</Button>}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Título *"
            placeholder="Resumo da sua ideia..."
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Descrição *</label>
            <textarea
              rows={5}
              placeholder="Descreva sua ideia com detalhes..."
              value={conteudo}
              onChange={e => setConteudo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-primary-400 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
