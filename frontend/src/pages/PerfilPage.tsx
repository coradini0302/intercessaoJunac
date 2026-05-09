import { useState, useRef } from 'react';
import { Camera, Edit2, LogOut, Check, X, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePerfil, useAtualizarPerfil, useUploadFoto, useRemoverFoto } from '../hooks/useUsuarios';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { displayName, formatDate, roleLabel } from '../lib/utils';
import { extractErrorMessage } from '../lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../types';

const roleVariant: Record<Role, 'blue' | 'purple' | 'gray'> = {
  DevAdmin: 'purple',
  Admin: 'blue',
  Intercessor: 'gray',
};

export function PerfilPage() {
  const { user, logout, updateToken } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: perfil, isLoading } = usePerfil();
  const atualizar = useAtualizarPerfil();
  const uploadFoto = useUploadFoto();
  const removerFoto = useRemoverFoto();

  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  const startEdit = () => {
    setNome(perfil?.nome ?? '');
    setApelido(perfil?.apelido ?? '');
    setEditing(true);
  };

  const handleSave = async () => {
    setLoadingSave(true);
    try {
      const res = await atualizar.mutateAsync({ nome, apelido: apelido || null });
      updateToken({ token: res.novoToken, userId: user!.userId, nome: res.perfil.nome, email: user!.email, role: user!.role, trocaSenhaObrigatoria: false, expiracao: res.expiracao });
      toast.success('Perfil atualizado!');
      setEditing(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoadingSave(false);
    }
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadFoto.mutateAsync(file);
      toast.success('Foto atualizada!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleRemoverFoto = async () => {
    try {
      await removerFoto.mutateAsync();
      toast.success('Foto removida');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (isLoading) return <PageSpinner />;
  if (!perfil) return null;

  return (
    <div className="flex flex-col">
      <TopBar title="Meu Perfil" back />

      <div className="flex flex-col gap-4 px-4 py-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <Avatar nome={perfil.nome} fotoUrl={perfil.fotoUrl} size="xl" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Camera size={16} className="text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
          </div>
          <p className="mt-3 font-bold text-slate-800 text-lg">
            {displayName(perfil.nome, perfil.apelido)}
          </p>
          <Badge label={roleLabel(perfil.role)} variant={roleVariant[perfil.role]} size="md" />
          {perfil.fotoUrl && (
            <button
              onClick={handleRemoverFoto}
              className="text-xs text-red-400 mt-2 hover:text-red-600"
            >
              Remover foto
            </button>
          )}
        </div>

        {/* Dados */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Informações</p>
            {!editing ? (
              <Button size="sm" variant="ghost" leftIcon={<Edit2 size={14} />} onClick={startEdit}>
                Editar
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  <X size={14} />
                </Button>
                <Button size="sm" loading={loadingSave} leftIcon={<Check size={14} />} onClick={handleSave}>
                  Salvar
                </Button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="flex flex-col gap-3">
              <Input
                label="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <Input
                label="Apelido / nome preferido"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                hint="Este nome será exibido para a equipe"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-xs text-slate-400">Nome</p>
                <p className="text-sm text-slate-800">{perfil.nome}</p>
              </div>
              {perfil.apelido && (
                <div>
                  <p className="text-xs text-slate-400">Apelido</p>
                  <p className="text-sm text-slate-800">{perfil.apelido}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400">E-mail</p>
                <p className="text-sm text-slate-800">{perfil.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Membro desde</p>
                <p className="text-sm text-slate-800">{formatDate(perfil.criadoEm)}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Trocar senha */}
        <Card onClick={() => navigate('/trocar-senha')}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <KeyRound size={18} className="text-primary-600" />
            </div>
            <p className="text-sm font-medium text-slate-800">Alterar senha</p>
          </div>
        </Card>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sair da conta</span>
        </button>
      </div>
    </div>
  );
}
