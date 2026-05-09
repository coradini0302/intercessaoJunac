import { useState } from 'react';
import { Power, PowerOff, KeyRound, Edit2, UserPlus } from 'lucide-react';
import {
  useUsuariosAdmin, useCriarUsuario, useEditarUsuario,
  useAtivarUsuario, useDesativarUsuario, useResetarSenha
} from '../../hooks/useUsuarios';
import { TopBar } from '../../components/layout/TopBar';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { PageSpinner } from '../../components/ui/Spinner';
import { displayName, roleLabel } from '../../lib/utils';
import { extractErrorMessage } from '../../lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import type { Role, UsuarioAdmin } from '../../types';

interface UserForm {
  nome: string;
  apelido: string;
  login: string;
  email: string;
  role: Role;
}

export function UsuariosPage() {
  const { data: usuarios, isLoading } = useUsuariosAdmin();
  const criar = useCriarUsuario();
  const editar = useEditarUsuario();
  const ativar = useAtivarUsuario();
  const desativar = useDesativarUsuario();
  const resetarSenha = useResetarSenha();

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UsuarioAdmin | null>(null);
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>({
    defaultValues: { role: 'Intercessor' },
  });

  const onCreateSubmit = async (values: UserForm) => {
    setLoading(true);
    try {
      const res = await criar.mutateAsync({
        nome: values.nome,
        apelido: values.apelido || null,
        login: values.login,
        email: values.email,
        role: values.role,
      });
      setTempPassword(res.senhaTemporaria);
      reset();
      setShowCreate(false);
      toast.success('Usuário criado!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onEditSubmit = async (values: UserForm) => {
    if (!editUser) return;
    setLoading(true);
    try {
      await editar.mutateAsync({ id: editUser.id, nome: values.nome, apelido: values.apelido || null, role: values.role });
      toast.success('Usuário atualizado!');
      setEditUser(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtivo = async (u: UsuarioAdmin) => {
    try {
      if (u.ativo) {
        await desativar.mutateAsync(u.id);
        toast.success('Usuário desativado');
      } else {
        await ativar.mutateAsync(u.id);
        toast.success('Usuário ativado');
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleResetSenha = async (u: UsuarioAdmin) => {
    if (!confirm(`Resetar a senha de ${u.nome}?`)) return;
    try {
      const res = await resetarSenha.mutateAsync(u.id);
      setTempPassword(res.senhaTemporaria);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const openEdit = (u: UsuarioAdmin) => {
    reset({ nome: u.nome, apelido: u.apelido ?? '', email: u.email, role: u.role });
    setEditUser(u);
  };

  return (
    <div className="flex flex-col">
      <TopBar
        title="Gestão de Usuários"
        back
        right={
          <Button size="sm" leftIcon={<UserPlus size={16} />} onClick={() => setShowCreate(true)}>
            Novo
          </Button>
        }
      />

      <div className="flex flex-col gap-3 px-4 py-4">
        {isLoading && <PageSpinner />}

        {usuarios?.map((u) => (
          <Card key={u.id}>
            <div className="flex items-center gap-3">
              <Avatar nome={u.nome} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-800">{displayName(u.nome, u.apelido)}</p>
                  {!u.ativo && <Badge label="Inativo" variant="red" />}
                  {!u.trocouSenha && <Badge label="Senha temp." variant="yellow" />}
                </div>
                <p className="text-xs text-slate-400">@{u.login} · {u.email}</p>
                <p className="text-xs text-primary-600">{roleLabel(u.role)}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => openEdit(u)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-50 text-primary-500"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleResetSenha(u)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-50 text-amber-500"
                  title="Resetar senha"
                >
                  <KeyRound size={15} />
                </button>
                <button
                  onClick={() => handleToggleAtivo(u)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${u.ativo ? 'hover:bg-red-50 text-red-400' : 'hover:bg-emerald-50 text-emerald-500'}`}
                >
                  {u.ativo ? <PowerOff size={15} /> : <Power size={15} />}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Novo Usuário"
        footer={<Button fullWidth loading={loading} onClick={handleSubmit(onCreateSubmit)}>Criar usuário</Button>}
      >
        <form className="flex flex-col gap-4">
          <Input label="Nome *" placeholder="Nome completo" error={errors.nome?.message} {...register('nome', { required: 'Obrigatório' })} />
          <Input label="Apelido" placeholder="Nome preferido (opcional)" {...register('apelido')} />
          <Input label="Login *" placeholder="login de acesso" error={errors.login?.message} {...register('login', { required: 'Obrigatório' })} />
          <Input label="E-mail *" type="email" placeholder="email@exemplo.com" error={errors.email?.message} {...register('email', { required: 'Obrigatório' })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Perfil</label>
            <select {...register('role')} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400">
              <option value="Intercessor">Intercessor</option>
              <option value="Admin">Admin (Coordenadora)</option>
              <option value="DevAdmin">Dev Admin</option>
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Editar Usuário"
        footer={<Button fullWidth loading={loading} onClick={handleSubmit(onEditSubmit)}>Salvar</Button>}
      >
        <form className="flex flex-col gap-4">
          <Input label="Nome" {...register('nome')} />
          <Input label="Apelido" {...register('apelido')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Perfil</label>
            <select {...register('role')} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400">
              <option value="Intercessor">Intercessor</option>
              <option value="Admin">Admin (Coordenadora)</option>
              <option value="DevAdmin">Dev Admin</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Senha temporária */}
      <Modal
        isOpen={!!tempPassword}
        onClose={() => setTempPassword(null)}
        title="Senha temporária gerada"
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-sm text-slate-600 text-center">
            Compartilhe esta senha com o usuário. Ele precisará trocá-la no primeiro acesso.
          </p>
          <div className="bg-primary-50 border border-primary-200 rounded-2xl px-6 py-4 w-full text-center">
            <p className="text-2xl font-bold text-primary-700 tracking-widest font-mono">
              {tempPassword}
            </p>
          </div>
          <Button fullWidth variant="secondary" onClick={() => {
            navigator.clipboard.writeText(tempPassword ?? '');
            toast.success('Copiado!');
          }}>
            Copiar senha
          </Button>
        </div>
      </Modal>
    </div>
  );
}
