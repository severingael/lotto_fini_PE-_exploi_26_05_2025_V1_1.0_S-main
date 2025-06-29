import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Bet } from './types';
import { betSchema } from './schema';

export class BetMutations {
  private static COLLECTION = 'bets';

  static async createBet(bet: Omit<Bet, 'id'>): Promise<string> {
    // Validation
    const error = betSchema.validate(bet);
    if (error) throw new Error(error);

    try {
      // Calcul des gains potentiels
      const potentialWin = bet.type === 'simple' 
        ? bet.stake * bet.odds
        : bet.stake * (bet.totalOdds || 0);

      const betData = {
        ...bet,
        potentialWin,
        date: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), betData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating bet:', error);
      throw new Error('Failed to create bet');
    }
  }

  static async updateBetStatus(
    betId: string, 
    status: 'won' | 'lost',
    actualWin?: number
  ): Promise<void> {
    try {
      const betRef = doc(db, this.COLLECTION, betId);
      await updateDoc(betRef, {
        status,
        ...(actualWin && { actualWin })
      });
    } catch (error) {
      console.error('Error updating bet status:', error);
      throw new Error('Failed to update bet status');
    }
  }
}