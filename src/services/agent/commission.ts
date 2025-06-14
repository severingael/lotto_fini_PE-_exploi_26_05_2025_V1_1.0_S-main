import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { AgentCommission } from './types';

export class AgentCommissionService {
  private static COLLECTION = 'agent_commissions';

  static async getCommissions(): Promise<AgentCommission[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgentCommission[];
    } catch (error) {
      console.error('Error getting commissions:', error);
      throw error instanceof Error ? error : new Error('Failed to get commissions');
    }
  }

  static async setCommission(betType: string, percentage: number): Promise<void> {
    try {
      if (percentage < 0 || percentage > 100) {
        throw new Error('Percentage must be between 0 and 100');
      }

      const commission: Omit<AgentCommission, 'id'> = {
        betType,
        percentage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = doc(collection(db, this.COLLECTION), betType);
      await setDoc(docRef, commission);
    } catch (error) {
      console.error('Error setting commission:', error);
      throw error instanceof Error ? error : new Error('Failed to set commission');
    }
  }
}