import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BettingWalletService } from '../services/betting/wallet';
import { BetRepository } from '../services/betting/repository';
import type { Bet } from '../services/betting/types';

export function useBetPlacement() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeBet = async (bet: Omit<Bet, 'id' | 'userId' | 'date' | 'status'>) => {
    if (!currentUser) {
      throw new Error('Vous devez être connecté pour placer un pari');
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Vérifier le solde et placer le pari
      const success = await BettingWalletService.placeBet(
        currentUser.uid,
        bet.stake,
        bet.type === 'simple' ? bet.odds : (bet.totalOdds || 0)
      );

      if (success) {
        // Créer l'enregistrement du pari
        await BetRepository.createBet({
          ...bet,
          userId: currentUser.uid,
          date: new Date().toISOString(),
          status: 'pending'
        });
      }

      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du placement du pari';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    placeBet,
    isSubmitting,
    error,
    setError
  };
}