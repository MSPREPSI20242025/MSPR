import { useState, useEffect } from 'react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const useCookiePreferences = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false
  });
  
  const [hasConsented, setHasConsented] = useState<boolean>(false);

  useEffect(() => {
    // Charger les préférences depuis localStorage au montage du composant
    const storedPreferences = localStorage.getItem('cookiePreferences');
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    if (storedPreferences) {
      try {
        const parsed = JSON.parse(storedPreferences);
        setPreferences(parsed);
      } catch (error) {
        console.error('Erreur lors du parsing des préférences cookies:', error);
      }
    }
    
    if (cookiesAccepted) {
      setHasConsented(true);
    }
  }, []);

  const updatePreferences = (newPreferences: Partial<CookiePreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    localStorage.setItem('cookiePreferences', JSON.stringify(updatedPreferences));
  };

  const acceptAllCookies = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true
    };
    setPreferences(allAccepted);
    setHasConsented(true);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    localStorage.setItem('cookiesAccepted', 'true');
  };

  const acceptEssentialOnly = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false
    };
    setPreferences(essentialOnly);
    setHasConsented(true);
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly));
    localStorage.setItem('cookiesAccepted', 'essential-only');
  };

  const rejectAllCookies = () => {
    const rejected = {
      essential: true, // Les cookies essentiels ne peuvent pas être refusés
      analytics: false,
      marketing: false
    };
    setPreferences(rejected);
    setHasConsented(true);
    localStorage.setItem('cookiePreferences', JSON.stringify(rejected));
    localStorage.setItem('cookiesAccepted', 'rejected');
  };

  const resetConsent = () => {
    setHasConsented(false);
    localStorage.removeItem('cookiesAccepted');
    localStorage.removeItem('cookiePreferences');
    setPreferences({
      essential: true,
      analytics: false,
      marketing: false
    });
  };

  // Fonctions utilitaires pour vérifier les permissions
  const canUseAnalytics = () => preferences.analytics;
  const canUseMarketing = () => preferences.marketing;

  return {
    preferences,
    hasConsented,
    updatePreferences,
    acceptAllCookies,
    acceptEssentialOnly,
    rejectAllCookies,
    resetConsent,
    canUseAnalytics,
    canUseMarketing
  };
};