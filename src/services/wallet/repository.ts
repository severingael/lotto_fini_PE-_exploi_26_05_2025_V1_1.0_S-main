import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Wallet, Transaction, WalletBalance } from './types';

export class WalletRepository {
  private static WALLETS_COLLECTION = 'wallets';
  private static TRANSACTIONS_COLLECTION = 'transactions';

  static async getWallet(userId: string): Promise<Wallet | null> {
    try {
      const walletsRef = collection(db, this.WALLETS_COLLECTION);
      const q = query(walletsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Wallet;
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw error;
    }
  }

  static async getBalance(userId: string): Promise<WalletBalance | null> {
    try {
      const wallet = await this.getWallet(userId);
      if (!wallet) return null;
      return {
        balance: wallet.balance,
        currency: wallet.currency
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  static async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(db, this.TRANSACTIONS_COLLECTION);
      const q = query(
        transactionsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  static async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, this.TRANSACTIONS_COLLECTION), {
        ...transaction,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
}