'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté/refusé les cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    const storedPreferences = localStorage.getItem('cookiePreferences');
    
    if (!cookiesAccepted && !storedPreferences) {
      setShowBanner(true);
    }
  }, []);

  const acceptAllCookies = () => {
    const preferences = {
      essential: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem('cookiesAccepted', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setShowBanner(false);
  };

  const acceptEssentialOnly = () => {
    const preferences = {
      essential: true,
      analytics: false,
      marketing: false
    };
    localStorage.setItem('cookiesAccepted', 'essential-only');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setShowBanner(false);
  };

  const saveCustomPreferences = () => {
    localStorage.setItem('cookiesAccepted', 'custom');
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Message principal */}
          <div className="flex-1">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🍪</span>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Respect de votre vie privée
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Nous utilisons des cookies pour améliorer votre expérience de navigation, 
                  analyser le trafic du site et personnaliser le contenu. En continuant à utiliser 
                  ce site, vous acceptez notre utilisation des cookies.
                </p>
                <div className="flex flex-wrap items-center space-x-4 text-xs text-gray-500">
                  <Link href="/mentions-legales" className="hover:text-blue-600 underline">
                    Mentions légales
                  </Link>
                  <Link href="/politique-cookies" className="hover:text-blue-600 underline">
                    Politique des cookies
                  </Link>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Conforme RGPD</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Options de cookies */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {/* Préférences détaillées */}
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={cookiePreferences.essential}
                    disabled
                    className="mr-2"
                  />
                  <span className="text-gray-600">Essentiels (obligatoires)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={cookiePreferences.analytics}
                    onChange={(e) => setCookiePreferences(prev => ({
                      ...prev,
                      analytics: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <span className="text-gray-600">Analytiques</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={cookiePreferences.marketing}
                    onChange={(e) => setCookiePreferences(prev => ({
                      ...prev,
                      marketing: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  <span className="text-gray-600">Marketing</span>
                </label>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={acceptAllCookies}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Accepter tout
              </button>
              <button
                onClick={acceptEssentialOnly}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Essentiels uniquement
              </button>
              <button
                onClick={saveCustomPreferences}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Sauvegarder mes choix
              </button>
            </div>
          </div>

          {/* Bouton de fermeture */}
          <button
            onClick={() => setShowBanner(false)}
            className="text-gray-400 hover:text-gray-600 ml-4"
            aria-label="Fermer la bannière"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;