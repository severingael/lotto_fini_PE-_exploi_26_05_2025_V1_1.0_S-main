import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import type { Bet } from '../../services/betting/types';

interface BetCardProps {
  bet: Bet;
}

export default function BetCard({ bet }: BetCardProps) {
  const getStatusIcon = () => {
    switch (bet.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'won':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'lost':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusStyle = () => {
    switch (bet.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle()}`}>
            {bet.type === 'simple' ? 'Pari Simple' : 'Pari Combiné'}
          </span>
          {getStatusIcon()}
        </div>
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
          <h3 className="font-medium mb-2">Combiné {bet.matches?.length} matchs</h3>
          <div className="space-y-2">
            {bet.matches?.map((match, index) => (
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
        {bet.status === 'pending' && bet.potentialWin && (
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Gain potentiel</span>
            <span className="font-medium text-green-600">
              {formatCurrency(bet.potentialWin)}
            </span>
          </div>
        )}
        {bet.status === 'won' && bet.actualWin && (
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Gain</span>
            <span className="font-medium text-green-600">
              {formatCurrency(bet.actualWin)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}