import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Archive, BookOpen, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { useEquipe } from '../hooks/useUsuarios';
import { useEncontroAtivo } from '../hooks/useEncontro';
import {
  useIntercedidos, useAdicionarIntercedido, useEditarIntercedido,
  useArquivarIntercedido, useDeletarIntercedido,
  useCompromissosEquipe, useAdicionarCompromissoEquipe,
  useEditarCompromissoEquipe, useDeletarCompromissoEquipe,
} from '../hooks/useCompromissos';
import { TopBar } from '../components/layout/TopBar';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { MentionTextarea } from '../components/ui/MentionTextarea';
import { PageSpinner } from '../components/ui/Spinner';
import { displayName, isAdmin } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import type { CompromissoIntercedido, CompromissoEquipe } from '../types';

// ── Período JUNAC XXIX ────────────────────────────────────────────────────────
const DATA_FIM = new Date('2026-08-22T20:00:00Z');
const DATA_INICIO = new Date(DATA_FIM.getTime() - 16 * 7 * 24 * 60 * 60 * 1000);

function getSemanaAtual(): number {
  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);
  if (hoje < DATA_INICIO) return 1;
  if (hoje > DATA_FIM) return 16;
  const dias = Math.floor((hoje.getTime() - DATA_INICIO.getTime()) / 86400000);
  return Math.min(Math.floor(dias / 7) + 1, 16);
}

function getInicioSemana(n: number): Date {
  return new Date(DATA_INICIO.getTime() + (n - 1) * 7 * 86400000);
}

function getFimSemana(n: number): Date {
  return new Date(getInicioSemana(n).getTime() + 6 * 86400000);
}

function formatSemanaRange(n: number): string {
  const inicio = getInicioSemana(n);
  const fim = getFimSemana(n);
  return `${format(inicio, 'dd MMM', { locale: ptBR })} – ${format(fim, 'dd MMM', { locale: ptBR })}`;
}

// ── Helpers de data de evento ─────────────────────────────────────────────────
function parseUtcDate(str: string): Date {
  const hasZone = str.endsWith('Z') || str.includes('+') || /\d{2}:\d{2}$/.test(str.slice(-6));
  return parseISO(hasZone ? str : str + 'Z');
}

function formatEventDate(dataHora: string | null, diaInteiro: boolean): string {
  if (!dataHora) return '';
  const d = parseUtcDate(dataHora);
  const dateStr = format(d, "dd 'de' MMM", { locale: ptBR });
  return diaInteiro ? dateStr : `${dateStr} • ${format(d, 'HH:mm')}`;
}

function isEventoPast(dataHora: string | null, diaInteiro: boolean): boolean {
  if (!dataHora) return false;
  const d = parseUtcDate(dataHora);
  return diaInteiro
    ? isBefore(startOfDay(d), startOfDay(new Date()))
    : isBefore(d, new Date());
}

// ── Converte local date+time → UTC ISO string ─────────────────────────────────
function buildDataHora(data: string, horario: string, diaInteiro: boolean): string | null {
  if (!data) return null;
  const str = diaInteiro ? `${data}T00:00:00` : `${data}T${horario || '00:00'}:00`;
  return new Date(str).toISOString();
}

// ── Formulário de evento (estado compartilhado) ───────────────────────────────
interface EventoForm {
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  diaInteiro: boolean;
  numSemana: number;
}

const FORM_VAZIO: EventoForm = { titulo: '', descricao: '', data: '', horario: '', diaInteiro: true, numSemana: 1 };

function fromExistingEquipe(c: CompromissoEquipe): EventoForm {
  const d = c.dataHora ? parseUtcDate(c.dataHora) : null;
  return {
    titulo: c.titulo,
    descricao: c.conteudo ?? '',
    data: d ? format(d, 'yyyy-MM-dd') : '',
    horario: d && !c.diaInteiro ? format(d, 'HH:mm') : '',
    diaInteiro: c.diaInteiro,
    numSemana: c.numeroSemana,
  };
}

function fromExistingIntercedido(c: CompromissoIntercedido): EventoForm {
  const d = c.dataHora ? parseUtcDate(c.dataHora) : null;
  return {
    titulo: c.titulo,
    descricao: c.conteudo ?? '',
    data: d ? format(d, 'yyyy-MM-dd') : '',
    horario: d && !c.diaInteiro ? format(d, 'HH:mm') : '',
    diaInteiro: c.diaInteiro,
    numSemana: c.numeroSemana,
  };
}

