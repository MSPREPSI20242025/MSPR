// Configuration i18n pour le support multilingue
export const locales = ['fr', 'de', 'it', 'en'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'fr';

// Configuration des langues
export const languages = {
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    code: 'fr'
  },
  de: {
    name: 'Deutsch',
    flag: '🇩🇪', 
    code: 'de'
  },
  it: {
    name: 'Italiano',
    flag: '🇮🇹',
    code: 'it'
  },
  en: {
    name: 'English',
    flag: '🇺🇸',
    code: 'en'
  }
} as const;

// Détection automatique de la langue basée sur le cluster
export const getClusterDefaultLocale = (clusterName: string): Locale => {
  switch (clusterName) {
    case 'switzerland':
      return 'fr'; // Français par défaut pour la Suisse
    case 'france':
      return 'fr';
    default:
      return 'fr';
  }
};

// Vérification si une locale est supportée
export const isValidLocale = (locale: string): locale is Locale => {
  return locales.includes(locale as Locale);
};