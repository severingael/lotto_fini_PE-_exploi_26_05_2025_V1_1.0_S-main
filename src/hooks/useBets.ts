import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Bet } from '../services/betting/types';

export function useBets() {
  const { currentUser } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    // Créer la requête
    const betsRef = collection(db, 'bets');
    const q = query(
      betsRef,
      where('userId', '==', currentUser.uid),
      orderBy('date', 'desc')
    );

    // Mettre en place le listener temps réel
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
        setError('Erreur lors du chargement des paris');
        setLoading(false);
      }
    );

    // Nettoyer le listener quand le composant est démonté
    return () => unsubscribe();
  }, [currentUser]);

  return { bets, loading, error };
}