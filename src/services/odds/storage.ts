import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../lib/firebase';
import { DEFAULT_SPORTS } from './constants';
import type { OddsConfig, SportConfig } from './types';

export class OddsStorage {
  private static COLLECTION = 'odds_config';
  private static CONFIG_DOC_ID = 'current_config';

  static async getActiveConfiguration(): Promise<OddsConfig> {
    try {
      console.log('Getting active configuration from Firestore...');
      
      // Toujours retourner une configuration valide, même en cas d'erreur
      const defaultConfig = {
        apiKey: '',
        sports: DEFAULT_SPORTS,
        isActive: false,
        lastUpdated: new Date().toISOString()
      };

      // Essayer de récupérer la configuration depuis Firestore
      try {
        const configRef = doc(db, this.COLLECTION, this.CONFIG_DOC_ID);
        const configDoc = await getDoc(configRef);
        
        if (configDoc.exists()) {
          const config = configDoc.data() as OddsConfig;
          console.log('Found configuration in Firestore:', config);
          
          // Fusionner avec les sports par défaut
          const mergedSports: Record<string, SportConfig> = {};
          
          // Commencer par les sports par défaut
          Object.entries(DEFAULT_SPORTS).forEach(([key, defaultConfig]) => {
            mergedSports[key] = {
              ...defaultConfig,
              ...(config.sports?.[key] || {})
            };
          });

          return {
            apiKey: config.apiKey || '',
            sports: mergedSports,
            isActive: Boolean(config.apiKey),
            lastUpdated: config.lastUpdated || new Date().toISOString()
          };
        }
      } catch (error) {
        console.warn('Error reading from Firestore, using default config:', error);
      }

      return defaultConfig;
    } catch (error) {
      console.error('Error in getActiveConfiguration:', error);
      // Toujours retourner une configuration valide
      return {
        apiKey: '',
        sports: DEFAULT_SPORTS,
        isActive: false,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  static async saveToFirebase(config: OddsConfig): Promise<void> {
    try {
      console.log('Saving configuration to Firestore...', config);
      
      // Vérifier l'authentification
      const auth = getAuth();
      if (!auth.currentUser) {
        console.warn('User not authenticated, skipping save');
        return;
      }

      // Vérifier le rôle admin
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'adminuser') {
          console.warn('User is not admin, skipping save');
          return;
        }
      } catch (error) {
        console.warn('Error checking user role, skipping save:', error);
        return;
      }

      // Valider et nettoyer les données
      const sanitizedSports: Record<string, SportConfig> = {};
      
      Object.entries(config.sports || {}).forEach(([key, value]) => {
        if (DEFAULT_SPORTS[key]) { // Ne sauvegarder que les sports par défaut
          sanitizedSports[key] = {
            enabled: Boolean(value.enabled),
            refreshInterval: Math.max(1, Math.min(3600, Number(value.refreshInterval) || 30))
          };
        }
      });

      const sanitizedConfig = {
        apiKey: config.apiKey || '',
        sports: sanitizedSports,
        isActive: Boolean(config.isActive),
        lastUpdated: new Date().toISOString()
      };

      const configRef = doc(db, this.COLLECTION, this.CONFIG_DOC_ID);
      await setDoc(configRef, sanitizedConfig);
      console.log('Configuration saved successfully to Firestore');

    } catch (error) {
      console.error('Error saving configuration to Firestore:', error);
      // Ne pas propager l'erreur pour éviter les interruptions
    }
  }
}