import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { AgentTransaction } from './types';

export class AgentTransactionService {
  private static COLLECTION = 'agent_transactions';

  static async getTransactions(walletId: string): Promise<AgentTransaction[]> {
    try {
      const transactionsRef = collection(db, this.COLLECTION);
      const q = query(
        transactionsRef,
        where('walletId', '==', walletId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgentTransaction[];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }
}