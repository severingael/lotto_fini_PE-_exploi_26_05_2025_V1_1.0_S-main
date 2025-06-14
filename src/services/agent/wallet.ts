import { collection, doc, getDoc, getDocs, query, where, runTransaction, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { AgentWallet, AgentCommissionWallet, AgentTransaction } from './types';
import { CommissionService } from '../admin/commission';
import { PaymentLimitService } from '../admin/paymentLimits';
import { CreditHistoryService } from '../admin/creditHistory';

export class AgentWalletService {
  private static WALLET_COLLECTION = 'agent_wallets';
  private static COMMISSION_WALLET_COLLECTION = 'agent_commission_wallets';
  private static TRANSACTIONS_COLLECTION = 'agent_transactions';

  static async getAllAgentWallets(): Promise<AgentWallet[]> {
    try {
      console.log('Récupération de tous les portefeuilles agents');
      const walletsRef = collection(db, this.WALLET_COLLECTION);
      const snapshot = await getDocs(walletsRef);
      
      const wallets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgentWallet[];

      console.log('Portefeuilles trouvés:', wallets.length);
      return wallets;
    } catch (error) {
      console.error('Error getting all wallets:', error);
      throw error instanceof Error ? error : new Error('Failed to get all wallets');
    }
  }

  static async createWalletIfNotExists(userId: string, email: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Créer le portefeuille principal s'il n'existe pas
      const mainWalletRef = doc(db, this.WALLET_COLLECTION, userId);
      const mainWalletSnap = await getDoc(mainWalletRef);

      if (!mainWalletSnap.exists()) {
        console.log('Création du portefeuille principal pour:', userId);
        const mainWalletData: AgentWallet = {
          id: userId,
          userId,
          userEmail: email,
          balance: 0,
          currency: 'XAF',
          unitValue: 1,
          createdAt: now,
          updatedAt: now
        };
        await setDoc(mainWalletRef, mainWalletData);
      }

      // Créer le portefeuille de commission s'il n'existe pas
      const commissionWalletRef = doc(db, this.COMMISSION_WALLET_COLLECTION, userId);
      const commissionWalletSnap = await getDoc(commissionWalletRef);

      if (!commissionWalletSnap.exists()) {
        console.log('Création du portefeuille de commission pour:', userId);
        const commissionWalletData: AgentCommissionWallet = {
          id: userId,
          userId,
          userEmail: email,
          balance: 0,
          currency: 'XAF',
          createdAt: now,
          updatedAt: now
        };
        await setDoc(commissionWalletRef, commissionWalletData);
      }
    } catch (error) {
      console.error('Error creating wallets:', error);
      throw error;
    }
  }

  static async getWallet(userId: string): Promise<AgentWallet | null> {
    try {
      console.log('Récupération du portefeuille principal pour:', userId);
      const walletRef = doc(db, this.WALLET_COLLECTION, userId);
      const walletSnap = await getDoc(walletRef);

      if (!walletSnap.exists()) {
        console.log('Portefeuille principal non trouvé');
        return null;
      }

      const wallet = {
        id: walletSnap.id,
        ...walletSnap.data()
      } as AgentWallet;
      console.log('Portefeuille principal trouvé:', wallet);
      return wallet;
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw error;
    }
  }

  static async getCommissionWallet(userId: string): Promise<AgentCommissionWallet | null> {
    try {
      console.log('Récupération du portefeuille de commission pour:', userId);
      const walletRef = doc(db, this.COMMISSION_WALLET_COLLECTION, userId);
      const walletSnap = await getDoc(walletRef);

      if (!walletSnap.exists()) {
        console.log('Portefeuille de commission non trouvé');
        return null;
      }

      const wallet = {
        id: walletSnap.id,
        ...walletSnap.data()
      } as AgentCommissionWallet;
      console.log('Portefeuille de commission trouvé:', wallet);
      return wallet;
    } catch (error) {
      console.error('Error getting commission wallet:', error);
      throw error;
    }
  }

  static async deductAmount(walletId: string, amount: number, referenceId?: string): Promise<void> {
    try {
      // Récupérer le taux de commission pour les paris
      const commissionRate = await CommissionService.getCommissionRate('simple');
      const commissionAmount = amount * commissionRate;

      // Create document references outside the transaction
      const mainWalletRef = doc(db, this.WALLET_COLLECTION, walletId);
      const commissionWalletRef = doc(db, this.COMMISSION_WALLET_COLLECTION, walletId);
      const debitTransactionRef = doc(collection(db, this.TRANSACTIONS_COLLECTION));
      const commissionTransactionRef = doc(collection(db, this.TRANSACTIONS_COLLECTION));

      await runTransaction(db, async (transaction) => {
        // Get current wallet states
        const mainWalletDoc = await transaction.get(mainWalletRef);
        const commissionWalletDoc = await transaction.get(commissionWalletRef);

        if (!mainWalletDoc.exists()) {
          throw new Error('Wallet not found');
        }

        if (!commissionWalletDoc.exists()) {
          throw new Error('Commission wallet not found');
        }

        const currentBalance = mainWalletDoc.data().balance || 0;
        if (currentBalance < amount) {
          throw new Error('Solde insuffisant');
        }

        const currentCommissionBalance = commissionWalletDoc.data().balance || 0;

        console.log('Déduction:', {
          amount,
          commissionAmount,
          currentBalance,
          currentCommissionBalance
        });

        // Update main wallet balance
        transaction.update(mainWalletRef, {
          balance: currentBalance - amount,
          updatedAt: new Date().toISOString()
        });

        // Update commission wallet balance
        transaction.update(commissionWalletRef, {
          balance: currentCommissionBalance + commissionAmount,
          updatedAt: new Date().toISOString()
        });

        // Base transaction data
        const now = new Date().toISOString();
        const baseTransactionData = {
          walletId,
          status: 'completed',
          currency: 'XAF',
          createdAt: now,
          updatedAt: now
        };

        // Create debit transaction
        const debitTransaction = {
          ...baseTransactionData,
          type: 'debit',
          amount,
          referenceType: 'bet',
          ...(referenceId && { referenceId }) // Only include if referenceId exists
        };
        transaction.set(debitTransactionRef, debitTransaction);

        // Create commission transaction
        const commissionTransaction = {
          ...baseTransactionData,
          type: 'commission',
          amount: commissionAmount,
          referenceType: 'bet',
          ...(referenceId && { referenceId }) // Only include if referenceId exists
        };
        transaction.set(commissionTransactionRef, commissionTransaction);

        console.log('Transactions créées:', {
          debit: debitTransactionRef.id,
          commission: commissionTransactionRef.id,
          debitData: debitTransaction,
          commissionData: commissionTransaction
        });
      });
    } catch (error) {
      console.error('Error deducting amount:', error);
      throw error instanceof Error ? error : new Error('Failed to deduct amount');
    }
  }

  static async getTransactions(userId: string): Promise<AgentTransaction[]> {
    try {
      console.log('Récupération des transactions pour:', userId);
      const transactionsRef = collection(db, this.TRANSACTIONS_COLLECTION);
      const q = query(
        transactionsRef,
        where('walletId', '==', userId),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgentTransaction[];

      console.log('Transactions trouvées:', transactions.length);
      return transactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  static async creditWallet(walletId: string, amount: number, adminId?: string, adminEmail?: string): Promise<void> {
    try {
      // Get agent email
      const walletRef = doc(db, this.WALLET_COLLECTION, walletId);
      const walletSnap = await getDoc(walletRef);
      
      if (!walletSnap.exists()) {
        throw new Error('Wallet not found');
      }
      
      const agentEmail = walletSnap.data().userEmail || '';

      await runTransaction(db, async (transaction) => {
        // Récupérer le portefeuille principal
        const mainWalletDoc = await transaction.get(walletRef);

        if (!mainWalletDoc.exists()) {
          throw new Error('Wallet not found');
        }

        const currentBalance = mainWalletDoc.data().balance || 0;
        
        // Update wallet balance
        transaction.update(walletRef, {
          balance: currentBalance + amount,
          updatedAt: new Date().toISOString()
        });

        // Create transaction record
        const transactionRef = doc(collection(db, this.TRANSACTIONS_COLLECTION));
        transaction.set(transactionRef, {
          walletId,
          type: 'credit',
          amount,
          currency: 'XAF',
          referenceType: 'admin_credit',
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });

      // Add to credit history if admin info is provided
      if (adminId) {
        await CreditHistoryService.addCreditHistory({
          adminId,
          adminEmail,
          recipientId: walletId,
          recipientEmail: agentEmail,
          recipientType: 'agent',
          amount,
          currency: 'XAF'
        });
      }
    } catch (error) {
      console.error('Error crediting wallet:', error);
      throw error;
    }
  }

  static async processPayment(
    agentId: string,
    amount: number,
    referenceId: string
  ): Promise<void> {
    try {
      if (!agentId || !amount || !referenceId) {
        throw new Error('Missing required parameters');
      }

      // Vérifier si le montant dépasse la limite de paiement de l'agent
      const canPay = await PaymentLimitService.checkPaymentLimit(agentId, amount);
      if (!canPay) {
        const limit = await PaymentLimitService.getAgentLimit(agentId);
        throw new Error(`Le montant de ${amount} dépasse votre limite de paiement autorisée de ${limit?.maxPaymentAmount || 0}. Veuillez contacter un administrateur.`);
      }

      // Récupérer le taux de commission pour les paiements
      const commissionRate = await CommissionService.getCommissionRate('lotto_payment');
      const commissionAmount = amount * commissionRate;

      await runTransaction(db, async (transaction) => {
        // Récupérer le portefeuille principal
        const mainWalletRef = doc(db, this.WALLET_COLLECTION, agentId);
        const mainWalletDoc = await transaction.get(mainWalletRef);

        if (!mainWalletDoc.exists()) {
          throw new Error('Agent wallet not found');
        }

        // Vérifier le solde de l'agent
        const currentBalance = mainWalletDoc.data().balance || 0;
        if (currentBalance < amount) {
          throw new Error('Solde insuffisant pour effectuer le paiement');
        }

        // Récupérer le portefeuille de commission
        const commissionWalletRef = doc(db, this.COMMISSION_WALLET_COLLECTION, agentId);
        const commissionWalletDoc = await transaction.get(commissionWalletRef);

        if (!commissionWalletDoc.exists()) {
          throw new Error('Agent commission wallet not found');
        }

        const currentCommissionBalance = commissionWalletDoc.data().balance || 0;

        // Créditer le montant du gain
        transaction.update(mainWalletRef, {
          balance: currentBalance + amount,
          updatedAt: new Date().toISOString()
        });

        // Créditer la commission
        transaction.update(commissionWalletRef, {
          balance: currentCommissionBalance + commissionAmount,
          updatedAt: new Date().toISOString()
        });

        // Créer la transaction de crédit
        const creditTransactionRef = doc(collection(db, this.TRANSACTIONS_COLLECTION));
        transaction.set(creditTransactionRef, {
          walletId: agentId,
          type: 'credit',
          amount,
          referenceType: 'payout',
          referenceId,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Créer la transaction de commission
        const commissionTransactionRef = doc(collection(db, this.TRANSACTIONS_COLLECTION));
        transaction.set(commissionTransactionRef, {
          walletId: agentId,
          type: 'commission',
          amount: commissionAmount,
          referenceType: 'payout',
          referenceId,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Mettre à jour le statut de la participation
        const participationRef = doc(db, 'lotto_participations', referenceId);
        transaction.update(participationRef, {
          paid: true,
          paidAt: new Date().toISOString(),
          paidBy: agentId,
          paymentMethod: 'cash',
          paymentAmount: amount,
          commissionAmount: commissionAmount,
          status: 'completed'
        });
      });

      console.log('Payment processed successfully');
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error instanceof Error ? error : new Error('Failed to process payment');
    }
  }

  static async convertCommissionToBalance(agentId: string, amount: number): Promise<void> {
    try {
      if (!agentId || amount <= 0) {
        throw new Error('Paramètres invalides');
      }

      await runTransaction(db, async (transaction) => {
        // Récupérer les deux portefeuilles
        const mainWalletRef = doc(db, this.WALLET_COLLECTION, agentId);
        const commissionWalletRef = doc(db, this.COMMISSION_WALLET_COLLECTION, agentId);

        const [mainWalletDoc, commissionWalletDoc] = await Promise.all([
          transaction.get(mainWalletRef),
          transaction.get(commissionWalletRef)
        ]);

        if (!mainWalletDoc.exists() || !commissionWalletDoc.exists()) {
          throw new Error('Portefeuilles non trouvés');
        }

        const commissionBalance = commissionWalletDoc.data().balance || 0;
        const mainBalance = mainWalletDoc.data().balance || 0;

        // Vérifier le solde de commission
        if (commissionBalance < amount) {
          throw new Error('Solde de commission insuffisant');
        }

        const now = new Date().toISOString();

        // Créer la transaction de débit de commission
        const debitTransactionRef = doc(collection(db, this.TRANSACTIONS_COLLECTION));
        const debitTransaction = {
          walletId: agentId,
          type: 'debit',
          amount,
          referenceType: 'commission_conversion',
          status: 'completed',
          createdAt: now,
          updatedAt: now
        };
        transaction.set(debitTransactionRef, debitTransaction);

        // Créer la transaction de crédit du solde principal
        const creditTransactionRef = doc(collection(db, this.TRANSACTIONS_COLLECTION));
        const creditTransaction = {
          walletId: agentId,
          type: 'credit',
          amount,
          referenceType: 'commission_conversion',
          status: 'completed',
          createdAt: now,
          updatedAt: now
        };
        transaction.set(creditTransactionRef, creditTransaction);

        // Mettre à jour les soldes
        transaction.update(commissionWalletRef, {
          balance: commissionBalance - amount,
          updatedAt: now
        });

        transaction.update(mainWalletRef, {
          balance: mainBalance + amount,
          updatedAt: now
        });
      });

      console.log('Commission successfully converted to balance');
    } catch (error) {
      console.error('Error converting commission:', error);
      throw error instanceof Error ? error : new Error('Erreur lors de la conversion');
    }
  }
}