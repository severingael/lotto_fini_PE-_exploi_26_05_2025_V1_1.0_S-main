import React from 'react';
import { Database, BarChart, Settings, AlertCircle } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import ApiStatus from '../../../components/api/ApiStatus';
import FeatureCard from '../../../components/api/FeatureCard';
import UsageStats from '../../../components/api/UsageStats';
import { useFirestoreConnection } from '../../../hooks/useFirestoreConnection';
import { oddsApi } from '../../../services/odds';
import { useConnection } from '../../../contexts/ConnectionContext';

const features = [
  {
    title: 'Configuration API',
    description: 'Gérer la clé API et les paramètres de connexion',
    icon: Settings,
    path: '/dashboard/api/odds-config',
    color: 'blue'
  },
  {
    title: 'Sports',
    description: 'Configurer les championnats et leurs paramètres',
    icon: BarChart,
    path: '/dashboard/api/sports-config',
    color: 'green'
  },
  {
    title: 'Base de données',
    description: 'Explorer et gérer les données',
    icon: Database,
    path: '/dashboard/api/database',
    color: 'purple'
  }
];

export default function ApiDashboard() {
  const isConfigured = oddsApi.isConfigured();
  const { isOnline } = useConnection();
  const { isOnline: isFirestoreOnline } = useFirestoreConnection();

  return (
    <BaseDashboard title="Configuration API">
      <div className="space-y-6">
        {!isFirestoreOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Mode hors ligne</p>
                <p className="text-sm text-yellow-700">
                  Les configurations sont chargées depuis le cache local. 
                  La synchronisation reprendra automatiquement lorsque la connexion sera rétablie.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <ApiStatus 
          isConfigured={isConfigured} 
          isOnline={isOnline && isFirestoreOnline} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <UsageStats />
      </div>
    </BaseDashboard>
  );
}