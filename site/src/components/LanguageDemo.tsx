'use client';

import { useTranslation } from './TranslationProvider';
import LanguageSelector from './LanguageSelector';

export default function LanguageDemo() {
  const { t, locale } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('home.title')} - Demo Multilingue
        </h2>
        <LanguageSelector />
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Langue actuelle: {locale.toUpperCase()}</h3>
          <p className="text-blue-800">{t('home.description')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Navigation</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• {t('nav.home')}</li>
              <li>• {t('nav.covid')}</li>
              <li>• {t('nav.mpox')}</li>
              <li>• {t('nav.compare')}</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Données</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• {t('data.totalCases')}</li>
              <li>• {t('data.newCases')}</li>
              <li>• {t('data.totalDeaths')}</li>
              <li>• {t('data.country')}</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Configuration du cluster</h4>
          <div className="text-sm text-green-800">
            <p><strong>Cluster:</strong> {process.env.NEXT_PUBLIC_CLUSTER_NAME}</p>
            <p><strong>Langues supportées:</strong> {process.env.NEXT_PUBLIC_CLUSTER_LANGUAGES}</p>
            <p><strong>Fonctionnalités:</strong> {process.env.NEXT_PUBLIC_CLUSTER_FEATURES}</p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">RGPD</h4>
          <div className="text-sm text-yellow-800 space-y-1">
            <p>• {t('legal.privacyPolicy')}</p>
            <p>• {t('legal.cookiePolicy')}</p>
            <p>• {t('legal.gdprCompliant')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}