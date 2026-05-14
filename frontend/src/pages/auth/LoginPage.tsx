import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { api, extractErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { LoginResponse } from '../../types';
import { toast } from 'sonner';

const schema = z.object({
  login: z.string().min(1, 'Informe o login'),
  senha: z.string().min(1, 'Informe a senha'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      window.location.replace(user?.trocaSenhaObrigatoria ? '/trocar-senha' : '/dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormData) => {
    setLoginError(null);
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>('/api/auth/login', { login: values.login, senha: values.senha });
      login(data);
      window.location.replace(data.trocaSenhaObrigatoria ? '/trocar-senha' : '/dashboard');
    } catch (err) {
      const msg = extractErrorMessage(err);
      setLoginError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-primary-500 via-primary-400 to-sky-300">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
              <span className="text-4xl">🕊️</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">InterceJUNAC</h1>
            <p className="text-white/80 text-sm mt-1 font-medium">XXIX Encontro</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">Entrar na sua conta</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Login"
                type="text"
                placeholder="seu login"
                autoComplete="username"
                leftIcon={<User size={16} />}
                error={errors.login?.message}
                {...register('login')}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('senha')}
                    className={`
                      w-full rounded-xl border bg-white pl-10 pr-10 py-3 text-sm text-slate-800
                      placeholder:text-slate-400 border-slate-200
                      focus:border-primary-400 focus:ring-2 focus:ring-primary-100
                      outline-none transition-all
                      ${errors.senha ? 'border-red-300' : ''}
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.senha && <p className="text-xs text-red-500">{errors.senha.message}</p>}
              </div>

              <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
                Entrar
              </Button>
              {loginError && (
                <p className="text-sm text-red-600 text-center mt-2">{loginError}</p>
              )}
            </form>

            <p className="text-center text-xs text-slate-400 mt-4">
              Acesso restrito à equipe de intercessão
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pb-8">
        <p className="text-white/50 text-xs">InterceJUNAC XXIX · 2026</p>
      </div>
    </div>
  );
}
