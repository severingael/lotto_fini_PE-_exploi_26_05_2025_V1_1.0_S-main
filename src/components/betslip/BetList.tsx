import React from 'react';
import { Clock, Trophy, XCircle } from 'lucide-react';
import { useBetsList } from '../../hooks/useBetsList';
import { formatCurrency } from '../../utils/format';
import LoadingState from '../LoadingState';

export default function BetList() {
  const { bets, loading, error } = useBetsList();

  if (loading) {
    return <LoadingState message="Chargement des paris..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'won':
        return <Trophy className="w-5 h-5 text-green-500" />;
      case 'lost':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {bets.map((bet) => (
        <div key={bet.id} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="font-medium">{bet.match}</div>
              <div className="text-sm text-gray-600">{bet.selection}</div>
            </div>
            {getStatusIcon(bet.status)}
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Mise: {formatCurrency(bet.stake)}</span>
            <span className="font-medium">
              Cote: {bet.odds}
            </span>
          </div>
          
          {bet.status === 'pending' && bet.potentialWin && (
            <div className="mt-2 text-sm text-green-600">
              Gain potentiel: {formatCurrency(bet.potentialWin)}
            </div>
          )}
          
          {bet.status === 'won' && bet.actualWin && (
            <div className="mt-2 text-sm text-green-600">
              Gain: {formatCurrency(bet.actualWin)}
            </div>
          )}
        </div>
      ))}

      {bets.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          Aucun pari trouvé
        </div>
      )}
    </div>
  );
}