import { format, formatRelative, parseISO, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Role } from '../types';

export function displayName(nome: string, apelido: string | null): string {
  return apelido || nome;
}

// SQLite/EF Core perde o DateTimeKind ao ler do banco, então ASP.NET serializa sem 'Z'.
// Forçamos UTC adicionando 'Z' quando não há indicador de fuso.
function parseUtc(dateStr: string): Date {
  const hasZone = dateStr.endsWith('Z') || dateStr.includes('+') || /\d{2}:\d{2}$/.test(dateStr.slice(-6));
  return parseISO(hasZone ? dateStr : dateStr + 'Z');
}

export function formatDate(dateStr: string | null, fmt = 'dd/MM/yyyy'): string {
  if (!dateStr) return '—';
  try {
    return format(parseUtc(dateStr), fmt, { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    const date = parseUtc(dateStr);
    if (isToday(date)) return `Hoje às ${format(date, 'HH:mm')}`;
    if (isTomorrow(date)) return `Amanhã às ${format(date, 'HH:mm')}`;
    return format(date, "dd/MM 'às' HH:mm", { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatRelativeDate(dateStr: string): string {
  try {
    return formatRelative(parseUtc(dateStr), new Date(), { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start || !end) return '—';
  try {
    return `${format(parseUtc(start), 'dd/MM')} – ${format(parseUtc(end), 'dd/MM/yyyy')}`;
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
