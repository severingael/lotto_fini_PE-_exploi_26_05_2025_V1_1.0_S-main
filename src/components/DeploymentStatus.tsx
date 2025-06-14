import React, { useState, useEffect } from 'react';
import { getDeploymentStatus } from '../services/deployment';
import { AlertCircle, CheckCircle, Clock, Globe } from 'lucide-react';

interface DeploymentStatusProps {
  deployId?: string;
}

export default function DeploymentStatus({ deployId }: DeploymentStatusProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'error' | 'unknown'>('unknown');
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deployId) return;
    
    const checkStatus = async () => {
      try {
        setLoading(true);
        const result = await getDeploymentStatus({ id: deployId });
        
        if (result.status === 'success') {
          setStatus('success');
          setDeployUrl(result.deploy_url);
        } else if (result.status === 'error') {
          setStatus('error');
          setError(result.error || 'Une erreur est survenue lors du déploiement');
        } else {
          setStatus('pending');
          // Vérifier à nouveau dans 5 secondes si le déploiement est toujours en cours
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        console.error('Error checking deployment status:', err);
        setStatus('error');
        setError('Impossible de vérifier le statut du déploiement');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [deployId]);

  if (!deployId) return null;

  return (
    <div className={`rounded-lg p-4 ${
      status === 'success' ? 'bg-green-50 border border-green-200' :
      status === 'error' ? 'bg-red-50 border border-red-200' :
      'bg-blue-50 border border-blue-200'
    }`}>
      <div className="flex items-center gap-3">
        {status === 'success' ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : status === 'error' ? (
          <AlertCircle className="w-6 h-6 text-red-600" />
        ) : (
          <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
        )}
        
        <div>
          <h3 className={`font-medium ${
            status === 'success' ? 'text-green-800' :
            status === 'error' ? 'text-red-800' :
            'text-blue-800'
          }`}>
            {status === 'success' ? 'Déploiement réussi' :
             status === 'error' ? 'Erreur de déploiement' :
             'Déploiement en cours...'}
          </h3>
          
          {status === 'success' && deployUrl && (
            <div className="mt-2">
              <a 
                href={deployUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Globe className="w-4 h-4" />
                <span>Voir le site déployé</span>
              </a>
            </div>
          )}
          
          {status === 'error' && error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
          
          {status === 'pending' && (
            <p className="text-sm text-blue-600 mt-1">
              Le déploiement est en cours de traitement. Cette page sera mise à jour automatiquement.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}