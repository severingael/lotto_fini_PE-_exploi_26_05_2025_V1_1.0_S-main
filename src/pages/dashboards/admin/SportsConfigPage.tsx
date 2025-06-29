import React, { useState } from 'react';
import { BarChart, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { useSports } from '../../../hooks/useOdds';
import { oddsApi } from '../../../services/odds';
import BaseDashboard from '../BaseDashboard';

export default function SportsConfigPage() {
  const { data: sports, isLoading, error, refetch } = useSports();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSports = sports?.filter(sport =>
    sport.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sport.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <BaseDashboard title="Configuration des Sports">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </BaseDashboard>
    );
  }

  if (error) {
    return (
      <BaseDashboard title="Configuration des Sports">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-600">Erreur lors du chargement des sports</p>
        </div>
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Configuration des Sports">
      <div className="space-y-6">
        {/* Header avec recherche et refresh */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un sport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Actualiser
          </button>
        </div>

        {/* Liste des sports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSports?.map((sport) => {
            const config = oddsApi.getSportConfig(sport.key);
            return (
              <div key={sport.key} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{sport.title}</h3>
                    <p className="text-sm text-gray-600">{sport.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Statut</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      config.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {config.enabled ? 'Activé' : 'Désactivé'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Intervalle de mise à jour</span>
                    <span className="text-sm font-medium">{config.refreshInterval}s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BaseDashboard>
  );
}