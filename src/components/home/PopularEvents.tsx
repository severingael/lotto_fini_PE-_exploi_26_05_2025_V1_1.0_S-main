import React, { useState } from 'react';
import { Star, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { useOdds } from '../../hooks/useOdds';
import { oddsApi } from '../../services/odds';

const FEATURED_LEAGUES = [
  { key: 'soccer_uefa_champs_league', name: 'Champions League' },
  { key: 'soccer_epl', name: 'Premier League' }
].filter(league => {
  const config = oddsApi.getSportConfig(league.key);
  return config.enabled;
});

export default function PopularEvents() {
  const [selectedLeague, setSelectedLeague] = useState(FEATURED_LEAGUES[0]?.key || '');
  const { data: matches, isLoading, error, refetch } = useOdds(selectedLeague);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Événements Populaires</h2>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-700">Championnats</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {FEATURED_LEAGUES.map((league) => (
            <button
              key={league.key}
              onClick={() => setSelectedLeague(league.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedLeague === league.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error.message}</p>
        </div>
      ) : matches?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Aucun événement disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches?.slice(0, 6).map((match) => {
            const mainMarket = match.bookmakers[0]?.markets[0];
            const homeOdds = mainMarket?.outcomes.find(o => o.name === match.home_team)?.price;
            const awayOdds = mainMarket?.outcomes.find(o => o.name === match.away_team)?.price;
            const drawOdds = mainMarket?.outcomes.find(o => o.name === 'Draw')?.price;

            return (
              <div key={match.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-blue-600">{match.sport_title}</span>
                  <span className="text-sm text-gray-600">
                    {new Date(match.commence_time).toLocaleString('fr-FR', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex-1 text-center">
                    <h3 className="font-semibold">{match.home_team}</h3>
                  </div>
                  <div className="px-4 text-gray-500">VS</div>
                  <div className="flex-1 text-center">
                    <h3 className="font-semibold">{match.away_team}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {homeOdds && (
                    <button className="py-2 px-3 text-center rounded bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-600">1</div>
                      <div className="font-bold text-blue-600">{homeOdds.toFixed(2)}</div>
                    </button>
                  )}
                  {drawOdds && (
                    <button className="py-2 px-3 text-center rounded bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-600">X</div>
                      <div className="font-bold text-blue-600">{drawOdds.toFixed(2)}</div>
                    </button>
                  )}
                  {awayOdds && (
                    <button className="py-2 px-3 text-center rounded bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-600">2</div>
                      <div className="font-bold text-blue-600">{awayOdds.toFixed(2)}</div>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}