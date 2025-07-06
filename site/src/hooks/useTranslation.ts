import { useContext, createContext, useCallback } from 'react';
import type { Locale } from '@/lib/i18n';
import { getTranslations, getNestedTranslation } from '@/lib/translations';

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

export const TranslationContext = createContext<TranslationContextType | null>(null);

export function useTranslation() {
  const context = useContext(TranslationContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  
  return context;
}

// Hook pour créer les fonctions de traduction
export function createTranslationHook(locale: Locale) {
  const translations = getTranslations(locale);
  
  const t = useCallback((key: string, fallback?: string) => {
    return getNestedTranslation(translations, key, fallback || key);
  }, [translations]);
  
  return { t, locale };
}