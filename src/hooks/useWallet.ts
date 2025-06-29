import { useState, useEffect } from 'react';
import { doc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useWallet() {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Écouter les changements du portefeuille
    const walletRef = doc(db, 'agent_wallets', currentUser.uid);
    const unsubscribeWallet = onSnapshot(walletRef, (doc) => {
      if (doc.exists()) {
        setBalance(doc.data().balance || 0);
      }
    }, (err) => {
      console.error('Error listening to wallet:', err);
      setError('Erreur lors du chargement du solde');
    });

    // Écouter les transactions
    const transactionsRef = collection(db, 'agent_transactions');
    const q = query(
      transactionsRef,
      where('walletId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      const transactionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transactionsList);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to transactions:', err);
      setError('Erreur lors du chargement des transactions');
      setLoading(false);
    });

    return () => {
      unsubscribeWallet();
      unsubscribeTransactions();
    };
  }, [currentUser]);

  return { balance, transactions, loading, error };
}