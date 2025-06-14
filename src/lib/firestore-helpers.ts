import { Firestore, onSnapshotsInSync } from 'firebase/firestore';

let isOnline = true;
const listeners = new Set<(online: boolean) => void>();

export function onConnectivityStateChange(db: Firestore, callback: (online: boolean) => void) {
  listeners.add(callback);
  
  if (listeners.size === 1) {
    // Only set up the listener once
    onSnapshotsInSync(db, () => {
      if (!isOnline) {
        isOnline = true;
        listeners.forEach(listener => listener(true));
      }
    });
  }

  // Initial callback with current state
  callback(isOnline);

  // Return cleanup function
  return () => {
    listeners.delete(callback);
  };
}

// Handle offline detection
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    listeners.forEach(listener => listener(true));
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    listeners.forEach(listener => listener(false));
  });
}