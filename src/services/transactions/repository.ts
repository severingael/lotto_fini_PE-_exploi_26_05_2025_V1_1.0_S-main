import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Transaction, TransactionFilters } from './types';

export class TransactionRepository {
  private static COLLECTION = 'transactions';

  static async getTransactions(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(db, this.COLLECTION);
      let q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      // Apply filters if provided
      if (filters) {
        if (filters.type) {
          q = query(q, where('type', '==', filters.type));
        }
        if (filters.status) {
          q = query(q, where('status', '==', filters.status));
        }
        if (filters.startDate) {
          q = query(q, where('createdAt', '>=', filters.startDate));
        }
        if (filters.endDate) {
          q = query(q, where('createdAt', '<=', filters.endDate));
        }
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  static async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...data,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
    }
  }
}