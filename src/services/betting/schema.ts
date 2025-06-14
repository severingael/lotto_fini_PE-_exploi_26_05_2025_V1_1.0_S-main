import { Bet } from './types';

// Schéma de validation pour les paris
export const betSchema = {
  required: [
    'userId',
    'match',
    'selection',
    'odds',
    'stake',
    'status',
    'date',
    'type'
  ],
  
  validate: (bet: Partial<Bet>): string | null => {
    if (!bet.userId) return 'UserId is required';
    if (!bet.match && bet.type === 'simple') return 'Match is required';
    if (!bet.selection && bet.type === 'simple') return 'Selection is required';
    if (!bet.odds && bet.type === 'simple') return 'Odds are required';
    if (!bet.stake || bet.stake <= 0) return 'Valid stake is required';
    if (!bet.date) return 'Date is required';
    if (!bet.type) return 'Type is required';
    
    if (bet.type === 'combine') {
      if (!bet.matches?.length) return 'Combined bet requires matches';
      if (!bet.totalOdds) return 'Combined bet requires total odds';
    }
    
    return null;
  }
};