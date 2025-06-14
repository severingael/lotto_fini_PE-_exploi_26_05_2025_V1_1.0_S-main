import React from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConfigRequiredProps {
  message: string;
  configPath: string;
}

export default function ConfigRequired({ message, configPath }: ConfigRequiredProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <Settings className="w-12 h-12 text-blue-600 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Configuration requise</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">
            La configuration sera sauvegardée et accessible sur tous vos appareils une fois la connexion rétablie.
          </p>
        </div>
      </div>
      <Link
        to={configPath}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Settings className="w-5 h-5" />
        Configurer maintenant
      </Link>
    </div>
  );
}