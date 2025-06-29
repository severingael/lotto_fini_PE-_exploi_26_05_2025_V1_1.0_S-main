import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Bet } from './types';

export class BetsService {
  private static COLLECTION = 'bets';

  static async getUserBets(userId: string): Promise<Bet[]> {
    try {
      const betsRef = collection(db, this.COLLECTION);
      const q = query(
        betsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bet[];
    } catch (error) {
      console.error('Error fetching user bets:', error);
      throw new Error('Failed to fetch bets');
    }
  }
}