// ── Componente de card de evento ──────────────────────────────────────────────
function EventoCard({
  titulo, descricao, dataHora, diaInteiro, passado, arquivado,
  onEdit, onDelete, onArchivar, showActions,
}: {
  titulo: string; descricao: string | null; dataHora: string | null; diaInteiro: boolean;
  passado: boolean; arquivado?: boolean;
  onEdit?: () => void; onDelete?: () => void; onArchivar?: () => void; showActions: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border p-3.5 transition-opacity ${passado ? 'opacity-60' : ''} ${arquivado ? 'opacity-50' : ''} ${passado ? 'border-slate-100' : 'border-slate-100'}`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {dataHora && (
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={11} className={passado ? 'text-slate-300' : 'text-primary-400'} />
              <span className={`text-[11px] font-medium ${passado ? 'text-slate-400' : 'text-primary-600'}`}>
                {formatEventDate(dataHora, diaInteiro)}
                {diaInteiro && ' • Dia todo'}
              </span>
              {passado && <Badge label="Passado" variant="gray" />}
            </div>
          )}
          <p className={`text-sm font-semibold leading-snug ${passado ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {titulo}
          </p>
          {descricao && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed whitespace-pre-wrap">{descricao}</p>
          )}
        </div>
        {showActions && (
          <div className="flex items-center gap-0.5 shrink-0">
            {onEdit && (
              <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400" title="Editar">
                <Edit2 size={12} />
              </button>
            )}
            {onArchivar && (
              <button onClick={onArchivar} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500" title={arquivado ? 'Reativar' : 'Arquivar'}>
                <Archive size={12} />
              </button>
            )}
            <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-400" title="Excluir">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente acordeão de semana ─────────────────────────────────────────────
function SemanaSection({
  semana, semanaAtual, open, onToggle, children, onAdd, canAdd,
}: {
  semana: number; semanaAtual: number; open: boolean; onToggle: () => void;
  children: React.ReactNode; onAdd: () => void; canAdd: boolean;
}) {
  const isAtual = semana === semanaAtual;
  return (
    <div className={`rounded-2xl border overflow-hidden ${isAtual ? 'border-primary-200 ring-1 ring-primary-100' : 'border-slate-100'}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${open ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
      >
        {open ? <ChevronDown size={16} className="text-slate-400 shrink-0" /> : <ChevronRight size={16} className="text-slate-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800">Semana {semana}</span>
            {isAtual && <Badge label="Atual" variant="blue" />}
          </div>
          <span className="text-xs text-slate-400">{formatSemanaRange(semana)}</span>
        </div>
        {canAdd && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-primary-50 hover:bg-primary-100 text-primary-600 shrink-0 transition-colors"
            title="Adicionar evento"
          >
            <Plus size={14} />
          </button>
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 flex flex-col gap-2 bg-white border-t border-slate-50">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Modal de evento ───────────────────────────────────────────────────────────
function ModalEvento({
  isOpen, onClose, title, form, setForm, onSalvar, loading, showSemana, showDateTime = true,
}: {
  isOpen: boolean; onClose: () => void; title: string;
  form: EventoForm; setForm: (f: EventoForm) => void;
  onSalvar: () => void; loading: boolean; showSemana?: boolean; showDateTime?: boolean;
}) {
  const { data: membros = [] } = useEquipe();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}
      footer={<Button fullWidth loading={loading} onClick={onSalvar}>Salvar</Button>}
    >
      <div className="flex flex-col gap-4">
        {showSemana && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Semana</label>
            <select
              value={form.numSemana}
              onChange={(e) => setForm({ ...form, numSemana: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400"
            >
              {Array.from({ length: getSemanaAtual() }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>Semana {n}</option>
              ))}
            </select>
          </div>
        )}
        <Input
          label="Título *"
          placeholder="Ex: Jejum coletivo, Reunião de oração..."
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        />
        <MentionTextarea
          label="Descrição"
          placeholder="Detalhes do compromisso (opcional)..."
          rows={3}
          value={form.descricao}
          onChange={(v) => setForm({ ...form, descricao: v })}
          membros={membros}
        />
        {showDateTime && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400"
              />
            </div>
            {form.data && (
              <>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.diaInteiro}
                    onChange={(e) => setForm({ ...form, diaInteiro: e.target.checked })}
                    className="w-4 h-4 rounded accent-primary-600"
                  />
                  <span className="text-sm text-slate-700">Dia todo</span>
                </label>
                {!form.diaInteiro && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Horário de início</label>
                    <input
                      type="time"
                      value={form.horario}
                      onChange={(e) => setForm({ ...form, horario: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400"
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export function OracaoPage() {
  const { user } = useAuth();
  const admin = user && isAdmin(user.role);
  const { data: encontro } = useEncontroAtivo();
  const { data: equipe = [] } = useEquipe();
  const semanaAtual = getSemanaAtual();

  const [aba, setAba] = useState<'intercessao' | 'equipe'>('equipe');
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([semanaAtual]));
  const [mostraArquivados, setMostraArquivados] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string>(user?.userId ?? '');

  const viewingOwn = viewingUserId === user?.userId;
  const viewingMember = equipe.find(m => m.id === viewingUserId);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeus, setEditingMeus] = useState<CompromissoIntercedido | null>(null);
  const [editingEquipe, setEditingEquipe] = useState<CompromissoEquipe | null>(null);
  const [form, setForm] = useState<EventoForm>(FORM_VAZIO);
  const [loading, setLoading] = useState(false);

  const { data: meusIntercedidos, isLoading: loadingMeus } = useIntercedidos(undefined);
  const { data: compromissosEquipe, isLoading: loadingEquipe } = useCompromissosEquipe(encontro?.id);

  const adicionarIntercedido = useAdicionarIntercedido();
  const editarIntercedido = useEditarIntercedido();
  const arquivarIntercedido = useArquivarIntercedido();
  const deletarIntercedido = useDeletarIntercedido();
  const adicionarEquipe = useAdicionarCompromissoEquipe();
  const editarEquipe = useEditarCompromissoEquipe();
  const deletarEquipe = useDeletarCompromissoEquipe();

  const toggleWeek = (n: number) => {
    setOpenWeeks((prev) => {
      const s = new Set(prev);
      s.has(n) ? s.delete(n) : s.add(n);
      return s;
    });
  };

  // Agrupa pessoais por semana (filtrando pelo usuário selecionado)
  const intercedidosPorSemana = useMemo(() => {
    const map = new Map<number, CompromissoIntercedido[]>();
    for (const c of meusIntercedidos ?? []) {
      if (c.usuarioId !== viewingUserId) continue;
      if (!mostraArquivados && !c.ativo) continue;
      const sem = c.numeroSemana > 0 ? c.numeroSemana : semanaAtual;
      if (!map.has(sem)) map.set(sem, []);
      map.get(sem)!.push(c);
    }
    return map;
  }, [meusIntercedidos, mostraArquivados, semanaAtual, viewingUserId]);

  // Agrupa equipe por semana
  const equipePorSemana = useMemo(() => {
    const map = new Map<number, CompromissoEquipe[]>();
    for (const c of compromissosEquipe ?? []) {
      if (!map.has(c.numeroSemana)) map.set(c.numeroSemana, []);
      map.get(c.numeroSemana)!.push(c);
    }
    return map;
  }, [compromissosEquipe]);

  const openModalAdd = (numSemana: number, isEquipe: boolean) => {
    setEditingMeus(null);
    setEditingEquipe(null);
    const inicio = getInicioSemana(numSemana);
    const hoje = new Date();
    // Pré-preenche data: hoje se for semana atual, início da semana senão
    const dataDefault = numSemana === semanaAtual
      ? format(hoje, 'yyyy-MM-dd')
      : format(inicio, 'yyyy-MM-dd');
    setForm({ ...FORM_VAZIO, numSemana, data: dataDefault });
    setModalOpen(true);
    // Indica qual aba está ativa via editingEquipe=null + aba state
    if (isEquipe) setEditingEquipe({ id: -1 } as CompromissoEquipe); // sentinel
  };

  const openModalEdit = (item: CompromissoIntercedido | CompromissoEquipe, isEquipe: boolean) => {
    if (isEquipe) {
      const c = item as CompromissoEquipe;
      setEditingEquipe(c);
      setEditingMeus(null);
      setForm(fromExistingEquipe(c));
    } else {
      const c = item as CompromissoIntercedido;
      setEditingMeus(c);
      setEditingEquipe(null);
      setForm(fromExistingIntercedido(c));
    }
    setModalOpen(true);
  };

  const handleSalvar = async () => {
    if (!form.titulo.trim()) { toast.error('Informe um título.'); return; }
    const dataHora = buildDataHora(form.data, form.horario, form.diaInteiro);
    setLoading(true);
    try {
      const isEquipe = editingEquipe !== null;
      if (isEquipe) {
        const realEdit = editingEquipe && editingEquipe.id !== -1 ? editingEquipe : null;
        if (realEdit) {
          await editarEquipe.mutateAsync({ id: realEdit.id, titulo: form.titulo, conteudo: form.descricao || null, dataHora, diaInteiro: form.diaInteiro });
          toast.success('Compromisso atualizado!');
        } else {
          if (!encontro?.id) { toast.error('Encontro ativo não encontrado.'); return; }
          await adicionarEquipe.mutateAsync({ encontroId: encontro.id, numeroSemana: form.numSemana, titulo: form.titulo, conteudo: form.descricao || null, dataHora, diaInteiro: form.diaInteiro });
          toast.success('Compromisso publicado!');
        }
      } else {
        if (editingMeus) {
          await editarIntercedido.mutateAsync({ id: editingMeus.id, titulo: form.titulo, conteudo: form.descricao || null, dataHora, diaInteiro: form.diaInteiro });
          toast.success('Compromisso atualizado!');
        } else {
          await adicionarIntercedido.mutateAsync({ titulo: form.titulo, conteudo: form.descricao || null, dataHora, diaInteiro: form.diaInteiro });
          toast.success('Compromisso criado!');
        }
      }
      setModalOpen(false);
      setEditingEquipe(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleArquivar = async (id: number, ativo: boolean) => {
    try {
      await arquivarIntercedido.mutateAsync(id);
      toast.success(ativo ? 'Compromisso arquivado!' : 'Compromisso reativado!');
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  const handleDeletarMeus = async (id: number) => {
    try {
      await deletarIntercedido.mutateAsync(id);
      toast.success('Removido!');
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  const handleDeletarEquipe = async (id: number) => {
    try {
      await deletarEquipe.mutateAsync(id);
      toast.success('Removido!');
    } catch (err) { toast.error(extractErrorMessage(err)); }
  };

  const semanas = Array.from({ length: semanaAtual }, (_, i) => semanaAtual - i); // desc
  const isEquipeModal = editingEquipe !== null;

  return (
    <div className="flex flex-col">
      <TopBar title="Compromissos de Oração" gradient />

      {/* Tab nav */}
      <div className="flex bg-white border-b border-slate-100 sticky top-14 md:top-16 z-10">
        {(['equipe', 'intercessao'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAba(tab)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              aba === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'intercessao' ? 'Compromissos Intercessão' : 'Equipe Intercedida'}
          </button>
        ))}
      </div>

      {/* ── Aba: Equipe Intercedida — commitments pessoais por membro ── */}
      {aba === 'equipe' && (
        <div className="px-4 py-4 flex flex-col gap-3 max-w-2xl w-full">

          <div className="flex items-center justify-between">
            <button
              onClick={() => setMostraArquivados(!mostraArquivados)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                mostraArquivados ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Archive size={13} />
              {mostraArquivados ? 'Ocultar arquivados' : 'Ver arquivados'}
            </button>
          </div>

          {/* Person picker */}
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {[...equipe].sort((a, b) => (a.id === user?.userId ? -1 : b.id === user?.userId ? 1 : 0)).map((m) => {
              const isMe = m.id === user?.userId;
              const selected = m.id === viewingUserId;
              return (
                <button
                  key={m.id}
                  onClick={() => setViewingUserId(m.id)}
                  className="flex flex-col items-center gap-1 shrink-0"
                >
                  <div className={`rounded-full p-0.5 transition-all ${selected ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}>
                    <Avatar nome={m.nome} fotoUrl={m.fotoUrl} size="sm" />
                  </div>
                  <span className={`text-[10px] font-medium max-w-[48px] truncate ${selected ? 'text-primary-600' : 'text-slate-500'}`}>
                    {isMe ? 'Eu' : displayName(m.nome, m.apelido)}
                  </span>
                </button>
              );
            })}
          </div>

          {!viewingOwn && viewingMember && (
            <p className="text-xs text-slate-400 text-center -mt-1">
              Visualizando compromissos de <span className="font-medium text-slate-600">{displayName(viewingMember.nome, viewingMember.apelido)}</span>
            </p>
          )}

          {loadingMeus && <PageSpinner />}

          {!loadingMeus && semanas.map((sem) => {
            const items = intercedidosPorSemana.get(sem) ?? [];
            const open = openWeeks.has(sem);
            const canAdd = viewingOwn;
            return (
              <SemanaSection
                key={sem} semana={sem} semanaAtual={semanaAtual}
                open={open} onToggle={() => toggleWeek(sem)}
                onAdd={() => openModalAdd(sem, false)} canAdd={canAdd}
              >
                {items.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <BookOpen size={18} className="text-slate-300" />
                    <p className="text-xs text-slate-400">Nenhum compromisso nessa semana.</p>
                    {canAdd && (
                      <button onClick={() => openModalAdd(sem, false)} className="text-xs text-primary-600 hover:underline">
                        + Adicionar
                      </button>
                    )}
                  </div>
                )}
                {items.map((c) => (
                  <EventoCard
                    key={c.id}
                    titulo={c.titulo}
                    descricao={c.conteudo}
                    dataHora={c.dataHora}
                    diaInteiro={c.diaInteiro}
                    passado={isEventoPast(c.dataHora, c.diaInteiro)}
                    arquivado={!c.ativo}
                    showActions={viewingOwn}
                    onEdit={viewingOwn ? () => openModalEdit(c, false) : undefined}
                    onArchivar={viewingOwn ? () => handleArquivar(c.id, c.ativo) : undefined}
                    onDelete={viewingOwn ? () => handleDeletarMeus(c.id) : undefined}
                  />
                ))}
              </SemanaSection>
            );
          })}
        </div>
      )}

      {/* ── Aba: Compromissos Intercessão — agenda compartilhada (admin) ── */}
      {aba === 'intercessao' && (
        <div className="px-4 py-4 flex flex-col gap-3 max-w-2xl w-full">

          {loadingEquipe && <PageSpinner />}

          {!loadingEquipe && semanas.map((sem) => {
            const items = equipePorSemana.get(sem) ?? [];
            const open = openWeeks.has(sem);
            const canAdd = !!admin;
            return (
              <SemanaSection
                key={sem} semana={sem} semanaAtual={semanaAtual}
                open={open} onToggle={() => toggleWeek(sem)}
                onAdd={() => openModalAdd(sem, true)} canAdd={canAdd}
              >
                {items.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <BookOpen size={18} className="text-slate-300" />
                    <p className="text-xs text-slate-400">Nenhum compromisso nessa semana.</p>
                    {canAdd && (
                      <button onClick={() => openModalAdd(sem, true)} className="text-xs text-primary-600 hover:underline">
                        + Adicionar
                      </button>
                    )}
                  </div>
                )}
                {items.map((c) => (
                  <EventoCard
                    key={c.id}
                    titulo={c.titulo}
                    descricao={c.conteudo}
                    dataHora={c.dataHora}
                    diaInteiro={c.diaInteiro}
                    passado={isEventoPast(c.dataHora, c.diaInteiro)}
                    showActions={!!admin}
                    onEdit={admin ? () => openModalEdit(c, true) : undefined}
                    onDelete={admin ? () => handleDeletarEquipe(c.id) : undefined}
                  />
                ))}
              </SemanaSection>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ModalEvento
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEquipe(null); }}
        title={
          isEquipeModal
            ? (editingEquipe?.id !== -1 ? 'Editar compromisso' : 'Publicar compromisso')
            : (editingMeus ? 'Editar compromisso' : 'Novo compromisso')
        }
        form={form}
        setForm={setForm}
        onSalvar={handleSalvar}
        loading={loading}
        showSemana={editingEquipe?.id === -1}
        showDateTime={isEquipeModal}
      />
    </div>
  );
}
