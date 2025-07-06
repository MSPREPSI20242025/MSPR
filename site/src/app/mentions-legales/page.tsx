'use client';

import Link from 'next/link';
import { useTranslation } from '@/components/TranslationProvider';

export default function MentionsLegales() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← {t('legal.backToHome')}
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('legal.mentionsLegales.title')}</h1>
        <p className="text-gray-600">{t('legal.mentionsLegales.subtitle')}</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
        {/* Éditeur du site */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. {t('legal.mentionsLegales.editor')}</h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>Nom :</strong> Organisation Mondiale de la Santé (OMS)</p>
            <p><strong>Adresse :</strong> Avenue Appia 20, 1211 Genève, Suisse</p>
            <p><strong>Email :</strong> privacy@who.int</p>
            <p><strong>Téléphone :</strong> +41 22 791 21 11</p>
          </div>
        </section>

        {/* Hébergement */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. {t('legal.mentionsLegales.hosting')}</h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>Hébergeur :</strong> Infrastructure Cloud Sécurisée</p>
            <p><strong>Localisation :</strong> Union Européenne</p>
            <p>Les données sont hébergées dans des centres de données certifiés ISO 27001 et conformes RGPD.</p>
          </div>
        </section>

        {/* Collecte de données */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. {t('legal.mentionsLegales.dataCollection')}</h2>
          <div className="text-gray-700 space-y-4">
            <h3 className="text-lg font-medium">3.1 Données collectées</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Données de navigation (adresse IP, type de navigateur, pages visitées)</li>
              <li>Cookies techniques nécessaires au fonctionnement du site</li>
              <li>Données d'authentification (pour les utilisateurs connectés)</li>
              <li>Aucune donnée personnelle sensible n'est collectée</li>
            </ul>

            <h3 className="text-lg font-medium">3.2 Finalités du traitement</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Assurer le fonctionnement technique du site</li>
              <li>Améliorer l'expérience utilisateur</li>
              <li>Analyser l'utilisation du site (statistiques anonymisées)</li>
              <li>Sécuriser l'accès aux données de santé publique</li>
            </ul>

            <h3 className="text-lg font-medium">3.3 Base légale</h3>
            <p>Le traitement est basé sur l'intérêt légitime de l'OMS pour la surveillance épidémiologique et la santé publique mondiale, conformément à l'article 6(1)(f) du RGPD.</p>
          </div>
        </section>

        {/* Droits des utilisateurs */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. {t('legal.mentionsLegales.userRights')}</h2>
          <div className="text-gray-700 space-y-4">
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Droit d'accès</h4>
                <p className="text-sm text-blue-800">Obtenir une copie de vos données personnelles</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Droit de rectification</h4>
                <p className="text-sm text-green-800">Corriger vos données inexactes</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Droit à l'effacement</h4>
                <p className="text-sm text-yellow-800">Demander la suppression de vos données</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Droit d'opposition</h4>
                <p className="text-sm text-purple-800">Vous opposer au traitement de vos données</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Pour exercer vos droits</h4>
              <p className="text-sm text-gray-700">
                Contactez notre Délégué à la Protection des Données (DPO) :
                <br />
                <strong>Email :</strong> dpo@who.int
                <br />
                <strong>Délai de réponse :</strong> 30 jours maximum
              </p>
            </div>
          </div>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. {t('legal.mentionsLegales.cookiesSection')}</h2>
          <div className="text-gray-700 space-y-4">
            <h3 className="text-lg font-medium">5.1 Cookies techniques (obligatoires)</h3>
            <p>Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Cookies de session d'authentification</li>
              <li>Cookies de préférences linguistiques</li>
              <li>Cookies de sécurité</li>
            </ul>

            <h3 className="text-lg font-medium">5.2 Cookies analytiques (facultatifs)</h3>
            <p>Ces cookies nous aident à améliorer le site. Vous pouvez les refuser :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Statistiques de fréquentation anonymisées</li>
              <li>Analyse des parcours utilisateur</li>
            </ul>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Durée de conservation :</strong> 13 mois maximum
                <br />
                <strong>Gestion :</strong> Vous pouvez gérer vos préférences via les paramètres de votre navigateur
              </p>
            </div>
          </div>
        </section>

        {/* Conservation des données */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. {t('legal.mentionsLegales.dataRetention')}</h2>
          <div className="text-gray-700 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Données de navigation :</strong> 13 mois</li>
              <li><strong>Logs de sécurité :</strong> 12 mois</li>
              <li><strong>Données d'authentification :</strong> Durée du compte utilisateur</li>
              <li><strong>Données épidémiologiques :</strong> Conservation permanente (intérêt public)</li>
            </ul>
          </div>
        </section>

        {/* Sécurité */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. {t('legal.mentionsLegales.security')}</h2>
          <div className="text-gray-700 space-y-2">
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Chiffrement des données sensibles en base</li>
              <li>Authentification à double facteur</li>
              <li>Audits de sécurité réguliers</li>
              <li>Formation du personnel aux bonnes pratiques</li>
              <li>Plan de réponse aux incidents de sécurité</li>
            </ul>
          </div>
        </section>

        {/* Transferts internationaux */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. {t('legal.mentionsLegales.internationalTransfers')}</h2>
          <div className="text-gray-700 space-y-2">
            <p>Les données sont principalement traitées au sein de l'Union Européenne.</p>
            <p>Tout transfert vers un pays tiers est encadré par :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Une décision d'adéquation de la Commission européenne, ou</li>
              <li>Des garanties appropriées (clauses contractuelles types)</li>
            </ul>
          </div>
        </section>

        {/* Réclamations */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. {t('legal.mentionsLegales.complaints')}</h2>
          <div className="text-gray-700 space-y-2">
            <p>Vous avez le droit d'introduire une réclamation auprès de l'autorité de contrôle compétente :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>France :</strong> CNIL (cnil.fr)</li>
              <li><strong>Suisse :</strong> PFPDT (edoeb.admin.ch)</li>
              <li><strong>UE :</strong> Autorité de protection des données de votre pays</li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('legal.mentionsLegales.contact')}</h2>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">{t('legal.mentionsLegales.dpoTitle')}</h3>
            <div className="text-blue-800 space-y-1">
              <p><strong>Email :</strong> dpo@who.int</p>
              <p><strong>Adresse :</strong> WHO Data Protection Officer, Avenue Appia 20, 1211 Genève, Suisse</p>
              <p><strong>Téléphone :</strong> +41 22 791 21 11</p>
            </div>
          </div>
        </section>

        {/* Mise à jour */}
        <section className="text-sm text-gray-500 border-t pt-4">
          <p><strong>{t('legal.mentionsLegales.lastUpdate')} :</strong> {new Date().toLocaleDateString('fr-FR')}</p>
          <p>Cette politique peut être mise à jour. Les modifications importantes vous seront notifiées.</p>
        </section>
      </div>
    </div>
  );
}