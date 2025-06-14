import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import { formatCurrency } from '../../../utils/format';

const MOCK_ACTIVE_BETS = [
  {
    id: '1',
    match: 'PSG vs Marseille',
    selection: 'PSG',
    odds: 1.85,
    stake: 100,
    potentialWin: 185,
    date: '2024-03-10T20:45:00',
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
    potentialWin: 183.75,
    date: '2024-03-10T21:00:00',
    type: 'combine'
  }
];

export default function ActiveBets() {
  return (
    <BaseDashboard title="Paris en cours">
      <div className="space-y-6">
        {MOCK_ACTIVE_BETS.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun pari en cours</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {MOCK_ACTIVE_BETS.map((bet) => (
              <div key={bet.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
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
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-600">Gain potentiel</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(bet.potentialWin)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    En attente du résultat du match
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