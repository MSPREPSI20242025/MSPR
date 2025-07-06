'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from './TranslationProvider';
import { languages, type Locale } from '@/lib/i18n';

interface LanguageSelectorProps {
  className?: string;
  showFlag?: boolean;
  showText?: boolean;
  variant?: 'dropdown' | 'buttons' | 'compact';
}

export default function LanguageSelector({ 
  className = '',
  showFlag = true,
  showText = true,
  variant = 'dropdown'
}: LanguageSelectorProps) {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les langues selon le cluster
  const getAvailableLanguages = () => {
    const clusterName = process.env.NEXT_PUBLIC_CLUSTER_NAME || 'us';
    
    switch (clusterName) {
      case 'switzerland':
        return ['fr', 'de', 'it'] as Locale[];
      case 'france':
        return ['fr'] as Locale[];
      case 'us':
      default:
        return ['en', 'fr', 'de', 'it'] as Locale[];
    }
  };

  const availableLanguages = getAvailableLanguages();

  // Si une seule langue disponible, ne pas afficher le sélecteur
  if (availableLanguages.length <= 1) {
    return null;
  }

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  // Variante boutons
  if (variant === 'buttons') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`px-2 py-1 rounded text-sm transition-colors ${
              locale === lang
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showFlag && languages[lang].flag} {showText && languages[lang].code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  // Variante compacte (juste le drapeau)
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Changer de langue"
        >
          <span className="text-lg">{languages[locale].flag}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors text-sm ${
                  locale === lang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="mr-2">{languages[lang].flag}</span>
                {languages[lang].name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Variante dropdown (par défaut)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        aria-label="Sélectionner la langue"
      >
        {showFlag && <span>{languages[locale].flag}</span>}
        {showText && <span>{languages[locale].name}</span>}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                locale === lang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{languages[lang].flag}</span>
                <div>
                  <div className="font-medium">{languages[lang].name}</div>
                  <div className="text-xs text-gray-500">{lang.toUpperCase()}</div>
                </div>
                {locale === lang && (
                  <span className="ml-auto text-blue-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}