'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from './TranslationProvider';
import LanguageSelector from './LanguageSelector';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [showCookieNotice, setShowCookieNotice] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté les cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    const cookiePreferences = localStorage.getItem('cookiePreferences');
    
    // Afficher la notice si aucun consentement n'a été donné
    if (!cookiesAccepted && !cookiePreferences) {
      setShowCookieNotice(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookieNotice(false);
  };

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('home.title')}</h3>
            <p className="text-gray-300 text-sm">
              {t('home.description')}
            </p>
            
            {/* Sélecteur de langue */}
            <div className="mt-4">
              <LanguageSelector variant="compact" className="inline-block" />
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-md font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/covid" className="hover:text-white transition-colors">
                  {t('nav.covid')}
                </Link>
              </li>
              <li>
                <Link href="/mpox" className="hover:text-white transition-colors">
                  {t('nav.mpox')}
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">
                  {t('nav.compare')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Conformité RGPD */}
          <div>
            <h4 className="text-md font-semibold mb-4">{t('footer.compliance')}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/mentions-legales" className="hover:text-white transition-colors">
                  {t('legal.legalNotices')}
                </Link>
              </li>
              <li>
                <Link href="/politique-cookies" className="hover:text-white transition-colors">
                  {t('legal.cookiePolicy')}
                </Link>
              </li>
              <li>
                <a href="mailto:dpo@who.int" className="hover:text-white transition-colors">
                  {t('legal.contactDPO')}
                </a>
              </li>
              <li>
                <span className="text-green-400 text-xs">✓ {t('legal.gdprCompliant')}</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-md font-semibold mb-4">{t('footer.contact')}</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>{t('footer.aboutWHO')}</p>
              <p>{t('footer.address')}</p>
              <p>
                <a href="mailto:privacy@who.int" className="hover:text-white transition-colors">
                  privacy@who.int
                </a>
              </p>
              <p>+41 22 791 21 11</p>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {currentYear} {t('footer.copyright')}
            </div>
            
            {/* Note de conformité simple */}
            <div className="text-xs text-gray-400">
              <span className="text-green-400">✓</span> {t('legal.gdprCompliant')}
            </div>
          </div>
        </div>

        {/* Notice de cookies */}
        {showCookieNotice && (
          <div className="mt-4 p-3 bg-blue-900 rounded text-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-2 md:mb-0">
                <span className="text-blue-200">
                  🍪 Ce site utilise des cookies pour améliorer votre expérience.
                </span>
              </div>
              <div className="flex space-x-2">
                <Link href="/politique-cookies" className="text-blue-200 hover:text-white underline">
                  Gérer les cookies
                </Link>
                <button 
                  onClick={handleAcceptCookies}
                  className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-white"
                >
                  Accepter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;