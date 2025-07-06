'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/components/TranslationProvider';

export default function PolitiqueCookies() {
  const { t } = useTranslation();
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // toujours activé
    analytics: false,
    marketing: false
  });

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Vos préférences ont été sauvegardées');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Retour à l'accueil
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Politique des Cookies</h1>
        <p className="text-gray-600">Gestion de vos préférences de cookies</p>
      </div>

      <div className="space-y-6">
        {/* Explication générale */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Qu'est-ce qu'un cookie ?</h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Un cookie est un petit fichier texte stocké sur votre ordinateur ou appareil mobile 
              lorsque vous visitez un site web. Il permet au site de se souvenir de vos actions 
              et préférences sur une période donnée.
            </p>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience de navigation et 
              comprendre comment notre site est utilisé, toujours dans le respect de votre vie privée.
            </p>
          </div>
        </div>

        {/* Types de cookies */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Types de cookies utilisés</h2>
          
          <div className="space-y-6">
            {/* Cookies essentiels */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-green-900">Cookies Essentiels</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Obligatoires</span>
              </div>
              <p className="text-green-800 mb-3">
                Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
              </p>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span><strong>session_id</strong> - Gestion de votre session</span>
                  <span>Session</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>csrf_token</strong> - Protection contre les attaques CSRF</span>
                  <span>Session</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>lang_preference</strong> - Langue sélectionnée</span>
                  <span>1 an</span>
                </div>
              </div>
            </div>

            {/* Cookies analytiques */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-blue-900">Cookies Analytiques</h3>
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
                  <span className="text-sm">{t('legal.cookiePage.allow')}</span>
                </label>
              </div>
              <p className="text-blue-800 mb-3">
                Ces cookies nous aident à comprendre comment vous utilisez notre site pour l'améliorer.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span><strong>_analytics</strong> - Statistiques de visite anonymisées</span>
                  <span>13 mois</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>_page_views</strong> - Pages les plus consultées</span>
                  <span>13 mois</span>
                </div>
              </div>
            </div>

            {/* Cookies marketing */}
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-purple-900">Cookies Marketing</h3>
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
                  <span className="text-sm">{t('legal.cookiePage.allow')}</span>
                </label>
              </div>
              <p className="text-purple-800 mb-3">
                Ces cookies sont utilisés pour personnaliser les contenus et mesurer l'efficacité de nos communications.
              </p>
              <div className="space-y-2 text-sm text-purple-700">
                <div className="flex justify-between">
                  <span><strong>_campaign</strong> - Suivi des campagnes de sensibilisation</span>
                  <span>6 mois</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>_preferences</strong> - Préférences de contenu</span>
                  <span>12 mois</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSavePreferences}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sauvegarder mes préférences
            </button>
          </div>
        </div>

        {/* Gestion des cookies */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comment gérer vos cookies ?</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Via votre navigateur</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies
                </div>
                <div>
                  <strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies
                </div>
                <div>
                  <strong>Safari :</strong> Préférences → Confidentialité → Cookies
                </div>
                <div>
                  <strong>Edge :</strong> Paramètres → Cookies et autorisations de site
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Via ce site</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Utilisez les options ci-dessus pour gérer vos préférences spécifiquement pour ce site.</p>
                <p>Vos choix seront sauvegardés et respectés lors de vos prochaines visites.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Informations importantes</h2>
          
          <div className="space-y-4 text-gray-700">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Impact de la désactivation</h4>
              <p className="text-yellow-800 text-sm">
                Désactiver certains cookies peut affecter votre expérience de navigation. 
                Les fonctionnalités du site peuvent être limitées.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="font-medium text-blue-900 mb-2">Mise à jour des préférences</h4>
              <p className="text-blue-800 text-sm">
                Vous pouvez modifier vos préférences à tout moment en revenant sur cette page.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h4 className="font-medium text-green-900 mb-2">Durée de conservation</h4>
              <p className="text-green-800 text-sm">
                Vos préférences sont conservées localement sur votre appareil et respectées 
                tant que vous ne les modifiez pas.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions sur les cookies ?</h2>
          <div className="text-gray-700">
            <p className="mb-2">
              Pour toute question concernant notre utilisation des cookies, contactez notre 
              Délégué à la Protection des Données :
            </p>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>Email :</strong> dpo@who.int</p>
              <p><strong>Téléphone :</strong> +41 22 791 21 11</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}