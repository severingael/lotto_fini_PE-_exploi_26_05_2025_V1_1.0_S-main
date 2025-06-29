import { differenceInMinutes } from 'date-fns';

export const BETTING_CUTOFF_MINUTES = 10;

export function isBettingClosed(matchTime: string): boolean {
  const now = new Date();
  const matchDate = new Date(matchTime);
  const minutesUntilMatch = differenceInMinutes(matchDate, now);
  return minutesUntilMatch <= BETTING_CUTOFF_MINUTES;
}

export function getTimeUntilMatch(matchTime: string): string {
  const now = new Date();
  const matchDate = new Date(matchTime);
  const minutesUntilMatch = differenceInMinutes(matchDate, now);

  if (minutesUntilMatch <= 0) {
    return 'Match commencé';
  }

  if (minutesUntilMatch < 60) {
    return `${minutesUntilMatch} min`;
  }

  const hours = Math.floor(minutesUntilMatch / 60);
  const minutes = minutesUntilMatch % 60;
  return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
}