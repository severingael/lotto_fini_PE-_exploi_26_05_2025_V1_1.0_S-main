import { useState, useEffect } from 'react';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';

export function useFirestoreConnection() {
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_INTERVAL = 5000; // 5 seconds

  useEffect(() => {
    const db = getFirestore();
    let timeout: NodeJS.Timeout;
    let mounted = true;

    const handleConnectionError = () => {
      if (!mounted) return;
      
      setIsOnline(false);
      
      if (retryCount < MAX_RETRIES) {
        timeout = setTimeout(async () => {
          try {
            await enableNetwork(db);
            if (mounted) {
              setIsOnline(true);
              setRetryCount(0);
            }
          } catch (err) {
            if (mounted) {
              setRetryCount(prev => prev + 1);
              handleConnectionError();
            }
          }
        }, RETRY_INTERVAL * (retryCount + 1)); // Exponential backoff
      }
    };

    const initialize = async () => {
      try {
        await enableNetwork(db);
        if (mounted) {
          setIsOnline(true);
        }
      } catch (err) {
        handleConnectionError();
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (timeout) {
        clearTimeout(timeout);
      }
      disableNetwork(db).catch(console.error);
    };
  }, [retryCount]);

  return { isOnline };
}