import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LottoService } from '../services/lotto';
import { useAuth } from '../contexts/AuthContext';
import type { LottoParticipation } from '../services/lotto/types';

export function useLottoParticipants() {
  const { currentUser } = useAuth();
  const [participants, setParticipants] = useState<LottoParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);
      const participationsRef = collection(db, 'lotto_participations');
      const q = query(participationsRef, orderBy('purchaseDate', 'desc'));
      const snapshot = await getDocs(q);
      
      const participantsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().status || 'active'
      })) as LottoParticipation[];

      setParticipants(participantsData);
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Erreur lors du chargement des participants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const cancelParticipation = async (participationId: string, cancelledBy: string) => {
    if (!currentUser && !cancelledBy) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      setError(null);
      await LottoService.cancelParticipation(participationId, cancelledBy || currentUser!.uid);
      await fetchParticipants(); // Recharger la liste après l'annulation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'annulation du ticket';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { 
    participants, 
    loading, 
    error,
    cancelParticipation,
    refreshParticipants: fetchParticipants
  };
}