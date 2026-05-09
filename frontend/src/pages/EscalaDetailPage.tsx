import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Clock, Edit2, Plus, Trash2, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEscala, useEditarEscala, useAdicionarParticipante, useRemoverParticipante } from '../hooks/useEscalas';
import { useEquipe } from '../hooks/useUsuarios';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { PageSpinner } from '../components/ui/Spinner';
import { displayName, formatDateTime, isAdmin } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import type { ParticipanteEscala } from '../types';

const statusConfig = {
  0: { label: 'Pendente', variant: 'yellow' as const },
  1: { label: 'Confirmada', variant: 'green' as const },
  2: { label: 'Cancelada', variant: 'red' as const },
};

function normFuncao(f: string | null): string {
  if (!f) return '';
  return f.startsWith('★ ') ? f.slice(2) : f;
}

function groupParticipantes(participantes: ParticipanteEscala[]) {
  const map = new Map<string, { responsavel: ParticipanteEscala | null; equipe: ParticipanteEscala[] }>();
  for (const p of participantes) {
    const key = normFuncao(p.funcao) || 'Sem função';
    if (!map.has(key)) map.set(key, { responsavel: null, equipe: [] });
    const g = map.get(key)!;
    if (p.funcao?.startsWith('★ ')) g.responsavel = p;
    else g.equipe.push(p);
  }
  return [...map.entries()];
}

