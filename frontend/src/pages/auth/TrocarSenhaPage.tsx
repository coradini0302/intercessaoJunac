import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api, extractErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import type { LoginResponse } from '../../types';
import { toast } from 'sonner';

const schema = z.object({
  senhaAtual: z.string().min(1, 'Informe a senha atual'),
  novaSenha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmarSenha: z.string().min(1, 'Confirme a nova senha'),
}).refine((d) => d.novaSenha === d.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type FormData = z.infer<typeof schema>;

function PasswordField({
  label, error, ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          {...props}
          className={`
            w-full rounded-xl border bg-white px-4 pr-10 py-3 text-sm text-slate-800
            placeholder:text-slate-400 border-slate-200
            focus:border-primary-400 focus:ring-2 focus:ring-primary-100
            outline-none transition-all
            ${error ? 'border-red-300' : ''}
          `}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function TrocarSenhaPage() {
  const { updateToken, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.trocaSenhaObrigatoria === false) {
      navigate('/dashboard', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>('/api/auth/trocar-senha', values);
      updateToken(data);
      toast.success('Senha alterada com sucesso!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-primary-500 to-sky-300">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-3">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Criar nova senha</h1>
            <p className="text-white/80 text-sm mt-1">
              Olá, {user?.nome?.split(' ')[0]}! Por segurança, defina sua senha pessoal.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <PasswordField
                label="Senha temporária"
                placeholder="••••••••"
                error={errors.senhaAtual?.message}
                {...register('senhaAtual')}
              />
              <PasswordField
                label="Nova senha"
                placeholder="Mín. 6 caracteres"
                error={errors.novaSenha?.message}
                {...register('novaSenha')}
              />
              <PasswordField
                label="Confirmar nova senha"
                placeholder="Repita a nova senha"
                error={errors.confirmarSenha?.message}
                {...register('confirmarSenha')}
              />
              <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
                Salvar senha
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
