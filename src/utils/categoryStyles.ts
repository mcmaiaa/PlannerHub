import { EventCategory } from '../types';

export interface CategoryVisualStyle {
  label: string;
  shortLabel: string;
  cardClass: string;       // bg + border-l-4 + border sutil
  badgeClass: string;      // badge de categoria/horário
  textClass: string;       // cor principal do texto/tag
  dotClass: string;        // bolinha indicadora
}

export const CATEGORY_STYLES: Record<EventCategory, CategoryVisualStyle> = {
  faculdade: {
    label: 'Faculdade / Prova / Trabalho',
    shortLabel: 'Faculdade',
    cardClass: 'border-l-4 border-l-purple-400 bg-purple-500/15 border border-purple-400/25',
    badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-400/30',
    textClass: 'text-purple-300',
    dotClass: 'bg-purple-400',
  },
  entrevista: {
    label: 'Área Profissional / Urgente',
    shortLabel: 'Profissional',
    cardClass: 'border-l-4 border-l-rose-400 bg-rose-500/20 border border-rose-400/30',
    badgeClass: 'bg-rose-500/25 text-rose-300 border border-rose-400/40',
    textClass: 'text-rose-300',
    dotClass: 'bg-rose-400',
  },
  concurso: {
    label: 'Concurso',
    shortLabel: 'Concurso',
    cardClass: 'border-l-4 border-l-emerald-400 bg-emerald-500/15 border border-emerald-400/25',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
    textClass: 'text-emerald-300',
    dotClass: 'bg-emerald-400',
  },
  rotina: {
    label: 'Rotina / Pessoal',
    shortLabel: 'Rotina',
    cardClass: 'border-l-4 border-l-pink-400 bg-pink-500/15 border border-pink-400/25',
    badgeClass: 'bg-pink-500/20 text-pink-300 border border-pink-400/30',
    textClass: 'text-pink-300',
    dotClass: 'bg-pink-400',
  },
  reuniao: {
    label: 'Reunião / Evento',
    shortLabel: 'Reunião',
    cardClass: 'border-l-4 border-l-pink-400 bg-pink-500/15 border border-pink-400/25',
    badgeClass: 'bg-pink-500/20 text-pink-300 border border-pink-400/30',
    textClass: 'text-pink-300',
    dotClass: 'bg-pink-400',
  },
  aniversario: {
    label: 'Aniversário',
    shortLabel: 'Aniversário',
    cardClass: 'border-l-4 border-l-amber-300 bg-amber-400/15 border border-amber-300/30',
    badgeClass: 'bg-amber-400/20 text-amber-200 border border-amber-300/35',
    textClass: 'text-amber-200',
    dotClass: 'bg-amber-300',
  },
};

export function getCategoryStyle(category?: string): CategoryVisualStyle {
  if (category && category in CATEGORY_STYLES) {
    return CATEGORY_STYLES[category as EventCategory];
  }
  return CATEGORY_STYLES.rotina;
}

export function getHighlightStyle(
  badgeType: 'entrevista' | 'prova' | 'trabalho' | 'aniversario' | 'concurso' | 'urgente'
): CategoryVisualStyle {
  if (badgeType === 'aniversario') return CATEGORY_STYLES.aniversario;
  if (badgeType === 'concurso') return CATEGORY_STYLES.concurso;
  if (badgeType === 'prova' || badgeType === 'trabalho') return CATEGORY_STYLES.faculdade;
  return CATEGORY_STYLES.entrevista;
}
