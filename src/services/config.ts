import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SiteConfig {
  siteName: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  heroBackgroundUrl: string;
  logoUrl: string;
  lastUpdated?: string;
  isActive?: boolean;
}

const DEFAULT_CONFIG: SiteConfig = {
  siteName: 'BetSport',
  welcomeTitle: 'Vivez le Sport Intensément',
  welcomeSubtitle: 'Pariez en direct sur plus de 1000 événements sportifs quotidiens',
  heroBackgroundUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80',
  logoUrl: '/logo.svg',
  isActive: true
};

export class ConfigService {
  private static COLLECTION = 'site_config';

  static async getConfig(): Promise<SiteConfig> {
    try {
      // Récupérer la dernière configuration active
      const configsRef = collection(db, this.COLLECTION);
      const q = query(configsRef, orderBy('lastUpdated', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const config = querySnapshot.docs[0].data() as SiteConfig;
        if (config.isActive) {
          return config;
        }
      }

      // Si aucune configuration active n'existe, créer la configuration par défaut
      const newConfig = await this.saveConfig(DEFAULT_CONFIG);
      return newConfig;
    } catch (error) {
      console.error('Error getting config:', error);
      return DEFAULT_CONFIG;
    }
  }

  static async saveConfig(config: SiteConfig): Promise<SiteConfig> {
    try {
      // Désactiver les configurations précédentes
      const configsRef = collection(db, this.COLLECTION);
      const q = query(configsRef, orderBy('lastUpdated', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      
      const deactivatePromises = querySnapshot.docs.map(doc => 
        setDoc(doc.ref, { isActive: false }, { merge: true })
      );
      await Promise.all(deactivatePromises);

      // Créer une nouvelle configuration active
      const newConfig = {
        ...config,
        lastUpdated: new Date().toISOString(),
        isActive: true
      };

      const newConfigRef = doc(collection(db, this.COLLECTION));
      await setDoc(newConfigRef, newConfig);

      return newConfig;
    } catch (error) {
      console.error('Error saving config:', error);
      throw new Error('Failed to save configuration');
    }
  }

  static async getAllConfigs(): Promise<SiteConfig[]> {
    try {
      const configsRef = collection(db, this.COLLECTION);
      const q = query(configsRef, orderBy('lastUpdated', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SiteConfig[];
    } catch (error) {
      console.error('Error getting all configs:', error);
      return [];
    }
  }
}