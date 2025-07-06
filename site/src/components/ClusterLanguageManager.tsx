'use client';

import { useEffect } from 'react';
import { useTranslation } from './TranslationProvider';
import type { Locale } from '@/lib/i18n';

export default function ClusterLanguageManager() {
  const { locale, setLocale } = useTranslation();

  useEffect(() => {
    // Gérer les langues selon le cluster spécifié dans CLAUDE.md
    // Ce useEffect ne doit s'exécuter qu'au premier montage du composant
    const clusterName = process.env.NEXT_PUBLIC_CLUSTER_NAME || 'us';
    const storedLocale = localStorage.getItem('preferred-locale') as Locale;

    // Si l'utilisateur a déjà fait un choix de langue, ne pas interférer
    if (storedLocale) {
      return;
    }

    // Définir les langues autorisées par cluster
    const clusterLanguages: Record<string, Locale[]> = {
      'us': ['en', 'fr', 'de', 'it'],           // États-Unis: toutes les langues
      'france': ['fr'],                          // France: français uniquement
      'switzerland': ['fr', 'de', 'it']         // Suisse: français, allemand, italien
    };

    const allowedLanguages = clusterLanguages[clusterName] || ['fr'];

    // Configuration initiale selon le cluster uniquement si pas de préférence stockée
    if (clusterName === 'switzerland') {
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (allowedLanguages.includes(browserLang)) {
        setLocale(browserLang);
      } else {
        // Logique de détection géographique basique pour la Suisse
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Zurich')) {
          setLocale('de');
        } else {
          setLocale('fr');
        }
      }
    } else if (clusterName === 'france') {
      setLocale('fr');
    } else if (clusterName === 'us') {
      // Pour les US, garder la détection du navigateur ou français par défaut
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (allowedLanguages.includes(browserLang)) {
        setLocale(browserLang);
      } else {
        setLocale('en');
      }
    }
  }, [setLocale]); // Retirer 'locale' des dépendances pour éviter la boucle

  // Ce composant ne rend rien, il gère juste la logique
  return null;
}