import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Megaphone, Calendar, BookOpen, CalendarDays,
  Vote, FileText, Users, Lock, Settings, LogOut, ClipboardList, Flame, Lightbulb,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePerfil } from '../../hooks/useUsuarios';
import { Avatar } from '../ui/Avatar';
import { displayName, isAdmin, roleLabel } from '../../lib/utils';

const navLinks = [
  { to: '/dashboard', icon: Home, label: 'Início' },
  { to: '/avisos', icon: Megaphone, label: 'Avisos' },
  { to: '/escalas', icon: Calendar, label: 'Responsáveis' },
  { to: '/oracao', icon: BookOpen, label: 'Compromissos' },
  { to: '/agenda', icon: CalendarDays, label: 'Agenda' },
  { to: '/votacoes', icon: Vote, label: 'Votações' },
  { to: '/anotacoes', icon: FileText, label: 'Anotações' },
  { to: '/equipe', icon: Users, label: 'Equipe' },
  { to: '/reuniao-resumos', icon: ClipboardList, label: 'Resumo - Reuniões' },
  { to: '/dinamicas', icon: Flame, label: 'Dinâmicas' },
  { to: '/alto-mar', icon: Lightbulb, label: 'Alto Mar' },
];

const adminLinks = [
  { to: '/admin/usuarios', icon: Settings, label: 'Usuários' },
  { to: '/admin/info-restritas', icon: Lock, label: 'Info Restritas' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { data: perfil } = usePerfil();
  const navigate = useNavigate();
  const effectiveRole = perfil?.role || user?.role;
  const admin = !!effectiveRole && isAdmin(effectiveRole);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="hidden md:flex flex-col w-60 xl:w-64 shrink-0 bg-white border-r border-slate-100 h-dvh sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-sky-400 flex items-center justify-center text-lg shrink-0">
          🕊️
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm leading-tight">InterceJUNAC</p>
          <p className="text-primary-500 text-xs font-medium">XXIX Encontro</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <div className="flex flex-col gap-0.5">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {admin && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-1">
              Administração
            </p>
            <div className="flex flex-col gap-0.5">
              {adminLinks.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <NavLink to="/perfil" className="flex items-center gap-2.5 flex-1 min-w-0 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
            <Avatar nome={user?.nome ?? ''} fotoUrl={perfil?.fotoUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
                {displayName(perfil?.nome || user?.nome || '', perfil?.apelido ?? null)}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {effectiveRole ? roleLabel(effectiveRole) : ''}
              </p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-400 transition-colors shrink-0"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
