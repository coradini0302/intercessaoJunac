import { useState } from 'react';
import { Plus, Edit2, Trash2, Archive, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEncontroAtivo } from '../hooks/useEncontro';
import {
  useMeusIntercedidos, useAdicionarIntercedido, useEditarIntercedido,
  useArquivarIntercedido, useDeletarIntercedido,
  useCompromissosEquipe, useAdicionarCompromissoEquipe,
  useEditarCompromissoEquipe, useDeletarCompromissoEquipe,
} from '../hooks/useCompromissos';
import { TopBar } from '../components/layout/TopBar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { PageSpinner } from '../components/ui/Spinner';
import { isAdmin } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import type { CompromissoIntercedido, CompromissoEquipe } from '../types';

export function OracaoPage() {
  const { user } = useAuth();
  const admin = user && isAdmin(user.role);
  const { data: encontro } = useEncontroAtivo();

  const [aba, setAba] = useState<'intercessao' | 'equipe'>('intercessao');
  const [mostraArquivados, setMostraArquivados] = useState(false);

  // Meus Compromissos form state
  const [modalMeus, setModalMeus] = useState(false);
  const [editingMeus, setEditingMeus] = useState<CompromissoIntercedido | null>(null);
  const [tituloMeus, setTituloMeus] = useState('');
  const [conteudoMeus, setConteudoMeus] = useState('');

  // Semana equipe form state
  const [modalEquipe, setModalEquipe] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState<CompromissoEquipe | null>(null);
  const [numSemana, setNumSemana] = useState('');
  const [tituloEquipe, setTituloEquipe] = useState('');
  const [conteudoEquipe, setConteudoEquipe] = useState('');

  const [loading, setLoading] = useState(false);

  const { data: meusIntercedidos, isLoading: loadingMeus } = useMeusIntercedidos(!mostraArquivados);
  const { data: compromissosEquipe, isLoading: loadingEquipe } = useCompromissosEquipe(encontro?.id);

  const adicionarIntercedido = useAdicionarIntercedido();
  const editarIntercedido = useEditarIntercedido();
  const arquivarIntercedido = useArquivarIntercedido();
  const deletarIntercedido = useDeletarIntercedido();
  const adicionarEquipe = useAdicionarCompromissoEquipe();
  const editarEquipe = useEditarCompromissoEquipe();
  const deletarEquipe = useDeletarCompromissoEquipe();

  // ── Meus Compromissos handlers ────────────────────────────────────────────
  const openAddMeus = () => {
    setEditingMeus(null);
    setTituloMeus('');
    setConteudoMeus('');
    setModalMeus(true);
  };

  const openEditMeus = (c: CompromissoIntercedido) => {
    setEditingMeus(c);
    setTituloMeus(c.titulo);
    setConteudoMeus(c.conteudo);
    setModalMeus(true);
  };

  const handleSalvarMeus = async () => {
    if (!tituloMeus.trim() || !conteudoMeus.trim()) return;
    setLoading(true);
    try {
      if (editingMeus) {
        await editarIntercedido.mutateAsync({ id: editingMeus.id, titulo: tituloMeus, conteudo: conteudoMeus });
        toast.success('Compromisso atualizado!');
      } else {
        await adicionarIntercedido.mutateAsync({ titulo: tituloMeus, conteudo: conteudoMeus });
        toast.success('Compromisso criado!');
      }
      setModalMeus(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleArquivar = async (id: number) => {
    try {
      await arquivarIntercedido.mutateAsync(id);
      toast.success(mostraArquivados ? 'Compromisso reativado!' : 'Compromisso arquivado!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDeletarMeus = async (id: number) => {
    try {
      await deletarIntercedido.mutateAsync(id);
      toast.success('Compromisso removido!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // ── Semana equipe handlers ────────────────────────────────────────────────
  const openAddEquipe = () => {
    setEditingEquipe(null);
    setNumSemana('');
    setTituloEquipe('');
    setConteudoEquipe('');
    setModalEquipe(true);
  };

  const openEditEquipe = (c: CompromissoEquipe) => {
    setEditingEquipe(c);
    setNumSemana(String(c.numeroSemana));
    setTituloEquipe(c.titulo);
    setConteudoEquipe(c.conteudo ?? '');
    setModalEquipe(true);
  };

  const handleSalvarEquipe = async () => {
    if (!tituloEquipe.trim() || (!editingEquipe && !numSemana) || !encontro?.id) return;
    setLoading(true);
    try {
      if (editingEquipe) {
        await editarEquipe.mutateAsync({ id: editingEquipe.id, titulo: tituloEquipe, conteudo: conteudoEquipe });
        toast.success('Publicação atualizada!');
      } else {
        await adicionarEquipe.mutateAsync({
          encontroId: encontro.id,
          numeroSemana: Number(numSemana),
          titulo: tituloEquipe,
          conteudo: conteudoEquipe,
        });
        toast.success('Compromisso publicado!');
      }
      setModalEquipe(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarEquipe = async (id: number) => {
    try {
      await deletarEquipe.mutateAsync(id);
      toast.success('Removido!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const sortedEquipe = [...(compromissosEquipe ?? [])].sort((a, b) => {
    if (a.semanaAtual && !b.semanaAtual) return -1;
    if (!a.semanaAtual && b.semanaAtual) return 1;
    return b.numeroSemana - a.numeroSemana;
  });

  return (
    <div className="flex flex-col">
      <TopBar title="Compromissos de Oração" gradient />

      {/* Tab nav */}
      <div className="flex bg-white border-b border-slate-100 sticky top-14 md:top-16 z-10">
        <button
          onClick={() => setAba('intercessao')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            aba === 'intercessao'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Compromissos Intercessão
        </button>
        <button
          onClick={() => setAba('equipe')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            aba === 'equipe'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Equipe Intercedida
        </button>
      </div>

      {/* ── Aba 1: Compromissos Intercessão ── */}
      {aba === 'intercessao' && (
        <div className="px-4 py-4 flex flex-col gap-3 max-w-2xl w-full">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMostraArquivados(!mostraArquivados)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                mostraArquivados
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Archive size={13} />
              {mostraArquivados ? 'Ver ativos' : 'Arquivados'}
            </button>
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={openAddMeus}>
              Novo
            </Button>
          </div>

          {loadingMeus && <PageSpinner />}

          {!loadingMeus && meusIntercedidos?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                <BookOpen size={22} className="text-amber-400" />
              </div>
              <p className="text-slate-500 text-sm">
                {mostraArquivados
                  ? 'Nenhum compromisso arquivado.'
                  : 'Você ainda não tem compromissos de oração.'}
              </p>
              {!mostraArquivados && (
                <Button size="sm" leftIcon={<Plus size={14} />} onClick={openAddMeus}>
                  Criar primeiro
                </Button>
              )}
            </div>
          )}

          {meusIntercedidos?.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="font-semibold text-slate-800 text-sm leading-snug flex-1">{c.titulo}</p>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => openEditMeus(c)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
                    title="Editar"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleArquivar(c.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500"
                    title={mostraArquivados ? 'Reativar' : 'Arquivar'}
                  >
                    <Archive size={13} />
                  </button>
                  <button
                    onClick={() => handleDeletarMeus(c.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-400"
                    title="Excluir"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 line-clamp-4 leading-relaxed">{c.conteudo}</p>
              {c.equipeIntercessao && (
                <p className="text-xs text-slate-400 mt-2">{c.equipeIntercessao}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Aba 2: Intercessão da Semana ── */}
      {aba === 'equipe' && (
        <div className="px-4 py-4 flex flex-col gap-3 max-w-2xl w-full">
          {admin && (
            <div className="flex justify-end">
              <Button size="sm" leftIcon={<Plus size={14} />} onClick={openAddEquipe}>
                Publicar
              </Button>
            </div>
          )}

          {loadingEquipe && <PageSpinner />}

          {!loadingEquipe && sortedEquipe.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                <BookOpen size={22} className="text-primary-400" />
              </div>
              <p className="text-slate-500 text-sm">Nenhum compromisso publicado ainda.</p>
            </div>
          )}

          {sortedEquipe.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-2xl border shadow-card p-4 ${
                c.semanaAtual ? 'border-primary-200 ring-1 ring-primary-100' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Semana {c.numeroSemana}
                    </span>
                    {c.semanaAtual && <Badge label="Atual" variant="blue" />}
                  </div>
                  <p className="font-semibold text-slate-800 text-sm leading-snug">{c.titulo}</p>
                </div>
                {admin && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => openEditEquipe(c)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeletarEquipe(c.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
              {c.conteudo && (
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{c.conteudo}</p>
              )}
              <p className="text-xs text-slate-400 mt-3">Por {c.nomeCriadoPor}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Meus Compromissos */}
      <Modal
        isOpen={modalMeus}
        onClose={() => setModalMeus(false)}
        title={editingMeus ? 'Editar compromisso' : 'Novo compromisso'}
        footer={
          <Button fullWidth loading={loading} onClick={handleSalvarMeus}>
            {editingMeus ? 'Salvar' : 'Criar'}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Título"
            placeholder="Ex: Orar pela unidade da equipe"
            value={tituloMeus}
            onChange={(e) => setTituloMeus(e.target.value)}
          />
          <Textarea
            label="Conteúdo"
            placeholder="Descreva o compromisso de oração..."
            rows={5}
            value={conteudoMeus}
            onChange={(e) => setConteudoMeus(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal: Intercessão da Semana (admin) */}
      {admin && (
        <Modal
          isOpen={modalEquipe}
          onClose={() => setModalEquipe(false)}
          title={editingEquipe ? 'Editar publicação' : 'Publicar compromisso da semana'}
          footer={
            <Button fullWidth loading={loading} onClick={handleSalvarEquipe}>
              {editingEquipe ? 'Salvar' : 'Publicar'}
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            {!editingEquipe && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Semana</label>
                <select
                  value={numSemana}
                  onChange={(e) => setNumSemana(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400"
                >
                  <option value="">Selecione a semana</option>
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>Semana {n}</option>
                  ))}
                </select>
              </div>
            )}
            <Input
              label="Título"
              placeholder="Ex: Semana de Jejum e Intercessão"
              value={tituloEquipe}
              onChange={(e) => setTituloEquipe(e.target.value)}
            />
            <Textarea
              label="Conteúdo"
              placeholder="Descreva os compromissos da equipe para essa semana..."
              rows={6}
              value={conteudoEquipe}
              onChange={(e) => setConteudoEquipe(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
