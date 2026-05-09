import { useNavigate } from 'react-router-dom';
import { ChevronRight, Megaphone, Calendar, BookOpen, CalendarDays, Vote, MessageCircle, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEncontroAtivo } from '../hooks/useEncontro';
import { useAvisos } from '../hooks/useAvisos';
import { useMinhasEscalas } from '../hooks/useEscalas';
import { useCompromissosEquipe } from '../hooks/useCompromissos';
import { useAgendaAtual } from '../hooks/useAgenda';
import { useVotacoes } from '../hooks/useVotacoes';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { displayName, formatDateTime, formatDateRange, formatRelativeDate } from '../lib/utils';
import { buildImageUrl } from '../lib/api';
import { usePerfil } from '../hooks/useUsuarios';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: encontro, isLoading: loadingEncontro } = useEncontroAtivo();
  const { data: perfil } = usePerfil();
  const { data: avisos } = useAvisos(encontro?.id);
  const { data: minhasEscalas } = useMinhasEscalas(encontro?.id);
  const { data: compromissosEquipe } = useCompromissosEquipe(encontro?.id);
  const { data: agenda } = useAgendaAtual(encontro?.id);
  const { data: votacoes } = useVotacoes(encontro?.id);

  if (loadingEncontro) return <PageSpinner />;

  const semanaAtual = compromissosEquipe?.find((c) => c.semanaAtual);
  const proximaEscala = minhasEscalas?.[0];
  const avisosAtivos = avisos?.filter((a) => a.ativo) ?? [];
  const votacoesAtivas = votacoes?.filter((v) => v.ativa) ?? [];
  const nome = displayName(perfil?.nome ?? user?.nome ?? '', perfil?.apelido ?? null);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-sky-400 px-5 md:px-8 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <Avatar nome={user?.nome ?? ''} fotoUrl={perfil?.fotoUrl} size="lg" className="border-2 border-white/40 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-sm">{saudacao},</p>
            <p className="text-white font-bold text-xl leading-tight">{nome}</p>
            {user && <p className="text-white/70 text-xs mt-0.5">{user.email}</p>}
          </div>
          {encontro && (
            <div className="hidden md:block text-right shrink-0 bg-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
              <p className="text-white font-semibold text-sm">{encontro.nome}</p>
              {encontro.dataInicio && (
                <p className="text-white/70 text-xs">{formatDateRange(encontro.dataInicio, encontro.dataFim)}</p>
              )}
              <Badge label={encontro.statusDescricao} variant="blue" />
            </div>
          )}
        </div>
        {/* Mobile: encontro tag */}
        {encontro && (
          <div className="md:hidden mt-4 bg-white/15 rounded-xl px-3 py-2 backdrop-blur-sm">
            <p className="text-white font-semibold text-sm">{encontro.nome}</p>
            {encontro.dataInicio && (
              <p className="text-white/60 text-xs">{formatDateRange(encontro.dataInicio, encontro.dataFim)}</p>
            )}
          </div>
        )}
      </div>

      {/* Content — 2 columns on desktop */}
      <div className="flex flex-col md:flex-row gap-0 md:gap-6 px-4 md:px-8 py-5 md:py-6 md:items-start">

        {/* LEFT — Avisos feed */}
        <div className="flex-1 min-w-0 order-2 md:order-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone size={18} className="text-primary-500" />
              <h2 className="text-base font-semibold text-slate-800">Avisos</h2>
            </div>
            {avisosAtivos.length > 0 && (
              <button onClick={() => navigate('/avisos')} className="text-sm text-primary-500 font-medium hover:text-primary-700">
                Ver todos
              </button>
            )}
          </div>

          {avisosAtivos.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 px-6 py-10 text-center">
              <p className="text-slate-400 text-sm">Nenhum aviso por enquanto.</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {avisosAtivos.map((aviso) => {
              const midiaUrl = buildImageUrl(aviso.urlMidia);
              return (
                <button
                  key={aviso.id}
                  onClick={() => navigate(`/avisos/${aviso.id}`)}
                  className="bg-white rounded-2xl border border-slate-100 shadow-card text-left active:scale-[0.99] transition-all hover:shadow-md overflow-hidden w-full"
                >
                  {midiaUrl && aviso.tipoMidia !== 0 && (
                    <img src={midiaUrl} alt="" className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4 md:p-5">
                    <p className="font-semibold text-slate-800 text-base leading-snug mb-2">
                      {aviso.titulo}
                    </p>
                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                      {aviso.conteudo}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-400">{aviso.nomeCriador}</p>
                        <span className="text-slate-200">·</span>
                        <p className="text-xs text-slate-400">{formatRelativeDate(aviso.criadoEm)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {aviso.permiteComentarios && aviso.totalComentarios > 0 && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <MessageCircle size={13} />
                            {aviso.totalComentarios}
                          </span>
                        )}
                        <ChevronRight size={15} className="text-slate-300" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Widgets */}
        <div className="w-full md:w-72 xl:w-80 shrink-0 order-1 md:order-2 flex flex-col gap-3 mb-4 md:mb-0">

          {/* Intercessão da semana */}
          {semanaAtual && (
            <button
              onClick={() => navigate('/oracao')}
              className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 text-left hover:shadow-md transition-all w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">Intercessão — Semana {semanaAtual.numeroSemana}</p>
                  <p className="text-xs text-slate-400 truncate">{semanaAtual.titulo}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </div>
              {semanaAtual.conteudo && (
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-3 pt-3 border-t border-slate-50">
                  {semanaAtual.conteudo}
                </p>
              )}
            </button>
          )}

          {/* Agenda da semana */}
          {agenda && (
            <button
              onClick={() => navigate('/agenda')}
              className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 text-left hover:shadow-md transition-all w-full"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                  <CalendarDays size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{agenda.titulo}</p>
                  <p className="text-xs text-slate-400">Agenda da semana</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </div>
              {agenda.conteudo && (
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{agenda.conteudo}</p>
              )}
            </button>
          )}

          {/* Próxima escala */}
          {proximaEscala && (
            <button
              onClick={() => navigate(`/escalas/${proximaEscala.id}`)}
              className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 text-left hover:shadow-md transition-all w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm line-clamp-1">{proximaEscala.titulo}</p>
                  {proximaEscala.dataHora && (
                    <span className="flex items-center gap-1 text-xs text-primary-600 font-medium mt-0.5">
                      <Clock size={11} /> {formatDateTime(proximaEscala.dataHora)}
                    </span>
                  )}
                  {proximaEscala.local && (
                    <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <MapPin size={11} /> {proximaEscala.local}
                    </span>
                  )}
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </div>
            </button>
          )}

          {/* Votações ativas */}
          {votacoesAtivas.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <Vote size={16} className="text-purple-500" />
                  <p className="text-sm font-semibold text-slate-800">Votações abertas</p>
                </div>
                <button onClick={() => navigate('/votacoes')} className="text-xs text-primary-500 font-medium">Ver todas</button>
              </div>
              <div className="divide-y divide-slate-50">
                {votacoesAtivas.slice(0, 2).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => navigate(`/votacoes/${v.id}`)}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 font-medium line-clamp-1">{v.pergunta}</p>
                      <p className="text-xs text-slate-400">{v.totalVotos} votos</p>
                    </div>
                    {v.jaVotei
                      ? <Badge label="Votado" variant="green" />
                      : <Badge label="Votar" variant="purple" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
