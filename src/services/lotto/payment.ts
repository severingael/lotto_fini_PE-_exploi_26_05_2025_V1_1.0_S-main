import { doc, updateDoc, getDoc, runTransaction, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PaymentLimitService } from '../admin/paymentLimits';
import { AgentWalletService } from '../agent/wallet';
import type { LottoParticipation } from './types';

const AGENT_COMMISSION_RATE = 0.02; // 2% de commission

export class LottoPaymentService {
  static async processPayment(participationId: string, agentId: string): Promise<void> {
    if (!participationId || !agentId) {
      throw new Error('ID de participation ou ID d\'agent manquant');
    }

    try {
      // Vérifier d'abord le ticket et récupérer le montant
      const participationRef = doc(db, 'lotto_participations', participationId);
      const participationSnap = await getDoc(participationRef);
      
      if (!participationSnap.exists()) {
        throw new Error('Ticket non trouvé');
      }

      const participation = participationSnap.data() as LottoParticipation;
      
      // Vérifications de validité
      if (!participation.isWinner) {
        throw new Error('Ce ticket n\'est pas gagnant');
      }

      if (participation.paid) {
        throw new Error('Ce ticket a déjà été payé');
      }

      if (!participation.winAmount || participation.winAmount <= 0) {
        throw new Error('Montant de gain invalide');
      }

      const paymentAmount = participation.winAmount;
      
      // Vérifier si l'utilisateur est un staff et s'il a le droit de payer
      const userRef = doc(db, 'users', agentId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userSnap.data();
      if (userData.role === 'staffuser' && userData.canProcessPayment === false) {
        throw new Error('Vous n\'avez pas l\'autorisation de payer les gains');
      }
      
      // Vérifier si le montant dépasse la limite de paiement de l'agent
      if (userData.role === 'agentuser') {
        const limit = await PaymentLimitService.getAgentLimit(agentId);
        if (limit && paymentAmount > limit.maxPaymentAmount) {
          throw new Error(`Le montant de ${paymentAmount} dépasse votre limite de paiement autorisée de ${limit.maxPaymentAmount}. Veuillez contacter un administrateur.`);
        }
      }

      // Utiliser une seule transaction atomique pour tout le processus
      await runTransaction(db, async (transaction) => {
        // Récupérer à nouveau le ticket dans la transaction pour s'assurer qu'il n'a pas changé
        const participationDoc = await transaction.get(participationRef);
        
        if (!participationDoc.exists()) {
          throw new Error('Ticket non trouvé');
        }

        const participationData = participationDoc.data() as LottoParticipation;
        
        // Vérifier à nouveau les conditions
        if (!participationData.isWinner) {
          throw new Error('Ce ticket n\'est pas gagnant');
        }

        if (participationData.paid) {
          throw new Error('Ce ticket a déjà été payé');
        }

        const commissionAmount = paymentAmount * AGENT_COMMISSION_RATE;

        // Vérification des portefeuilles de l'agent
        const mainWalletRef = doc(db, 'agent_wallets', agentId);
        const commissionWalletRef = doc(db, 'agent_commission_wallets', agentId);
        
        const [mainWalletSnap, commissionWalletSnap] = await Promise.all([
          transaction.get(mainWalletRef),
          transaction.get(commissionWalletRef)
        ]);
        
        if (!mainWalletSnap.exists() || !commissionWalletSnap.exists()) {
          throw new Error('Portefeuilles agent non trouvés');
        }

        const currentMainBalance = mainWalletSnap.data().balance || 0;
        const currentCommissionBalance = commissionWalletSnap.data().balance || 0;

        if (currentMainBalance < paymentAmount) {
          throw new Error('Solde insuffisant pour payer les gains');
        }

        const now = new Date().toISOString();

        // Créer la transaction de paiement principal
        const paymentTransactionRef = doc(collection(db, 'agent_transactions'));
        transaction.set(paymentTransactionRef, {
          walletId: agentId,
          type: 'credit',
          amount: paymentAmount,
          referenceType: 'payout',
          referenceId: participationId,
          status: 'completed',
          createdAt: now,
          updatedAt: now
        });

        // Créer la transaction de commission
        const commissionTransactionRef = doc(collection(db, 'agent_transactions'));
        transaction.set(commissionTransactionRef, {
          walletId: agentId,
          type: 'commission',
          amount: commissionAmount,
          referenceType: 'payout',
          referenceId: participationId,
          status: 'completed',
          createdAt: now,
          updatedAt: now
        });

        // Mettre à jour les soldes des portefeuilles
        transaction.update(mainWalletRef, {
          balance: currentMainBalance + paymentAmount,
          updatedAt: now
        });

        transaction.update(commissionWalletRef, {
          balance: currentCommissionBalance + commissionAmount,
          updatedAt: now
        });

        // Marquer le ticket comme payé
        transaction.update(participationRef, {
          paid: true,
          paidAt: now,
          paidBy: agentId,
          paymentMethod: 'cash',
          paymentAmount: paymentAmount,
          commissionAmount: commissionAmount,
          paymentTransactionId: paymentTransactionRef.id,
          commissionTransactionId: commissionTransactionRef.id
        });
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Une erreur inattendue est survenue lors du paiement');
    }
  }
}