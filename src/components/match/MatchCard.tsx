import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBetSlip } from '../../contexts/BetSlipContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Event } from '../../services/odds/types';
import BettingTimer from './BettingTimer';
import MatchOddsButton from './MatchOddsButton';
import { isBettingClosed } from '../../utils/timeUtils';
import AuthMobileModal from '../auth/AuthMobileModal';
import AuthDesktopModal from '../auth/AuthDesktopModal';

interface MatchCardProps {
  match: Event;
}

export default function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addBet, hasBet } = useBetSlip();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  
  // Log match data for debugging
  console.log('Match data:', {
    id: match.id,
    teams: `${match.home_team} vs ${match.away_team}`,
    time: match.commence_time,
    markets: match.bookmakers?.[0]?.markets
  });

  const mainMarket = match.bookmakers[0]?.markets[0];
  const homeOdds = mainMarket?.outcomes.find(o => o.name === match.home_team)?.price;
  const awayOdds = mainMarket?.outcomes.find(o => o.name === match.away_team)?.price;
  const drawOdds = mainMarket?.outcomes.find(o => o.name === 'Draw')?.price;

  const handleBetClick = (type: '1' | 'X' | '2', odds: number) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (isBettingClosed(match.commence_time) || !odds) {
      return;
    }

    const selection = type === '1' ? match.home_team : type === '2' ? match.away_team : 'Match nul';
    
    try {
      addBet({
        id: `${match.id}-${type}`,
        matchId: match.id,
        match: `${match.home_team} vs ${match.away_team}`,
        selection,
        odds,
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        type,
        matchTime: match.commence_time
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Vous devez être connecté pour placer un pari') {
        setShowAuthModal(true);
      } else {
        console.error('Error adding bet:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-medium text-blue-600">{match.sport_title}</span>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-gray-600">
            {new Date(match.commence_time).toLocaleString('fr-FR', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <BettingTimer matchTime={match.commence_time} />
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
          <MatchOddsButton
            type="1"
            odds={homeOdds}
            label={match.home_team}
            matchTime={match.commence_time}
            selected={hasBet(match.id, '1')}
            onClick={() => handleBetClick('1', homeOdds)}
          />
        )}
        {drawOdds && (
          <MatchOddsButton
            type="X"
            odds={drawOdds}
            label="Match nul"
            matchTime={match.commence_time}
            selected={hasBet(match.id, 'X')}
            onClick={() => handleBetClick('X', drawOdds)}
          />
        )}
        {awayOdds && (
          <MatchOddsButton
            type="2"
            odds={awayOdds}
            label={match.away_team}
            matchTime={match.commence_time}
            selected={hasBet(match.id, '2')}
            onClick={() => handleBetClick('2', awayOdds)}
          />
        )}
      </div>

      <AuthMobileModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Connectez-vous pour placer vos paris"
      />
      <AuthDesktopModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Connectez-vous pour placer vos paris"
      />
    </div>
  );
}