import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AgentWalletService } from '../services/agent/wallet';
import { StaffWalletService } from '../services/staff/wallet';
import { PaymentLimitService } from '../services/admin/paymentLimits';
import type { LottoParticipation } from '../services/lotto/types';

export function useLottoPayment() {
  const { currentUser, userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (participation: LottoParticipation): Promise<boolean> => {
    if (!currentUser) {
      setError('Utilisateur non connecté');
      return false;
    }

    if (!participation.id) {
      setError('ID de participation invalide');
      return false;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Vérifications supplémentaires
      if (!participation.isWinner) {
        setError('Ce ticket n\'est pas gagnant');
        return false;
      }

      if (participation.paid) {
        setError('Ce ticket a déjà été payé');
        return false;
      }

      if (!participation.winAmount || participation.winAmount <= 0) {
        setError('Montant de gain invalide');
        return false;
      }

      // Vérifier si le montant dépasse la limite de paiement (uniquement pour les agents)
      if (userData?.role === 'agentuser') {
        const limit = await PaymentLimitService.getAgentLimit(currentUser.uid);
        if (!limit || participation.winAmount > limit.maxPaymentAmount) {
          const errorMsg = `Le montant de ${participation.winAmount} dépasse votre limite de paiement autorisée de ${limit?.maxPaymentAmount || 0}. Veuillez contacter un administrateur.`;
          setError(errorMsg);
          return false;
        }
      }

      // Utiliser le service approprié selon le rôle
      if (userData?.role === 'agentuser') {
        // Vérifier le solde de l'agent
        const wallet = await AgentWalletService.getWallet(currentUser.uid);
        if (!wallet) {
          setError('Portefeuille non trouvé');
          return false;
        }

        if (wallet.balance < participation.winAmount) {
          setError('Solde insuffisant pour payer les gains');
          return false;
        }

        // Traiter le paiement via le service agent
        await AgentWalletService.processPayment(
          currentUser.uid,
          participation.winAmount,
          participation.id
        );
      } else if (userData?.role === 'staffuser') {
        // Traiter le paiement via le service staff
        await StaffWalletService.processPayment(
          currentUser.uid,
          participation.winAmount,
          participation.id
        );
      } else {
        setError('Rôle non autorisé pour le paiement');
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Une erreur inattendue est survenue lors du paiement';
      console.error('Error processing payment:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    processPayment,
    isSubmitting,
    error,
    setError
  };
}