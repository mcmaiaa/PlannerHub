import { CalendarEvent, DayOfWeek } from '../types';

export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

export function addDays(isoDate: string, days: number): string {
  const d = parseISODate(isoDate);
  d.setDate(d.getDate() + days);
  return toISODateString(d);
}

export function getDaysDifference(fromIsoDate: string, toIsoDate: string): number {
  const d1 = parseISODate(fromIsoDate);
  const d2 = parseISODate(toIsoDate);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatReadableDate(isoDate: string): string {
  const d = parseISODate(isoDate);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).replace('.', '');
}

export function formatFullDatePtBR(isoDate: string): string {
  const d = parseISODate(isoDate);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
};

export const DAY_OF_WEEK_SHORT: Record<DayOfWeek, string> = {
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
};

/**
 * Verifica se um evento (com regra de recorrência) ocorre na data alvo `targetIsoDate`.
 */
export function doesEventOccurOnDate(event: CalendarEvent, targetIsoDate: string): boolean {
  if (event.date === targetIsoDate) return true;

  const diffDays = getDaysDifference(event.date, targetIsoDate);

  // Eventos recorrentes se projetam apenas a partir da data inicial (exceto anual de aniversário)
  if (event.recurrence === 'unico') {
    return false;
  }

  if (event.recurrence === 'anual') {
    const start = parseISODate(event.date);
    const target = parseISODate(targetIsoDate);
    return (
      start.getMonth() === target.getMonth() &&
      start.getDate() === target.getDate() &&
      target.getFullYear() >= start.getFullYear()
    );
  }

  if (diffDays < 0) return false;

  if (event.recurrence === 'semanal') {
    return diffDays % 7 === 0;
  }

  if (event.recurrence === 'quinzenal') {
    return diffDays % 14 === 0;
  }

  if (event.recurrence === 'mensal') {
    const start = parseISODate(event.date);
    const target = parseISODate(targetIsoDate);
    return start.getDate() === target.getDate();
  }

  return false;
}

/**
 * Retorna a próxima ocorrência de um evento a partir de `fromIsoDate` (inclusive).
 */
export function getNextOccurrenceDate(event: CalendarEvent, fromIsoDate: string): string | null {
  if (event.recurrence === 'unico') {
    return getDaysDifference(fromIsoDate, event.date) >= 0 ? event.date : null;
  }

  // Busca nos próximos 366 dias a primeira ocorrência
  for (let i = 0; i <= 366; i++) {
    const candidate = addDays(fromIsoDate, i);
    if (doesEventOccurOnDate(event, candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Retorna os Eventos projetados para uma data específica, ordenados por horário.
 */
export function getEventsForDate(events: CalendarEvent[], targetIsoDate: string): CalendarEvent[] {
  return events
    .filter((ev) => doesEventOccurOnDate(ev, targetIsoDate))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/**
 * Retorna os 7 dias da semana (Segunda a Domingo) contendo a data informada.
 */
export function getWeekDaysAround(referenceDate: Date = new Date()): {
  isoDate: string;
  dayNameShort: string;
  dayNumber: string;
  isToday: boolean;
  jsDay: number;
}[] {
  const todayIso = toISODateString(new Date());
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0 (Dom) a 6 (Sab)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const shortNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return Array.from({ length: 7 }, (_, idx) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + idx);
    const iso = toISODateString(current);
    return {
      isoDate: iso,
      dayNameShort: shortNames[current.getDay()],
      dayNumber: String(current.getDate()).padStart(2, '0'),
      isToday: iso === todayIso,
      jsDay: current.getDay(),
    };
  });
}

export function formatCountdownBadge(days: number): string {
  if (days === 0) return 'É Hoje!';
  if (days === 1) return 'É Amanhã!';
  if (days < 0) return `Há ${Math.abs(days)}d`;
  return `Faltam ${days} dias`;
}
