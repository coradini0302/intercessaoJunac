import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Megaphone, Calendar, BookOpen, MoreHorizontal,
  CalendarDays, Vote, FileText, Users, User, Lock, Settings, ClipboardList
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isAdmin } from '../../lib/utils';
import { usePerfil } from '../../hooks/useUsuarios';

const allMainLinks = [
  { to: '/dashboard', icon: Home, label: 'Início', adminOnly: false },
  { to: '/avisos', icon: Megaphone, label: 'Avisos', adminOnly: true },
  { to: '/escalas', icon: Calendar, label: 'Pregações', adminOnly: false },
  { to: '/oracao', icon: BookOpen, label: 'Oração', adminOnly: false },
];

export function BottomNav() {
  const { user } = useAuth();
  const { data: perfil } = usePerfil();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  const effectiveRole = perfil?.role || user?.role;
  const admin = !!effectiveRole && isAdmin(effectiveRole);

  const moreLinks = [
    { to: '/agenda', icon: CalendarDays, label: 'Agenda' },
    { to: '/votacoes', icon: Vote, label: 'Votações' },
    { to: '/anotacoes', icon: FileText, label: 'Anotações' },
    { to: '/equipe', icon: Users, label: 'Equipe' },
    { to: '/reuniao-resumos', icon: ClipboardList, label: 'Resumos' },
    { to: '/perfil', icon: User, label: 'Meu Perfil' },
    ...(admin ? [
      { to: '/admin/usuarios', icon: Settings, label: 'Usuários' },
      { to: '/admin/info-restritas', icon: Lock, label: 'Info Restritas' },
    ] : []),
  ];

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
      )}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-100 safe-bottom">
        <div className="flex items-center justify-around px-1">
          {allMainLinks.filter(l => !l.adminOnly || admin).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 px-3 flex-1 transition-colors ${
                  isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="relative flex-1" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`flex flex-col items-center gap-0.5 py-2.5 px-3 w-full transition-colors ${
                moreOpen ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <MoreHorizontal size={22} />
              <span className="text-[10px] font-medium">Mais</span>
            </button>

            {moreOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                {moreLinks.map(({ to, icon: Icon, label }) => (
                  <button
                    key={to}
                    onClick={() => { navigate(to); setMoreOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                  >
                    <Icon size={18} className="text-primary-500" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
