import React from 'react';
import { Trophy } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import { formatCurrency } from '../../../utils/format';

const MOCK_WON_BETS = [
  {
    id: '1',
    match: 'Liverpool vs Chelsea',
    selection: 'Liverpool',
    odds: 2.1,
    stake: 100,
    winAmount: 210,
    date: '2024-03-01T20:45:00',
    type: 'simple'
  },
  {
    id: '2',
    matches: [
      { match: 'Milan vs Inter', selection: 'Milan', odds: 2.5 },
      { match: 'Ajax vs PSV', selection: 'Ajax', odds: 1.8 }
    ],
    totalOdds: 4.5,
    stake: 50,
    winAmount: 225,
    date: '2024-03-02T21:00:00',
    type: 'combine'
  }
];

export default function WonBets() {
  return (
    <BaseDashboard title="Paris gagnés">
      <div className="space-y-6">
        {MOCK_WON_BETS.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun pari gagné</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {MOCK_WON_BETS.map((bet) => (
              <div key={bet.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
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
                    <span className="text-gray-600">Gain</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(bet.winAmount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    Pari gagné ! Félicitations !
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