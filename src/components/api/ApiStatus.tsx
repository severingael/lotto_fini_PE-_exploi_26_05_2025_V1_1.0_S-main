import React from 'react';
import { Wifi, WifiOff, AlertCircle, CloudOff } from 'lucide-react';

interface ApiStatusProps {
  isConfigured: boolean;
  isOnline: boolean;
  error?: string | null;
}

export default function ApiStatus({ isConfigured, isOnline, error }: ApiStatusProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">État de la configuration</h2>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <CloudOff className="w-4 h-4 text-yellow-500" />
            )}
            <p className="text-sm text-gray-600">
              {!isOnline ? 'Mode hors ligne - Les données sont chargées depuis le cache local' : 
               isConfigured ? 'API correctement configurée et opérationnelle' : 
               'API non configurée'}
            </p>
          </div>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {!isConfigured && !error && (
            <div className="mt-2 flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">
                Veuillez configurer votre clé API dans les paramètres pour accéder aux cotes sportives. 
                La configuration sera sauvegardée et accessible sur tous vos appareils.
              </p>
            </div>
          )}
          {!isOnline && !error && (
            <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">
                Vous êtes actuellement en mode hors ligne. Les données sont chargées depuis le cache local. 
                La synchronisation avec le serveur reprendra automatiquement lorsque la connexion sera rétablie.
              </p>
            </div>
          )}
        </div>
        <div className={`w-3 h-3 rounded-full ${
          !isOnline ? 'bg-yellow-500' :
          isConfigured ? 'bg-green-500' : 
          'bg-red-500'
        }`} />
      </div>
    </div>
  );
}