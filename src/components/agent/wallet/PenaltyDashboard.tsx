import React from 'react';
import { AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAgentWallet } from '../../../hooks/useAgentWallet';
import { formatCurrency } from '../../../utils/format';
import LoadingState from '../../../components/LoadingState';

export default function PenaltyDashboard() {
  const { penaltyWallet, transactions, loading, error } = useAgentWallet();

  // Filtrer uniquement les transactions de pénalité
  const penaltyTransactions = transactions.filter(t => t.type === 'penalty');

  // Calculer les statistiques
  const totalPenalties = penaltyWallet?.balance || 0;
  const todayPenalties = penaltyTransactions
    .filter(t => {
      const today = new Date();
      const transactionDate = new Date(t.createdAt);
      return (
        transactionDate.getDate() === today.getDate() &&
        transactionDate.getMonth() === today.getMonth() &&
        transactionDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return <LoadingState message="Chargement des pénalités..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques des pénalités - Optimisé pour mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total des pénalités</p>
              <p className="text-xl sm:text-2xl font-bold">
                {formatCurrency(totalPenalties, penaltyWallet?.currency || 'XAF')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pénalités aujourd'hui</p>
              <p className="text-xl sm:text-2xl font-bold">
                {formatCurrency(todayPenalties, penaltyWallet?.currency || 'XAF')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des pénalités */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Historique des pénalités</h2>
        <div className="space-y-3 sm:space-y-4">
          {penaltyTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Aucune pénalité
            </p>
          ) : (
            penaltyTransactions.map((transaction) => (
              <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <ArrowUpRight className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pénalité</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleString('fr-FR')}
                    </p>
                    {transaction.reason && (
                      <p className="text-xs text-gray-500 mt-1">{transaction.reason}</p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-auto sm:ml-0">
                  <p className="font-medium text-red-600">
                    +{formatCurrency(transaction.amount, transaction.currency || 'XAF')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {transaction.referenceType === 'cancellation_fee' ? 'Annulation de ticket' : 'Pénalité'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}