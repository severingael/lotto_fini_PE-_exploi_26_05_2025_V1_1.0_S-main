import axios from 'axios';
import { BASE_URL, DEFAULT_SPORTS } from './constants';
import { OddsStorage } from './storage';
import { OddsApiError, ERROR_MESSAGES } from './errors';
import type { Sport, Event, OddsConfig, SportConfig } from './types';

export class OddsApi {
  private config: OddsConfig;
  private isInitialized: boolean;
  private cache: Map<string, { data: any; timestamp: number }>;

  constructor() {
    this.config = {
      apiKey: '',
      sports: { ...DEFAULT_SPORTS },
      lastUpdated: new Date().toISOString(),
      isActive: false
    };
    this.isInitialized = false;
    this.cache = new Map();
    this.initialize().catch(console.error);
  }

  private async initialize() {
    try {
      const activeConfig = await OddsStorage.getActiveConfiguration();
      if (activeConfig) {
        this.config = {
          ...activeConfig,
          sports: { ...DEFAULT_SPORTS, ...activeConfig.sports }
        };
        
        if (this.config.apiKey) {
          const isValid = await this.validateApiKey(this.config.apiKey);
          this.isInitialized = isValid;
          this.config.isActive = isValid;
        }
      }
    } catch (error) {
      this.config.isActive = false;
      throw error;
    }
  }

  private async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await axios.get(`${BASE_URL}/sports`, {
        params: { apiKey },
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  private getCacheKey(endpoint: string, params: any = {}): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    const maxAge = 30000; // 30 seconds
    
    if (now - cached.timestamp > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getSportConfig(sportKey: string): SportConfig {
    return this.config.sports[sportKey] || DEFAULT_SPORTS[sportKey] || {
      enabled: true,
      refreshInterval: 30
    };
  }

  isConfigured(): boolean {
    return this.isInitialized && Boolean(this.config.apiKey) && Boolean(this.config.isActive);
  }

  getApiKey(): string {
    return this.config.apiKey;
  }

  async setApiKey(key: string): Promise<void> {
    try {
      const isValid = await this.validateApiKey(key);
      if (!isValid) {
        throw new Error('Invalid API key');
      }
      
      this.config.apiKey = key;
      this.config.isActive = true;
      this.isInitialized = true;
      this.cache.clear();
      
      await OddsStorage.saveToFirebase(this.config);
    } catch (error) {
      this.config.isActive = false;
      throw error;
    }
  }

  async setSportConfig(sportKey: string, enabled: boolean, refreshInterval: number): Promise<void> {
    try {
      this.config.sports[sportKey] = {
        enabled,
        refreshInterval: Math.max(1, Math.min(3600, refreshInterval))
      };
      
      const cacheKeys = Array.from(this.cache.keys())
        .filter(key => key.includes(sportKey));
      cacheKeys.forEach(key => this.cache.delete(key));
      
      await OddsStorage.saveToFirebase(this.config);
    } catch (error) {
      throw error;
    }
  }

  private async request<T>(endpoint: string, params = {}): Promise<T> {
    if (!this.config.apiKey) {
      throw new OddsApiError(ERROR_MESSAGES.API_KEY_REQUIRED, 'API_KEY_REQUIRED');
    }

    const cacheKey = this.getCacheKey(endpoint, params);
    const cachedData = this.getCachedData<T>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params: {
          apiKey: this.config.apiKey,
          ...params
        },
        timeout: 10000
      });

      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new OddsApiError(ERROR_MESSAGES.API_KEY_INVALID, 'API_KEY_INVALID');
        }
        if (error.response?.status === 429) {
          throw new OddsApiError(ERROR_MESSAGES.API_RATE_LIMIT, 'API_RATE_LIMIT');
        }
        if (error.response?.status === 404) {
          throw new OddsApiError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, 'RESOURCE_NOT_FOUND');
        }
      }
      throw new OddsApiError(ERROR_MESSAGES.API_CONNECTION_ERROR, 'API_CONNECTION_ERROR');
    }
  }

  async getSports(): Promise<Sport[]> {
    return this.request<Sport[]>('/sports');
  }

  async getOdds(sportKey: string, regions = 'eu'): Promise<Event[]> {
    const config = this.getSportConfig(sportKey);
    if (!config.enabled) {
      throw new OddsApiError(ERROR_MESSAGES.SPORT_DISABLED, 'SPORT_DISABLED');
    }
    return this.request<Event[]>(`/sports/${sportKey}/odds`, {
      regions,
      markets: 'h2h',
      dateFormat: 'iso'
    });
  }

  async getLiveEvents(sportKey: string): Promise<Event[]> {
    const config = this.getSportConfig(sportKey);
    if (!config.enabled) {
      throw new OddsApiError(ERROR_MESSAGES.SPORT_DISABLED, 'SPORT_DISABLED');
    }
    return this.request<Event[]>(`/sports/${sportKey}/odds-live`, {
      markets: 'h2h',
      dateFormat: 'iso'
    });
  }

  async getScores(sportKey: string): Promise<Event[]> {
    const config = this.getSportConfig(sportKey);
    if (!config.enabled) {
      throw new OddsApiError(ERROR_MESSAGES.SPORT_DISABLED, 'SPORT_DISABLED');
    }
    return this.request<Event[]>(`/sports/${sportKey}/scores`, {
      dateFormat: 'iso'
    });
  }
}

// Create and export a singleton instance
export const oddsApi = new OddsApi();