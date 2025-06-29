import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Bet } from './types';

export class BetQueries {
  private static COLLECTION = 'bets';

  static async getActiveBets(userId: string): Promise<Bet[]> {
    return this.getBetsByStatus(userId, 'pending');
  }

  static async getWonBets(userId: string): Promise<Bet[]> {
    return this.getBetsByStatus(userId, 'won');
  }

  static async getLostBets(userId: string): Promise<Bet[]> {
    return this.getBetsByStatus(userId, 'lost');
  }

  private static async getBetsByStatus(userId: string, status: Bet['status']): Promise<Bet[]> {
    try {
      const betsRef = collection(db, this.COLLECTION);
      const q = query(
        betsRef,
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('date', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bet[];
    } catch (error) {
      console.error(`Error fetching ${status} bets:`, error);
      throw new Error(`Failed to fetch ${status} bets`);
    }
  }

  static async getRecentBets(userId: string, limit = 10): Promise<Bet[]> {
    try {
      const betsRef = collection(db, this.COLLECTION);
      const q = query(
        betsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bet[];
    } catch (error) {
      console.error('Error fetching recent bets:', error);
      throw new Error('Failed to fetch recent bets');
    }
  }
}