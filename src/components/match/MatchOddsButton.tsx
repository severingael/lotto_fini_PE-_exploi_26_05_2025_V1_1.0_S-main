import React from 'react';
import { isBettingClosed } from '../../utils/timeUtils';

interface MatchOddsButtonProps {
  type: '1' | 'X' | '2';
  odds: number;
  label: string;
  matchTime: string;
  selected?: boolean;
  onClick: () => void;
}

export default function MatchOddsButton({ 
  type, 
  odds, 
  label,
  matchTime,
  selected,
  onClick 
}: MatchOddsButtonProps) {
  const closed = isBettingClosed(matchTime);

  return (
    <button
      onClick={onClick}
      disabled={closed}
      className={`
        relative w-full py-3 px-4 rounded-lg transition-all
        ${closed 
          ? 'bg-gray-100 cursor-not-allowed opacity-75' 
          : selected
            ? 'bg-blue-600 text-white'
            : 'bg-gray-50 hover:bg-gray-100'
        }
      `}
    >
      <div className="text-sm mb-1">{type}</div>
      <div className={`text-lg font-bold ${selected ? 'text-white' : 'text-blue-600'}`}>
        {odds.toFixed(2)}
      </div>
      {closed && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg">
          <span className="text-sm text-gray-500 font-medium">Paris fermés</span>
        </div>
      )}
    </button>
  );
}