export function EscalaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const escalaId = Number(id);
  const admin = user && isAdmin(user.role);

  const { data: escala, isLoading } = useEscala(escalaId);
  const { data: equipe } = useEquipe();
  const editarEscala = useEditarEscala();
  const adicionarParticipante = useAdicionarParticipante();
  const removerParticipante = useRemoverParticipante();

  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [funcaoInput, setFuncaoInput] = useState('');
  const [isResponsavel, setIsResponsavel] = useState(false);

  const { register, handleSubmit } = useForm({
    values: escala
      ? {
          titulo: escala.titulo,
          descricao: escala.descricao ?? '',
          dataHora: escala.dataHora?.slice(0, 16) ?? '',
          local: escala.local ?? '',
          status: escala.status,
          responsavelId: escala.responsavelId ?? '',
        }
      : undefined,
  });

  const onEditSubmit = async (values: any) => {
    setLoadingEdit(true);
    try {
      await editarEscala.mutateAsync({
        id: escalaId,
        ...values,
        responsavelId: values.responsavelId || null,
      });
      toast.success('Escala atualizada');
      setEditModal(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleAddParticipante = async () => {
    if (!selectedUserId) return;
    setLoadingAdd(true);
    try {
      const funcao = funcaoInput ? (isResponsavel ? `★ ${funcaoInput}` : funcaoInput) : undefined;
      await adicionarParticipante.mutateAsync({ escalaId, usuarioId: selectedUserId, funcao });
      toast.success('Participante adicionado');
      setSelectedUserId('');
      setFuncaoInput('');
      setIsResponsavel(false);
      setAddModal(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleRemoveParticipante = async (participanteId: number) => {
    try {
      await removerParticipante.mutateAsync({ escalaId, participanteId });
      toast.success('Participante removido');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (isLoading) return <PageSpinner />;
  if (!escala) return null;

  const st = statusConfig[escala.status];
  const participantesIds = escala.participantes.map((p) => p.usuarioId);
  const membrosDispo = equipe?.filter((m) => !participantesIds.includes(m.id)) ?? [];

  const grupos = groupParticipantes(escala.participantes);
  const hasResponsavel = escala.participantes.some((p) => p.funcao?.startsWith('★ '));
  const isTableLayout = grupos.length >= 3;

  return (
    <div className="flex flex-col">
      <TopBar
        title={escala.titulo}
        back
        right={
          admin ? (
            <button
              onClick={() => setEditModal(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
            >
              <Edit2 size={18} />
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-4 px-4 py-4 md:px-6 md:py-5 max-w-4xl w-full">
        {/* Info card */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Badge label={st.label} variant={st.variant} size="md" />
          </div>
          {escala.dataHora && (
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-primary-500 shrink-0" />
              <p className="text-sm text-slate-700">{formatDateTime(escala.dataHora)}</p>
            </div>
          )}
          {escala.local && (
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-slate-400 shrink-0" />
              <p className="text-sm text-slate-600">{escala.local}</p>
            </div>
          )}
          {escala.nomeResponsavel && (
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-slate-400 shrink-0" />
              <p className="text-sm text-slate-600">
                {displayName(escala.nomeResponsavel, escala.apelidoResponsavel)}
              </p>
            </div>
          )}
          {escala.descricao && (
            <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{escala.descricao}</p>
          )}
        </Card>

        {/* Participants */}
        <div>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">
                Participantes ({escala.participantes.length})
              </p>
            </div>
            {admin && (
              <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => setAddModal(true)}>
                Adicionar
              </Button>
            )}
          </div>

          {escala.participantes.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum participante ainda.</p>
          )}

          {isTableLayout ? (
            <div className="rounded-2xl border border-slate-200 shadow-card overflow-hidden">
              {/* Header */}
              <div
                className={`grid px-4 py-3 bg-primary-800 gap-x-3 ${
                  hasResponsavel ? 'grid-cols-[1fr_2fr_1fr]' : 'grid-cols-[1fr_2fr]'
                }`}
              >
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {hasResponsavel ? 'Pregação' : 'Momento'}
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {hasResponsavel ? 'Quem vai acompanhar?' : 'Equipe'}
                </span>
                {hasResponsavel && (
                  <span className="text-xs font-bold text-white uppercase tracking-wider text-right">
                    Responsável
                  </span>
                )}
              </div>

              {/* Data rows */}
              {grupos.map(([funcaoKey, { responsavel, equipe: equipeGrupo }], i) => {
                const total = equipeGrupo.length + (responsavel ? 1 : 0);
                return (
                  <div
                    key={funcaoKey}
                    className={`grid px-4 py-3 border-b border-slate-100 last:border-0 items-center gap-x-3 ${
                      hasResponsavel ? 'grid-cols-[1fr_2fr_1fr]' : 'grid-cols-[1fr_2fr]'
                    } ${i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
                  >
                    {/* Pregação + count */}
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {funcaoKey}
                      {total > 0 && (
                        <span className="ml-1 text-xs font-normal text-slate-400">({total})</span>
                      )}
                    </p>

                    {/* Equipe — pipe-separated, with remove buttons for admin */}
                    <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                      {equipeGrupo.map((m, idx) => (
                        <span key={m.id} className="flex items-center gap-0.5">
                          {idx > 0 && <span className="text-slate-300 select-none">|</span>}
                          <span className="text-sm text-slate-600">
                            {displayName(m.nomeUsuario, m.apelido)}
                          </span>
                          {admin && (
                            <button
                              onClick={() => handleRemoveParticipante(m.id)}
                              className="text-slate-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </span>
                      ))}
                      {equipeGrupo.length === 0 && (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </div>

                    {/* Responsável */}
                    {hasResponsavel && (
                      <div className="flex items-center justify-end gap-1 min-w-0">
                        <p className="text-sm font-semibold text-primary-700 truncate text-right">
                          {responsavel ? displayName(responsavel.nomeUsuario, responsavel.apelido) : '—'}
                        </p>
                        {admin && responsavel && (
                          <button
                            onClick={() => handleRemoveParticipante(responsavel.id)}
                            className="shrink-0 text-slate-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Footer — descrição da escala */}
              {escala.descricao && (
                <div className="px-4 py-2.5 bg-primary-50 border-t border-primary-100">
                  <p className="text-xs text-primary-700 font-medium text-center">{escala.descricao}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {escala.participantes.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-center gap-3">
                    <Avatar nome={p.nomeUsuario} fotoUrl={p.fotoUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {displayName(p.nomeUsuario, p.apelido)}
                      </p>
                      {p.funcao && (
                        <p className="text-xs text-primary-600">{p.funcao}</p>
                      )}
                    </div>
                    {admin && (
                      <button
                        onClick={() => handleRemoveParticipante(p.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {admin && (
        <>
          <Modal
            isOpen={editModal}
            onClose={() => setEditModal(false)}
            title="Editar Escala"
            footer={<Button fullWidth loading={loadingEdit} onClick={handleSubmit(onEditSubmit)}>Salvar</Button>}
          >
            <form className="flex flex-col gap-4">
              <Input label="Título" {...register('titulo')} />
              <Textarea label="Descrição" rows={3} {...register('descricao')} />
              <Input label="Data e hora" type="datetime-local" {...register('dataHora')} />
              <Input label="Local" {...register('local')} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Responsável (opcional)</label>
                <select
                  {...register('responsavelId')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400"
                >
                  <option value="">Nenhum</option>
                  {equipe?.map((m) => (
                    <option key={m.id} value={m.id}>{displayName(m.nome, m.apelido)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select
                  {...register('status', { valueAsNumber: true })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400"
                >
                  <option value={0}>Pendente</option>
                  <option value={1}>Confirmada</option>
                  <option value={2}>Cancelada</option>
                </select>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={addModal}
            onClose={() => { setAddModal(false); setIsResponsavel(false); setFuncaoInput(''); setSelectedUserId(''); }}
            title="Adicionar participante"
            footer={<Button fullWidth loading={loadingAdd} onClick={handleAddParticipante}>Adicionar</Button>}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Membro</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400"
                >
                  <option value="">Selecione um membro</option>
                  {membrosDispo.map((m) => (
                    <option key={m.id} value={m.id}>
                      {displayName(m.nome, m.apelido)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Função (opcional)</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400"
                    placeholder="Ex: Amor de Deus"
                    value={funcaoInput}
                    onChange={(e) => setFuncaoInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsResponsavel((v) => !v)}
                    title="Marcar como responsável"
                    className={`w-12 rounded-xl border text-lg transition-colors ${
                      isResponsavel
                        ? 'border-amber-400 bg-amber-50 text-amber-500'
                        : 'border-slate-200 bg-white text-slate-300 hover:text-amber-400'
                    }`}
                  >
                    ★
                  </button>
                </div>
                {isResponsavel && funcaoInput && (
                  <p className="text-xs text-amber-600">Será salvo como "★ {funcaoInput}"</p>
                )}
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
