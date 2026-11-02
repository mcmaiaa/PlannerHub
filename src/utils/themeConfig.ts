import { AppTheme } from '../types';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  shortName: string;
  swatchMain: string;
  swatchAccent: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'rose',
    name: 'Ameixa & Rosa Pastel',
    shortName: 'Rosa',
    swatchMain: '#211C2B',
    swatchAccent: '#F472B6',
    description: 'Tema original escuro acolhedor com tons de ameixa e rosa',
  },
  {
    id: 'emerald',
    name: 'Floresta & Verde Menta',
    shortName: 'Verde',
    swatchMain: '#13261E',
    swatchAccent: '#34D399',
    description: 'Tons de verde musgo profundo e menta refrescante',
  },
  {
    id: 'blue',
    name: 'Oceano & Azul Celeste',
    shortName: 'Azul',
    swatchMain: '#142236',
    swatchAccent: '#38BDF8',
    description: 'Azul marinho noturno com detalhes em azul celeste',
  },
  {
    id: 'amber',
    name: 'Cacau & Amarelo Baunilha',
    shortName: 'Amarelo',
    swatchMain: '#262016',
    swatchAccent: '#FBBF24',
    description: 'Fundo café/cacau quente com destaque amarelo dourado',
  },
  {
    id: 'lavender',
    name: 'Íris & Lavanda Noite',
    shortName: 'Lavanda',
    swatchMain: '#1B1830',
    swatchAccent: '#A78BFA',
    description: 'Tons de índigo noturno e lilás pastel suave',
  },
  {
    id: 'coral',
    name: 'Terracota & Pêssego',
    shortName: 'Pêssego',
    swatchMain: '#2A191E',
    swatchAccent: '#FB7185',
    description: 'Vinho suave com toques de pêssego e coral',
  },
];

export function applyThemeToDOM(theme: AppTheme = 'rose') {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
