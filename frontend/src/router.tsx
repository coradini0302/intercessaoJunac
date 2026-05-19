import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { isAdmin } from './lib/utils';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/auth/LoginPage';
import { TrocarSenhaPage } from './pages/auth/TrocarSenhaPage';
import { DashboardPage } from './pages/DashboardPage';
import { AvisosPage } from './pages/AvisosPage';
import { AvisoDetailPage } from './pages/AvisoDetailPage';
import { EscalasBoardPage } from './pages/EscalasBoardPage';
import { OracaoPage } from './pages/OracaoPage';
import { AgendaPage } from './pages/AgendaPage';
import { VotacoesPage } from './pages/VotacoesPage';
import { VotacaoDetailPage } from './pages/VotacaoDetailPage';
import { AnotacoesPage } from './pages/AnotacoesPage';
import { AnotacaoDetailPage } from './pages/AnotacaoDetailPage';
import { EquipePage } from './pages/EquipePage';
import { PerfilPage } from './pages/PerfilPage';
import { UsuariosPage } from './pages/admin/UsuariosPage';
import { InfoRestritasPage } from './pages/admin/InfoRestritasPage';
import { ReuniaoResumosPage } from './pages/ReuniaoResumosPage';
import { DinamicasPage } from './pages/DinamicasPage';
import { AltoMarPage } from './pages/AltoMarPage';
import { FormacoesPage } from './pages/FormacoesPage';

function RequireAuth() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.trocaSenhaObrigatoria) return <Navigate to="/trocar-senha" replace />;
  return <Outlet />;
}

function RequireAdmin() {
  const { user } = useAuth();
  if (!user || !isAdmin(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/trocar-senha', element: <TrocarSenhaPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/avisos', element: <AvisosPage /> },
          { path: '/avisos/:id', element: <AvisoDetailPage /> },
          { path: '/escalas', element: <EscalasBoardPage /> },
          { path: '/oracao', element: <OracaoPage /> },
          { path: '/agenda', element: <AgendaPage /> },
          { path: '/votacoes', element: <VotacoesPage /> },
          { path: '/votacoes/:id', element: <VotacaoDetailPage /> },
          { path: '/anotacoes', element: <AnotacoesPage /> },
          { path: '/anotacoes/:id', element: <AnotacaoDetailPage /> },
          { path: '/equipe', element: <EquipePage /> },
          { path: '/reuniao-resumos', element: <ReuniaoResumosPage /> },
          { path: '/dinamicas', element: <DinamicasPage /> },
          { path: '/alto-mar', element: <AltoMarPage /> },
          { path: '/formacoes', element: <FormacoesPage /> },
          { path: '/perfil', element: <PerfilPage /> },
          {
            element: <RequireAdmin />,
            children: [
              { path: '/admin/usuarios', element: <UsuariosPage /> },
              { path: '/admin/info-restritas', element: <InfoRestritasPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
