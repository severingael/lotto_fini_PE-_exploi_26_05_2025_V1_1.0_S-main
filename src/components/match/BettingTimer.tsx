import React from 'react';
import { Clock } from 'lucide-react';
import { getTimeUntilMatch, isBettingClosed, BETTING_CUTOFF_MINUTES } from '../../utils/timeUtils';

interface BettingTimerProps {
  matchTime: string;
}

export default function BettingTimer({ matchTime }: BettingTimerProps) {
  const timeUntil = getTimeUntilMatch(matchTime);
  const closed = isBettingClosed(matchTime);

  if (closed) {
    return (
      <div className="flex items-center gap-1 text-red-500 text-sm font-medium">
        <Clock className="w-4 h-4" />
        <span>Paris fermés</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-gray-600 text-sm">
      <Clock className="w-4 h-4" />
      <span>
        {timeUntil} avant fermeture
        <span className="text-xs text-gray-500 ml-1">
          (min. {BETTING_CUTOFF_MINUTES}min)
        </span>
      </span>
    </div>
  );
}