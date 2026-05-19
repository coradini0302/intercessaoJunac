import { useState } from 'react';
import { Droplets, Heart, Flame, Share2, Settings, Trash2, Edit2, Send, Check } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { useEquipe } from '../hooks/useUsuarios';
import {
  useMinhasDinamicas, useDinamicasMembros, useSetDinamicaMembros,
  useDinamicaPosts, useCriarDinamicaPost, useEditarDinamicaPost, useDeletarDinamicaPost,
} from '../hooks/useDinamicas';
import { TopBar } from '../components/layout/TopBar';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { isAdmin, displayName } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import type { DinamicaPost, TipoDinamica } from '../types';

const DINAMICAS = [
  { tipo: 0 as TipoDinamica, nome: 'Lava-pés', icon: Droplets, color: 'text-sky-500', bg: 'bg-sky-50' },
  { tipo: 1 as TipoDinamica, nome: 'Saco do Choro', icon: Heart, color: 'text-purple-500', bg: 'bg-purple-50' },
  { tipo: 2 as TipoDinamica, nome: 'Partilha do Pão', icon: Share2, color: 'text-amber-500', bg: 'bg-amber-50' },
  { tipo: 3 as TipoDinamica, nome: 'Fogueira', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
] as const;

function timeAgo(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ptBR });
}

