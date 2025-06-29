import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LottoEvent } from './types';
import { LottoService } from '.';

export class LottoRecurrenceService {
  private static COLLECTION_NAME = 'lottos';

  /**
   * Vérifie et crée les lottos récurrents basés sur la fréquence configurée
   */
  static async checkAndCreateRecurringLottos(): Promise<void> {
    try {
      console.log('Vérification des lottos récurrents...');
      const now = new Date();
      
      // Récupérer tous les lottos terminés avec une fréquence
      const lottosRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        lottosRef,
        where('status', '==', 'completed'),
        where('frequency', 'in', ['daily', 'weekly', 'yearly'])
      );
      
      const querySnapshot = await getDocs(q);
      const lottos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LottoEvent[];
      
      console.log(`Trouvé ${lottos.length} lottos récurrents terminés`);
      
      // Pour chaque lotto récurrent terminé, vérifier s'il faut créer un nouveau lotto
      for (const lotto of lottos) {
        await this.processRecurringLotto(lotto);
      }
      
      console.log('Vérification des lottos récurrents terminée');
    } catch (error) {
      console.error('Erreur lors de la vérification des lottos récurrents:', error);
    }
  }
  
  /**
   * Traite un lotto récurrent et crée le prochain si nécessaire
   */
  private static async processRecurringLotto(lotto: LottoEvent): Promise<void> {
    try {
      const now = new Date();
      const endDate = new Date(lotto.endDate);
      
      // Vérifier si le lotto est terminé et si un nouveau lotto doit être créé
      if (now > endDate) {
        // Vérifier si un lotto récurrent a déjà été créé
        const nextLottoExists = await this.checkIfNextLottoExists(lotto);
        
        if (!nextLottoExists) {
          console.log(`Création d'un nouveau lotto récurrent pour ${lotto.eventName}`);
          await this.createNextRecurringLotto(lotto);
        }
      }
    } catch (error) {
      console.error(`Erreur lors du traitement du lotto récurrent ${lotto.id}:`, error);
    }
  }
  
  /**
   * Vérifie si un lotto récurrent a déjà été créé
   */
  private static async checkIfNextLottoExists(lotto: LottoEvent): Promise<boolean> {
    try {
      // Calculer les dates du prochain lotto
      const { nextStartDate, nextEndDate } = this.calculateNextDates(lotto);
      
      // Vérifier si un lotto avec le même nom et les mêmes dates existe déjà
      const lottosRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        lottosRef,
        where('eventName', '==', lotto.eventName),
        where('startDate', '==', nextStartDate.toISOString()),
        where('endDate', '==', nextEndDate.toISOString())
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'existence du prochain lotto pour ${lotto.id}:`, error);
      return true; // En cas d'erreur, supposer que le lotto existe déjà pour éviter les doublons
    }
  }
  
  /**
   * Crée le prochain lotto récurrent
   */
  private static async createNextRecurringLotto(lotto: LottoEvent): Promise<string> {
    try {
      // Calculer les dates du prochain lotto
      const { nextStartDate, nextEndDate } = this.calculateNextDates(lotto);
      
      // Créer le nouveau lotto
      const newLottoData: Omit<LottoEvent, 'id' | 'createdAt' | 'status'> = {
        eventName: lotto.eventName,
        startDate: nextStartDate.toISOString(),
        endDate: nextEndDate.toISOString(),
        ticketPrice: lotto.ticketPrice,
        currency: lotto.currency,
        frequency: lotto.frequency,
        numbersToSelect: lotto.numbersToSelect,
        gridsPerTicket: lotto.gridsPerTicket,
        isEnabled: lotto.isEnabled
      };
      
      const newLottoId = await LottoService.createLotto(newLottoData);
      console.log(`Nouveau lotto récurrent créé avec l'ID ${newLottoId}`);
      return newLottoId;
    } catch (error) {
      console.error(`Erreur lors de la création du prochain lotto récurrent pour ${lotto.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Calcule les dates du prochain lotto en fonction de la fréquence
   */
  private static calculateNextDates(lotto: LottoEvent): { nextStartDate: Date, nextEndDate: Date } {
    const startDate = new Date(lotto.startDate);
    const endDate = new Date(lotto.endDate);
    const duration = endDate.getTime() - startDate.getTime(); // Durée en millisecondes
    
    let nextStartDate: Date;
    let nextEndDate: Date;
    
    switch (lotto.frequency) {
      case 'daily':
        // Pour les lottos quotidiens, ajouter 24 heures
        nextStartDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        nextEndDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
        break;
        
      case 'weekly':
        // Pour les lottos hebdomadaires, ajouter 7 jours
        nextStartDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        nextEndDate = new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
        
      case 'yearly':
        // Pour les lottos annuels, ajouter 1 an
        nextStartDate = new Date(startDate);
        nextStartDate.setFullYear(nextStartDate.getFullYear() + 1);
        
        nextEndDate = new Date(endDate);
        nextEndDate.setFullYear(nextEndDate.getFullYear() + 1);
        break;
        
      default:
        // Par défaut, ne pas modifier les dates
        nextStartDate = new Date(startDate);
        nextEndDate = new Date(endDate);
    }
    
    return { nextStartDate, nextEndDate };
  }
}