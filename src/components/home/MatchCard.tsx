import React from 'react';
import { Calendar } from 'lucide-react';
import { useBetSlip } from '../../contexts/BetSlipContext';
import type { Event } from '../../services/odds/types';

interface MatchCardProps {
  match: Event;
}

export default function MatchCard({ match }: MatchCardProps) {
  const { addBet, hasBet } = useBetSlip();
  const mainMarket = match.bookmakers[0]?.markets[0];
  const homeOdds = mainMarket?.outcomes.find(o => o.name === match.home_team)?.price;
  const awayOdds = mainMarket?.outcomes.find(o => o.name === match.away_team)?.price;
  const drawOdds = mainMarket?.outcomes.find(o => o.name === 'Draw')?.price;

  const handleBetClick = (type: '1' | 'X' | '2', odds: number) => {
    const selection = type === '1' ? match.home_team : type === '2' ? match.away_team : 'Match nul';
    
    addBet({
      id: `${match.id}-${type}`,
      matchId: match.id,
      match: `${match.home_team} vs ${match.away_team}`,
      selection,
      odds,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      type
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-blue-600">{match.sport_title}</span>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {formatDate(match.commence_time)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 text-center">
          <h3 className="font-semibold text-lg">{match.home_team}</h3>
        </div>
        <div className="px-4 text-gray-500">VS</div>
        <div className="flex-1 text-center">
          <h3 className="font-semibold text-lg">{match.away_team}</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {homeOdds && (
          <button
            onClick={() => handleBetClick('1', homeOdds)}
            className={`p-4 rounded-lg transition-colors ${
              hasBet(match.id, '1')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className={`text-sm ${hasBet(match.id, '1') ? 'text-white' : 'text-gray-600'}`}>1</div>
            <div className="text-xl font-bold">{homeOdds.toFixed(2)}</div>
          </button>
        )}
        {drawOdds && (
          <button
            onClick={() => handleBetClick('X', drawOdds)}
            className={`p-4 rounded-lg transition-colors ${
              hasBet(match.id, 'X')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className={`text-sm ${hasBet(match.id, 'X') ? 'text-white' : 'text-gray-600'}`}>X</div>
            <div className="text-xl font-bold">{drawOdds.toFixed(2)}</div>
          </button>
        )}
        {awayOdds && (
          <button
            onClick={() => handleBetClick('2', awayOdds)}
            className={`p-4 rounded-lg transition-colors ${
              hasBet(match.id, '2')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className={`text-sm ${hasBet(match.id, '2') ? 'text-white' : 'text-gray-600'}`}>2</div>
            <div className="text-xl font-bold">{awayOdds.toFixed(2)}</div>
          </button>
        )}
      </div>
    </div>
  );
}