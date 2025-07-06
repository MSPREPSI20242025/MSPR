'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { defaultLocale, isValidLocale, getClusterDefaultLocale } from '@/lib/i18n';
import { getTranslations, getNestedTranslation } from '@/lib/translations';

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

interface TranslationProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function TranslationProvider({ children, initialLocale }: TranslationProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);

  useEffect(() => {
    // Déterminer la langue par ordre de priorité :
    // 1. Langue stockée dans localStorage
    // 2. Langue basée sur le cluster (env)
    // 3. Langue du navigateur
    // 4. Langue par défaut

    const storedLocale = localStorage.getItem('preferred-locale');
    const clusterName = process.env.NEXT_PUBLIC_CLUSTER_NAME || 'us';
    const browserLang = navigator.language.split('-')[0];
    
    let selectedLocale: Locale = defaultLocale;

    if (storedLocale && isValidLocale(storedLocale)) {
      selectedLocale = storedLocale;
    } else if (clusterName === 'switzerland') {
      // Pour la Suisse, utiliser la détection automatique mais privilégier les langues locales
      if (isValidLocale(browserLang) && ['fr', 'de', 'it'].includes(browserLang)) {
        selectedLocale = browserLang as Locale;
      } else {
        selectedLocale = 'fr'; // Français par défaut pour la Suisse
      }
    } else if (clusterName === 'france') {
      selectedLocale = 'fr';
    } else if (isValidLocale(browserLang)) {
      selectedLocale = browserLang as Locale;
    }

    setLocaleState(selectedLocale);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('preferred-locale', newLocale);
    
    // Mettre à jour l'attribut lang du document
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  };

  const t = (key: string, fallback?: string): string => {
    const translations = getTranslations(locale);
    return getNestedTranslation(translations, key, fallback || key);
  };

  const contextValue: TranslationContextType = {
    locale,
    setLocale,
    t
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  
  return context;
}