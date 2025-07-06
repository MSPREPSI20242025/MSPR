import { useState } from 'react';
import Link from 'next/link';

const RGPDIndicator = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div 
        className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-green-200 transition-colors"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="text-green-600">🛡️</span>
        <span className="font-medium">RGPD</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <h4 className="font-semibold text-gray-900 mb-2">Conformité RGPD</h4>
          <p className="text-sm text-gray-600 mb-3">
            Ce site respecte le Règlement Général sur la Protection des Données (RGPD) 
            et protège vos données personnelles.
          </p>
          
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Données chiffrées (HTTPS)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Cookies contrôlés</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Droits utilisateur respectés</span>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-3">
            <Link 
              href="/mentions-legales" 
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              Mentions légales
            </Link>
            <Link 
              href="/politique-cookies" 
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              Cookies
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default RGPDIndicator;