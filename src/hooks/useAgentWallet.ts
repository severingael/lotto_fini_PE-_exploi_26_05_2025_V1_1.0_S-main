import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AgentWalletService } from '../services/agent/wallet';
import type { AgentWallet, AgentCommissionWallet, AgentTransaction } from '../services/agent/types';

export function useAgentWallet() {
  const { currentUser, userData } = useAuth();
  const [wallet, setWallet] = useState<AgentWallet | null>(null);
  const [commissionWallet, setCommissionWallet] = useState<AgentCommissionWallet | null>(null);
  const [transactions, setTransactions] = useState<AgentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || userData?.role !== 'agentuser') {
      setLoading(false);
      return;
    }

    const loadWalletData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Chargement des portefeuilles pour:', currentUser.uid);

        // Récupérer les portefeuilles en parallèle
        const [mainWallet, commWallet] = await Promise.all([
          AgentWalletService.getWallet(currentUser.uid),
          AgentWalletService.getCommissionWallet(currentUser.uid)
        ]);

        console.log('Portefeuille principal:', mainWallet);
        console.log('Portefeuille commission:', commWallet);

        // Si aucun portefeuille n'existe, les créer
        if (!mainWallet || !commWallet) {
          console.log('Création des portefeuilles...');
          await AgentWalletService.createWalletIfNotExists(currentUser.uid, currentUser.email || '');
          const [newMainWallet, newCommWallet] = await Promise.all([
            AgentWalletService.getWallet(currentUser.uid),
            AgentWalletService.getCommissionWallet(currentUser.uid)
          ]);
          setWallet(newMainWallet);
          setCommissionWallet(newCommWallet);
          console.log('Nouveaux portefeuilles créés:', { newMainWallet, newCommWallet });
        } else {
          setWallet(mainWallet);
          setCommissionWallet(commWallet);
        }

        // Charger les transactions
        const transactionsData = await AgentWalletService.getTransactions(currentUser.uid);
        console.log('Transactions chargées:', transactionsData);
        setTransactions(transactionsData);

      } catch (err) {
        console.error('Error loading wallet:', err);
        setError('Erreur lors du chargement du portefeuille');
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, [currentUser, userData]);

  return { 
    wallet, 
    commissionWallet,
    transactions, 
    loading, 
    error 
  };
}