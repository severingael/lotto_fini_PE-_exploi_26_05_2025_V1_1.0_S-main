import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface WalletCreditEntry {
  id: string;
  userId: string;
  userEmail?: string;
  type: 'credit' | 'debit' | 'commission';
  amount: number;
  referenceType: 'bet' | 'payout' | 'admin_credit';
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  updatedAt: string;
}

interface HistoryFilters {
  startDate?: string;
  endDate?: string;
}

export class WalletHistoryService {
  private static COLLECTION = 'wallet_credit_history';

  static async getHistory(filters?: HistoryFilters): Promise<WalletCreditEntry[]> {
    try {
      const historyRef = collection(db, this.COLLECTION);
      let q = query(historyRef, orderBy('createdAt', 'desc'));

      // Apply date filters if provided
      if (filters?.startDate) {
        q = query(q, where('createdAt', '>=', filters.startDate));
      }
      if (filters?.endDate) {
        q = query(q, where('createdAt', '<=', filters.endDate));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WalletCreditEntry[];
    } catch (error) {
      console.error('Error getting wallet history:', error);
      throw error instanceof Error ? error : new Error('Failed to get wallet history');
    }
  }
}