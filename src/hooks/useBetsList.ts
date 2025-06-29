import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Bet } from '../services/betting/types';
import { FirebaseError } from 'firebase/app';

export function useBetsList() {
  const { currentUser } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Créer la requête avec les filtres appropriés
    const betsRef = collection(db, 'bets');
    const q = query(
      betsRef,
      where('userId', '==', currentUser.uid),
      orderBy('date', 'desc')
    );

    // Mettre en place l'écoute en temps réel
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const newBets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Bet[];
        setBets(newBets);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching bets:', err);
        if (err instanceof FirebaseError) {
          switch (err.code) {
            case 'permission-denied':
              setError('Vous n\'avez pas les permissions nécessaires');
              break;
            case 'failed-precondition':
              setError('Une erreur de configuration est survenue');
              break;
            default:
              setError('Erreur lors du chargement des paris');
          }
        } else {
          setError('Erreur lors du chargement des paris');
        }
        setLoading(false);
      }
    );

    // Nettoyer l'écoute quand le composant est démonté
    return () => unsubscribe();
  }, [currentUser]);

  return { bets, loading, error };
}