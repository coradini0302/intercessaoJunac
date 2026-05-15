import { useParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import { MessageCircle, Send, Trash2, Edit2, Image, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePerfil, useEquipe } from '../hooks/useUsuarios';
import { useAviso, useComentarAviso, useDeletarComentario, useEditarAviso, useUploadMidiaAviso, useUploadComentarioMidia } from '../hooks/useAvisos';
import { MentionInput, renderMentions } from '../components/ui/MentionInput';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { PageSpinner } from '../components/ui/Spinner';
import { buildImageUrl, extractErrorMessage } from '../lib/api';
import { displayName, formatRelativeDate, isAdmin } from '../lib/utils';
import { toast } from 'sonner';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { useForm } from 'react-hook-form';

export function AvisoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: perfil } = usePerfil();
  const { data: membros = [] } = useEquipe();
  const avisoId = Number(id);
  const admin = user && isAdmin(user.role);

  const { data: aviso, isLoading } = useAviso(avisoId);
  const comentar = useComentarAviso();
  const deletarComentario = useDeletarComentario();
  const editarAviso = useEditarAviso();
  const uploadMidia = useUploadMidiaAviso();
  const uploadComentarioMidia = useUploadComentarioMidia();

  const [texto, setTexto] = useState('');
  const [sending, setSending] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [imagemPendente, setImagemPendente] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit } = useForm({
    values: aviso ? { titulo: aviso.titulo, conteudo: aviso.conteudo, permiteComentarios: aviso.permiteComentarios, ativo: aviso.ativo } : undefined,
  });

  const setImagem = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImagemPendente(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const imageItem = Array.from(e.clipboardData.items).find(item => item.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (file) setImagem(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagem(file);
    e.target.value = '';
  };

  const handleComment = async () => {
    if ((!texto.trim() && !imagemPendente) || !aviso) return;
    setSending(true);
    try {
      const textoEnvio = texto.trim() || '.';
      const res = await comentar.mutateAsync({ avisoId: aviso.id, texto: textoEnvio });
      if (imagemPendente && res?.id) {
        await uploadComentarioMidia.mutateAsync({ avisoId: aviso.id, comentarioId: res.id, file: imagemPendente });
      }
      setTexto('');
      setImagem(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (comentarioId: number) => {
    if (!aviso) return;
    try {
      await deletarComentario.mutateAsync({ avisoId: aviso.id, comentarioId });
      toast.success('Comentário removido');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const onEditSubmit = async (values: any) => {
    if (!aviso) return;
    setLoadingEdit(true);
    try {
      await editarAviso.mutateAsync({ id: aviso.id, ...values });
      toast.success('Aviso atualizado');
      setEditModal(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleMidiaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !aviso) return;
    try {
      await uploadMidia.mutateAsync({ id: aviso.id, file });
      toast.success('Mídia adicionada');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (isLoading) return <PageSpinner />;
  if (!aviso) return null;

  const midiaUrl = buildImageUrl(aviso.urlMidia);
  const podeSendar = texto.trim().length > 0 || !!imagemPendente;

  return (
    <div className="flex flex-col">
      <TopBar title="Aviso" back right={
        admin ? (
          <div className="flex gap-1">
            <label className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer">
              <Image size={18} />
              <input type="file" accept="image/*,.gif" className="hidden" onChange={handleMidiaUpload} />
            </label>
            <button
              onClick={() => setEditModal(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
            >
              <Edit2 size={18} />
            </button>
          </div>
        ) : undefined
      } />

      <div className="flex flex-col gap-4 px-4 py-4">
        <Card>
          <h1 className="text-lg font-bold text-slate-800 leading-snug mb-2">{aviso.titulo}</h1>
          <p className="text-xs text-slate-400 mb-3">
            Por {aviso.nomeCriador} · {formatRelativeDate(aviso.criadoEm)}
          </p>
          {midiaUrl && (
            <img
              src={midiaUrl}
              alt="Mídia do aviso"
              className="w-full rounded-xl mb-3 object-cover max-h-72"
            />
          )}
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {aviso.conteudo}
          </p>
        </Card>

        {aviso.permiteComentarios && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-0.5">
              <MessageCircle size={16} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">
                {(aviso.comentarios?.length ?? 0) > 0
                  ? `${aviso.comentarios.length} comentário${aviso.comentarios.length !== 1 ? 's' : ''}`
                  : 'Comentários'}
              </p>
            </div>

            {aviso.comentarios?.map((c) => (
              <div key={c.id} className="flex items-start gap-2.5 mb-3">
                <Avatar nome={c.nomeUsuario} fotoUrl={c.fotoUrl} size="xs" />
                <div className="flex-1 bg-white rounded-2xl px-3 py-2.5 shadow-card border border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-700">
                      {displayName(c.nomeUsuario, c.apelidoUsuario)}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeDate(c.criadoEm)}
                      </span>
                      {(admin || c.usuarioId === user?.userId) && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  {c.texto !== '.' && (
                    <p className="text-sm text-slate-600 mt-0.5">{renderMentions(c.texto, membros)}</p>
                  )}
                  {c.urlMidia && (
                    <img
                      src={buildImageUrl(c.urlMidia)!}
                      alt="Imagem do comentário"
                      className="mt-2 rounded-xl object-cover w-48 h-auto"
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Input de comentário */}
            <div className="flex items-end gap-2 mt-2">
              <Avatar nome={user?.nome ?? ''} fotoUrl={perfil?.fotoUrl} size="xs" />
              <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-card border border-slate-100">
                {previewUrl && (
                  <div className="relative p-2 pb-0">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="rounded-xl object-cover w-48 h-auto"
                    />
                    <button
                      onClick={() => setImagem(null)}
                      className="absolute top-3 left-3 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-2">
                  <MentionInput
                    value={texto}
                    onChange={setTexto}
                    onEnter={handleComment}
                    onPaste={handlePaste}
                    membros={membros}
                    placeholder="Escreva um comentário..."
                    maxLength={500}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-slate-400 hover:text-primary-500 transition-colors"
                    title="Anexar imagem"
                  >
                    <Image size={17} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.gif"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!podeSendar || sending}
                    className="text-primary-500 disabled:opacity-30"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {admin && (
        <Modal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          title="Editar Aviso"
          footer={
            <Button fullWidth loading={loadingEdit} onClick={handleSubmit(onEditSubmit)}>
              Salvar alterações
            </Button>
          }
        >
          <form className="flex flex-col gap-4">
            <Input label="Título" {...register('titulo')} />
            <Textarea label="Conteúdo" rows={5} {...register('conteudo')} />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('permiteComentarios')} className="w-4 h-4 accent-primary-500" />
              <span className="text-sm text-slate-700">Permitir comentários</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('ativo')} className="w-4 h-4 accent-primary-500" />
              <span className="text-sm text-slate-700">Aviso ativo</span>
            </label>
          </form>
        </Modal>
      )}
    </div>
  );
}
