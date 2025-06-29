import { useQuery } from '@tanstack/react-query';
import { oddsApi } from '../services/odds';
import type { Sport, Event } from '../services/odds/types';
import { OddsApiError } from '../services/odds/errors';

// Constants for cache and refresh management
const STALE_TIME = 30000; // 30 seconds
const CACHE_TIME = 60000; // 1 minute
const RETRY_DELAY = 2000; // 2 seconds

export function useOdds(sportKey: string) {
  return useQuery<Event[], OddsApiError>({
    queryKey: ['odds', sportKey],
    queryFn: async () => {
      if (!sportKey) return [];
      console.log(`Fetching odds for ${sportKey}...`);
      const data = await oddsApi.getOdds(sportKey);
      console.log(`Received ${data.length} matches for ${sportKey}`);
      return data;
    },
    retry: (failureCount, error) => {
      // Don't retry if sport is disabled
      if (error.code === 'SPORT_DISABLED') {
        console.log(`Sport ${sportKey} is disabled, not retrying`);
        return false;
      }
      return failureCount < 2;
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME, // renamed from cacheTime in v5
    retryDelay: RETRY_DELAY,
    // Enable background refresh
    refetchInterval: oddsApi.getSportConfig(sportKey).refreshInterval * 1000,
    refetchIntervalInBackground: true,
    // Only enable if API is configured and sport is enabled
    enabled: oddsApi.isConfigured() && oddsApi.getSportConfig(sportKey).enabled,
    onError: (error) => {
      console.error(`Error fetching odds for ${sportKey}:`, error);
    },
    onSuccess: (data) => {
      console.log(`Successfully fetched ${data.length} matches for ${sportKey}`);
    }
  });
}

export function useSports() {
  return useQuery<Sport[], OddsApiError>({
    queryKey: ['sports'],
    queryFn: async () => {
      console.log('Fetching available sports...');
      return oddsApi.getSports();
    },
    retry: 2,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME, // renamed from cacheTime in v5
    retryDelay: RETRY_DELAY,
    enabled: oddsApi.isConfigured(),
    onError: (error) => {
      console.error('Failed to fetch sports:', error);
    },
    onSuccess: (data) => {
      console.log(`Successfully fetched ${data.length} sports`);
    }
  });
}