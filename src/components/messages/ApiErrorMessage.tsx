import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ApiErrorMessageProps {
  error: { code: string; message: string };
  onRetry?: () => void;
}

export default function ApiErrorMessage({ error, onRetry }: ApiErrorMessageProps) {
  const { userData } = useAuth();
  const isAdmin = userData?.role === 'adminuser';

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">
        {error.code === 'API_KEY_REQUIRED' ? 'Configuration requise' : 'Une erreur est survenue'}
      </h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      
      {error.code === 'API_KEY_REQUIRED' && isAdmin && (
        <Link
          to="/dashboard/admin/odds-config"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Settings className="w-5 h-5" />
          Configurer l'API
        </Link>
      )}

      {error.code !== 'API_KEY_REQUIRED' && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Settings className="w-5 h-5" />
          Réessayer
        </button>
      )}
    </div>
  );
}