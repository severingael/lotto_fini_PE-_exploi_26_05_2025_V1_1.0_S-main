import React, { useState } from 'react';
import BaseDashboard from '../BaseDashboard';
import { Globe, Upload, AlertCircle, Info } from 'lucide-react';
import DeploymentStatus from '../../../components/DeploymentStatus';

export default function DeploymentPage() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployId, setDeployId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      setError(null);
      
      // Simuler un déploiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Générer un ID de déploiement fictif
      const mockDeployId = `deploy-${Date.now()}`;
      setDeployId(mockDeployId);
    } catch (err) {
      console.error('Error deploying site:', err);
      setError('Une erreur est survenue lors du déploiement');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <BaseDashboard title="Déploiement du Site">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Déploiement du site</h2>
              <p className="text-sm text-gray-600">
                Déployez votre application sur Netlify
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-blue-800">
                Le déploiement créera une version en ligne de votre application accessible à tous. 
                Assurez-vous que toutes vos modifications sont prêtes avant de procéder.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {deployId ? (
            <DeploymentStatus deployId={deployId} />
          ) : (
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeploying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Déploiement en cours...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Déployer le site</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </BaseDashboard>
  );
}