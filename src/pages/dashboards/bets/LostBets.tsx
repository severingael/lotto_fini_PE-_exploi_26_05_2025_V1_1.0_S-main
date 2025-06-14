import React from 'react';
import { XCircle } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import { formatCurrency } from '../../../utils/format';

const MOCK_LOST_BETS = [
  {
    id: '1',
    match: 'Arsenal vs Tottenham',
    selection: 'Arsenal',
    odds: 1.95,
    stake: 100,
    date: '2024-03-01T20:45:00',
    type: 'simple'
  },
  {
    id: '2',
    matches: [
      { match: 'Lyon vs Monaco', selection: 'Lyon', odds: 2.2 },
      { match: 'Napoli vs Roma', selection: 'Napoli', odds: 1.9 }
    ],
    totalOdds: 4.18,
    stake: 50,
    date: '2024-03-02T21:00:00',
    type: 'combine'
  }
];

export default function LostBets() {
  return (
    <BaseDashboard title="Paris perdus">
      <div className="space-y-6">
        {MOCK_LOST_BETS.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun pari perdu</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {MOCK_LOST_BETS.map((bet) => (
              <div key={bet.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
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
                    <span className="text-gray-600">Mise perdue</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(bet.stake)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">
                    Pari perdu. Tentez à nouveau votre chance !
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