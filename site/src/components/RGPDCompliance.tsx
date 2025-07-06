import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RGPDComplianceProps {
  clusterName?: string;
}

const RGPDCompliance: React.FC<RGPDComplianceProps> = ({ 
  clusterName = process.env.NEXT_PUBLIC_CLUSTER_NAME || 'us' 
}) => {
  const [isRGPDRequired, setIsRGPDRequired] = useState(false);
  const [showDataRetentionInfo, setShowDataRetentionInfo] = useState(false);

  useEffect(() => {
    // Activer les fonctionnalités RGPD pour le cluster France
    if (clusterName === 'france' || clusterName === 'switzerland') {
      setIsRGPDRequired(true);
    }
  }, [clusterName]);

  if (!isRGPDRequired) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <span className="text-2xl">🇪🇺</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Conformité RGPD - Protection des Données
          </h3>
          
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              En tant qu'utilisateur en Europe, vous bénéficiez de droits renforcés concernant 
              vos données personnelles selon le Règlement Général sur la Protection des Données (RGPD).
            </p>

            {/* Informations sur la rétention des données */}
            <div className="bg-white rounded p-3 border border-blue-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">Rétention des données</span>
                <button
                  onClick={() => setShowDataRetentionInfo(!showDataRetentionInfo)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {showDataRetentionInfo ? '−' : '+'}
                </button>
              </div>
              
              {showDataRetentionInfo && (
                <div className="mt-2 space-y-2 text-xs text-blue-700">
                  <div className="flex justify-between">
                    <span>Données de navigation:</span>
                    <span className="font-medium">13 mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logs de sécurité:</span>
                    <span className="font-medium">12 mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Données épidémiologiques:</span>
                    <span className="font-medium">Intérêt public (permanent)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Préférences utilisateur:</span>
                    <span className="font-medium">Jusqu'à suppression</span>
                  </div>
                </div>
              )}
            </div>

            {/* Droits RGPD */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded p-2 border border-blue-100 text-center">
                <div className="text-green-600 text-lg mb-1">✓</div>
                <div className="text-xs font-medium">Droit d'accès</div>
              </div>
              <div className="bg-white rounded p-2 border border-blue-100 text-center">
                <div className="text-green-600 text-lg mb-1">✓</div>
                <div className="text-xs font-medium">Droit de rectification</div>
              </div>
              <div className="bg-white rounded p-2 border border-blue-100 text-center">
                <div className="text-green-600 text-lg mb-1">✓</div>
                <div className="text-xs font-medium">Droit à l'effacement</div>
              </div>
              <div className="bg-white rounded p-2 border border-blue-100 text-center">
                <div className="text-green-600 text-lg mb-1">✓</div>
                <div className="text-xs font-medium">Droit d'opposition</div>
              </div>
            </div>

            {/* Actions utilisateur */}
            <div className="bg-white rounded p-3 border border-blue-100">
              <h4 className="font-medium text-blue-900 mb-2">Exercer vos droits</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Télécharger mes données</span>
                  <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
                    Exporter
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Supprimer mes données</span>
                  <button className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">
                    Supprimer
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Gérer les cookies</span>
                  <Link 
                    href="/politique-cookies"
                    className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                  >
                    Configurer
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact DPO */}
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <h4 className="font-medium text-green-900 mb-1">Contact DPO</h4>
              <div className="text-xs text-green-800 space-y-1">
                <div>📧 <a href="mailto:dpo@who.int" className="underline hover:no-underline">dpo@who.int</a></div>
                <div>📞 +41 22 791 21 11</div>
                <div>⏱️ Réponse sous 30 jours maximum</div>
              </div>
            </div>
          </div>

          {/* Liens légaux */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            <Link href="/mentions-legales" className="text-blue-600 hover:text-blue-800 underline">
              Mentions légales complètes
            </Link>
            <Link href="/politique-cookies" className="text-blue-600 hover:text-blue-800 underline">
              Politique des cookies
            </Link>
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
              CNIL (Autorité française)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RGPDCompliance;