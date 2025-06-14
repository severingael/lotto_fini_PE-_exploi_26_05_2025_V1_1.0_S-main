import { collection, doc, getDoc, getDocs, query, where, runTransaction, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { StaffWallet, StaffCommissionWallet, StaffTransaction } from './types';
import { CreditHistoryService } from '../admin/creditHistory';

export class StaffWalletService {
  private static WALLET_COLLECTION = 'staff_wallets';
  private static COMMISSION_WALLET_COLLECTION = 'staff_commission_wallets';
  private static TRANSACTIONS_COLLECTION = 'staff_transactions';

  static async createWalletIfNotExists(userId: string, email: string): Promise<void> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const now = new Date().toISOString();
      
      // Vérifier et créer le portefeuille principal
      const mainWalletRef = doc(db, this.WALLET_COLLECTION, userId);
      const mainWalletSnap = await getDoc(mainWalletRef);

      if (!mainWalletSnap.exists()) {
        console.log('Creating main wallet for:', userId);
        const mainWalletData: Omit<StaffWallet, 'id'> = {
          userId,
          balance: 0,
          currency: 'XAF',
          createdAt: now,
          updatedAt: now
        };
        await setDoc(mainWalletRef, mainWalletData);
      }

      // Vérifier et créer le portefeuille de commission
      const commissionWalletRef = doc(db, this.COMMISSION_WALLET_COLLECTION, userId);
      const commissionWalletSnap = await getDoc(commissionWalletRef);

      if (!commissionWalletSnap.exists()) {
        console.log('Creating commission wallet for:', userId);
        const commissionWalletData: Omit<StaffCommissionWallet, 'id'> = {
          userId,
          balance: 0,
          currency: 'XAF',
          createdAt: now,
          updatedAt: now
        };
        await setDoc(commissionWalletRef, commissionWalletData);
      }

      console.log('Wallets created successfully for:', userId);
    } catch (error) {
      console.error('Error creating wallets:', error);
      throw new Error('Failed to create staff wallets');
    }
  }

  static async convertCommissionToBalance(staffId: string, amount: number): Promise<void> {
    try {
      if (!staffId || amount <= 0) {
        throw new Error('Paramètres invalides');
      }

      // Vérifier si l'utilisateur a le droit de convertir
      const userRef = doc(db, 'users', staffId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userSnap.data();
      // Si canConvertCommission est explicitement false, bloquer la conversion
      if (userData.canConvertCommission === false) {
        throw new Error('Vous n\'êtes pas autorisé à convertir vos commissions');
      }

      await runTransaction(db, async (transaction) => {
        // Récupérer les deux portefeuilles
        const mainWalletRef = doc(db, this.WALLET_COLLECTION, staffId);
        const commissionWalletRef = doc(db, this.COMMISSION_WALLET_COLLECTION, staffId);

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
          walletId: staffId,
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
          walletId: staffId,
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

  static async getWallet(userId: string): Promise<StaffWallet | null> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('Getting main wallet for:', userId);
      const walletRef = doc(db, this.WALLET_COLLECTION, userId);
      const walletSnap = await getDoc(walletRef);

      if (!walletSnap.exists()) {
        // Créer automatiquement le portefeuille s'il n'existe pas
        await this.createWalletIfNotExists(userId, '');
        const newWalletSnap = await getDoc(walletRef);
        if (!newWalletSnap.exists()) {
          return null;
        }
        return {
          id: newWalletSnap.id,
          ...newWalletSnap.data()
        } as StaffWallet;
      }

      const wallet = {
        id: walletSnap.id,
        ...walletSnap.data()
      } as StaffWallet;

      console.log('Main wallet found:', wallet);
      return wallet;
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw new Error('Failed to get staff wallet');
    }
  }

  static async getCommissionWallet(userId: string): Promise<StaffCommissionWallet | null> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('Getting commission wallet for:', userId);
      const walletRef = doc(db, this.COMMISSION_WALLET_COLLECTION, userId);
      const walletSnap = await getDoc(walletRef);

      if (!walletSnap.exists()) {
        // Créer automatiquement le portefeuille s'il n'existe pas
        await this.createWalletIfNotExists(userId, '');
        const newWalletSnap = await getDoc(walletRef);
        if (!newWalletSnap.exists()) {
          return null;
        }
        return {
          id: newWalletSnap.id,
          ...newWalletSnap.data()
        } as StaffCommissionWallet;
      }

      const wallet = {
        id: walletSnap.id,
        ...walletSnap.data()
      } as StaffCommissionWallet;

      console.log('Commission wallet found:', wallet);
      return wallet;
    } catch (error) {
      console.error('Error getting commission wallet:', error);
      throw new Error('Failed to get staff commission wallet');
    }
  }

  static async getAllStaffWallets(): Promise<StaffWallet[]> {
    try {
      // Récupérer tous les utilisateurs qui sont des staff
      const usersRef = collection(db, 'users');
      const staffQuery = query(usersRef, where('role', '==', 'staffuser'));
      const staffSnapshot = await getDocs(staffQuery);
      
      // Récupérer les portefeuilles pour chaque staff
      const wallets = await Promise.all(
        staffSnapshot.docs.map(async (staffDoc) => {
          const userId = staffDoc.id;
          const walletRef = doc(db, this.WALLET_COLLECTION, userId);
          const walletSnap = await getDoc(walletRef);
          
          if (walletSnap.exists()) {
            return {
              id: walletSnap.id,
              ...walletSnap.data()
            } as StaffWallet;
          }

          // Créer le portefeuille s'il n'existe pas
          await this.createWalletIfNotExists(userId, staffDoc.data().email || '');
          const newWalletSnap = await getDoc(walletRef);
          if (newWalletSnap.exists()) {
            return {
              id: newWalletSnap.id,
              ...newWalletSnap.data()
            } as StaffWallet;
          }
          return null;
        })
      );

      // Filtrer les portefeuilles null et trier
      return wallets
        .filter((wallet): wallet is StaffWallet => wallet !== null)
        .sort((a, b) => (a.userId || '').localeCompare(b.userId || ''));
    } catch (error) {
      console.error('Error getting all staff wallets:', error);
      throw error;
    }
  }

  static async getTransactions(userId: string): Promise<StaffTransaction[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('Getting transactions for:', userId);
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
      })) as StaffTransaction[];

      console.log('Found transactions:', transactions.length);
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
      // Get staff email
      const walletRef = doc(db, this.WALLET_COLLECTION, walletId);
      const walletSnap = await getDoc(walletRef);
      
      if (!walletSnap.exists()) {
        throw new Error('Wallet not found');
      }
      
      // Get user email from users collection
      const userRef = doc(db, 'users', walletId);
      const userSnap = await getDoc(userRef);
      const staffEmail = userSnap.exists() ? userSnap.data().email : '';

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
          recipientEmail: staffEmail,
          recipientType: 'staff',
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
    staffId: string, 
    amount: number, 
    referenceId: string
  ): Promise<void> {
    try {
      if (!staffId || !amount || !referenceId) {
        throw new Error('Missing required parameters');
      }

      await runTransaction(db, async (transaction) => {
        // Récupérer le portefeuille principal
        const mainWalletRef = doc(db, this.WALLET_COLLECTION, staffId);
        const mainWalletDoc = await transaction.get(mainWalletRef);

        if (!mainWalletDoc.exists()) {
          throw new Error('Staff wallet not found');
        }

        // Vérifier le solde du staff
        const currentBalance = mainWalletDoc.data().balance || 0;
        if (currentBalance < amount) {
          throw new Error('Solde insuffisant pour effectuer le paiement');
        }

        // Récupérer le portefeuille de commission
        const commissionWalletRef = doc(db, this.COMMISSION_WALLET_COLLECTION, staffId);
        const commissionWalletDoc = await transaction.get(commissionWalletRef);

        if (!commissionWalletDoc.exists()) {
          throw new Error('Staff commission wallet not found');
        }

        const commissionAmount = amount * 0.01; // 1% de commission
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
          walletId: staffId,
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
          walletId: staffId,
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
          paidBy: staffId,
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
}