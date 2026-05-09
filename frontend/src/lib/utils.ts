import { format, formatRelative, parseISO, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Role } from '../types';

export function displayName(nome: string, apelido: string | null): string {
  return apelido || nome;
}

export function formatDate(dateStr: string | null, fmt = 'dd/MM/yyyy'): string {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), fmt, { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Hoje às ${format(date, 'HH:mm')}`;
    if (isTomorrow(date)) return `Amanhã às ${format(date, 'HH:mm')}`;
    return format(date, "dd/MM 'às' HH:mm", { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatRelativeDate(dateStr: string): string {
  try {
    return formatRelative(parseISO(dateStr), new Date(), { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start || !end) return '—';
  try {
    return `${format(parseISO(start), 'dd/MM')} – ${format(parseISO(end), 'dd/MM/yyyy')}`;
  } catch {
    return '—';
  }
}

export function isAdmin(role: Role): boolean {
  return role === 'Admin' || role === 'DevAdmin';
}

export function isDevAdmin(role: Role): boolean {
  return role === 'DevAdmin';
}

export function roleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    DevAdmin: 'Dev Admin',
    Admin: 'Admin',
    Intercessor: 'Intercessor(a)',
  };
  return labels[role];
}