function PostCard({
  post, userId, admin, onEdit, onDelete,
}: {
  post: DinamicaPost; userId: string; admin: boolean;
  onEdit: () => void; onDelete: () => void;
}) {
  const isOwn = post.criadoPorId === userId;
  const canAct = isOwn || admin;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-start gap-2.5">
        <Avatar nome={post.nomeCriador} fotoUrl={post.fotoCriador} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800">{post.nomeCriador}</span>
            <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(post.criadoEm)}</span>
          </div>
          {post.titulo && (
            <p className="text-sm font-bold text-slate-700 mt-1">{post.titulo}</p>
          )}
          <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">{post.conteudo}</p>
          {canAct && (
            <div className="flex gap-1 mt-2">
              {isOwn && (
                <button onClick={onEdit} className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 transition-colors px-1.5 py-0.5 rounded-lg hover:bg-primary-50">
                  <Edit2 size={11} /> Editar
                </button>
              )}
              <button onClick={onDelete} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors px-1.5 py-0.5 rounded-lg hover:bg-red-50">
                <Trash2 size={11} /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GerenciarMembrosModal({
  tipo, nomeDinamica, onClose,
}: {
  tipo: TipoDinamica; nomeDinamica: string; onClose: () => void;
}) {
  const { data: equipe = [] } = useEquipe();
  const { data: todosMembros = [] } = useDinamicasMembros();
  const setMembros = useSetDinamicaMembros();

  const currentEntry = todosMembros.find(e => e.tipo === tipo);
  const currentIds = new Set(currentEntry?.membros.map(m => m.usuarioId) ?? []);
  const [selected, setSelected] = useState<Set<string>>(new Set(currentIds));
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleSalvar = async () => {
    setSaving(true);
    try {
      await setMembros.mutateAsync({ tipo, usuarioIds: [...selected] });
      toast.success('Membros atualizados!');
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Membros — ${nomeDinamica}`}
      footer={<Button fullWidth loading={saving} onClick={handleSalvar}>Salvar</Button>}
    >
      <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
        {equipe.map(m => {
          const sel = selected.has(m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors text-left ${sel ? 'bg-primary-50 border border-primary-200' : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <Avatar nome={m.nome} fotoUrl={m.fotoUrl} size="sm" />
              <span className="flex-1 text-sm text-slate-800">{displayName(m.nome, m.apelido)}</span>
              {sel && <Check size={16} className="text-primary-600 shrink-0" />}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

function DinamicaTab({
  tipo, userId, admin, isMembro,
}: {
  tipo: TipoDinamica; userId: string; admin: boolean; isMembro: boolean;
}) {
  const config = DINAMICAS.find(d => d.tipo === tipo)!;
  const { data: posts = [], isLoading } = useDinamicaPosts(tipo);
  const criar = useCriarDinamicaPost(tipo);
  const editar = useEditarDinamicaPost(tipo);
  const deletar = useDeletarDinamicaPost(tipo);

  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoConteudo, setNovoConteudo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<DinamicaPost | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editConteudo, setEditConteudo] = useState('');
  const [membrosOpen, setMembrosOpen] = useState(false);

  const { data: todosMembros = [] } = useDinamicasMembros();
  const currentMembros = todosMembros.find(e => e.tipo === tipo)?.membros ?? [];

  const handleCriar = async () => {
    if (!novoConteudo.trim()) return;
    setSubmitting(true);
    try {
      await criar.mutateAsync({ titulo: novoTitulo.trim() || undefined, conteudo: novoConteudo.trim() });
      setNovoTitulo('');
      setNovoConteudo('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (post: DinamicaPost) => {
    setEditingPost(post);
    setEditTitulo(post.titulo ?? '');
    setEditConteudo(post.conteudo);
  };

  const handleEditar = async () => {
    if (!editingPost || !editConteudo.trim()) return;
    try {
      await editar.mutateAsync({ id: editingPost.id, titulo: editTitulo.trim() || undefined, conteudo: editConteudo.trim() });
      toast.success('Atualizado!');
      setEditingPost(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDeletar = async (postId: number) => {
    try {
      await deletar.mutateAsync(postId);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-4 max-w-2xl w-full">
      {!isMembro && !admin && (
        <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-500 text-center">
          Você não faz parte desta dinâmica — somente leitura.
        </div>
      )}

      {admin && (
        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
          <span className="text-xs text-slate-500">
            {currentMembros.length} membro{currentMembros.length !== 1 ? 's' : ''}
            {currentMembros.length > 0 && ': ' + currentMembros.map(m => m.apelido ?? m.nome.split(' ')[0]).join(', ')}
          </span>
          <button
            onClick={() => setMembrosOpen(true)}
            className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline"
          >
            <Settings size={12} /> Gerenciar
          </button>
        </div>
      )}

      {isLoading && <PageSpinner />}

      {!isLoading && posts.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <config.icon size={32} className={config.color + ' opacity-30'} />
          <p className="text-slate-400 text-sm">Nenhuma mensagem ainda. Seja o primeiro!</p>
        </div>
      )}

      {!isLoading && posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          userId={userId}
          admin={admin}
          onEdit={() => openEdit(post)}
          onDelete={() => handleDeletar(post.id)}
        />
      ))}

      {/* Nova mensagem — só para membros e admin */}
      {(isMembro || admin) && <div className="bg-white rounded-2xl border border-slate-200 p-3 mt-1">
        <input
          type="text"
          placeholder="Título (opcional)"
          value={novoTitulo}
          onChange={e => setNovoTitulo(e.target.value)}
          className="w-full text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none mb-2"
        />
        <textarea
          placeholder="Escreva uma mensagem para o grupo..."
          value={novoConteudo}
          onChange={e => setNovoConteudo(e.target.value)}
          rows={3}
          className="w-full text-sm text-slate-700 placeholder:text-slate-300 outline-none resize-none leading-relaxed"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleCriar}
            disabled={!novoConteudo.trim() || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-medium disabled:opacity-40 hover:bg-primary-700 transition-colors"
          >
            <Send size={13} /> Publicar
          </button>
        </div>
      </div>}

      {editingPost && (
        <Modal
          isOpen
          onClose={() => setEditingPost(null)}
          title="Editar mensagem"
          footer={
            <div className="flex gap-2">
              <Button variant="outline" fullWidth onClick={() => setEditingPost(null)}>Cancelar</Button>
              <Button fullWidth onClick={handleEditar}>Salvar</Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Título (opcional)"
              value={editTitulo}
              onChange={e => setEditTitulo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400"
            />
            <textarea
              rows={4}
              value={editConteudo}
              onChange={e => setEditConteudo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary-400 resize-none"
            />
          </div>
        </Modal>
      )}

      {membrosOpen && (
        <GerenciarMembrosModal
          tipo={tipo}
          nomeDinamica={config.nome}
          onClose={() => setMembrosOpen(false)}
        />
      )}
    </div>
  );
}

export function DinamicasPage() {
  const { user } = useAuth();
  const admin = user && isAdmin(user.role);
  const { data: minhasDinamicas = [], isLoading } = useMinhasDinamicas();

  const [abaAtiva, setAbaAtiva] = useState<TipoDinamica | null>(null);
  const abaEfetiva = abaAtiva ?? DINAMICAS[0].tipo;

  if (isLoading) return (
    <div className="flex flex-col">
      <TopBar title="Dinâmicas" gradient />
      <PageSpinner />
    </div>
  );

  return (
    <div className="flex flex-col">
      <TopBar title="Dinâmicas" gradient />

      {/* Tab bar */}
      <div className="flex bg-white border-b border-slate-100 sticky top-14 md:top-16 z-10 overflow-x-auto scrollbar-none">
        {DINAMICAS.map(({ tipo, nome, icon: Icon, color }) => (
          <button
            key={tipo}
            onClick={() => setAbaAtiva(tipo)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 shrink-0 transition-colors ${
              abaEfetiva === tipo
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} className={abaEfetiva === tipo ? color : 'text-slate-400'} />
            {nome}
          </button>
        ))}
      </div>

      <DinamicaTab
        key={abaEfetiva}
        tipo={abaEfetiva}
        userId={user?.userId ?? ''}
        admin={!!admin}
        isMembro={!!admin || minhasDinamicas.includes(abaEfetiva)}
      />
    </div>
  );
}
