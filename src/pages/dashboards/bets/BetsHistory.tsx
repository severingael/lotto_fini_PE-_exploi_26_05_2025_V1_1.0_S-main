import React, { useState } from 'react';
import { History, Search, Filter, Calendar } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import { formatCurrency } from '../../../utils/format';

const MOCK_BETS_HISTORY = [
  {
    id: '1',
    match: 'PSG vs Marseille',
    selection: 'PSG',
    odds: 1.85,
    stake: 100,
    result: 'won',
    winAmount: 185,
    date: '2024-03-01T20:45:00',
    type: 'simple'
  },
  {
    id: '2',
    matches: [
      { match: 'Real Madrid vs Barcelona', selection: 'Real Madrid', odds: 2.1 },
      { match: 'Bayern vs Dortmund', selection: 'Bayern', odds: 1.75 }
    ],
    totalOdds: 3.675,
    stake: 50,
    result: 'lost',
    date: '2024-03-02T21:00:00',
    type: 'combine'
  }
];

export default function BetsHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBets = MOCK_BETS_HISTORY.filter(bet => {
    const matchesSearch = bet.type === 'simple' 
      ? bet.match.toLowerCase().includes(searchTerm.toLowerCase())
      : bet.matches.some(m => m.match.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = !dateFilter || bet.date.startsWith(dateFilter);
    const matchesStatus = statusFilter === 'all' || bet.result === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  return (
    <BaseDashboard title="Historique des paris">
      <div className="space-y-6">
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un match..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">Tous les paris</option>
              <option value="won">Paris gagnés</option>
              <option value="lost">Paris perdus</option>
            </select>
          </div>
        </div>

        {/* Liste des paris */}
        {filteredBets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun pari trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBets.map((bet) => (
              <div key={bet.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bet.result === 'won' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {bet.type === 'simple' ? 'Pari Simple' : 'Pari Combiné'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(bet.date).toLocaleString('fr-FR')}
                  </span>
                </div>

                {bet.type === 'simple' ? (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">{bet.match}</h3>
                    <p className="text-sm text-gray-600">Sélection: {bet.selection}</p>
                    <p className="text-sm text-gray-600">Cote: {bet.odds}</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Combiné {bet.matches.length} matchs</h3>
                    <div className="space-y-2">
                      {bet.matches.map((match, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium">{match.match}</p>
                          <p className="text-gray-600">
                            {match.selection} (Cote: {match.odds})
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Cote totale: {bet.totalOdds}
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Mise</span>
                    <span className="font-medium">{formatCurrency(bet.stake)}</span>
                  </div>
                  {bet.result === 'won' && (
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-600">Gain</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(bet.winAmount!)}
                      </span>
                    </div>
                  )}
                </div>

                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                  bet.result === 'won'
                    ? 'bg-green-50'
                    : 'bg-red-50'
                }`}>
                  <History className={`w-5 h-5 flex-shrink-0 ${
                    bet.result === 'won' ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <p className={`text-sm ${
                    bet.result === 'won' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {bet.result === 'won' ? 'Pari gagné' : 'Pari perdu'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseDashboard>
  );
}