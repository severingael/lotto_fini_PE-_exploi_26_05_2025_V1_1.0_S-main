import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { formatCurrency } from '../../utils/format';
import LoadingState from '../LoadingState';

export default function TransactionList() {
  const { transactions, loading, error } = useWallet();

  if (loading) {
    return <LoadingState message="Chargement des transactions..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'win':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'withdraw':
      case 'bet':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                transaction.type === 'deposit' || transaction.type === 'win'
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}>
                {getTransactionIcon(transaction.type)}
              </div>
              <div>
                <p className="font-medium">
                  {transaction.type === 'deposit' ? 'Dépôt' :
                   transaction.type === 'withdraw' ? 'Retrait' :
                   transaction.type === 'bet' ? 'Mise' : 'Gain'}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(transaction.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-medium ${
                transaction.type === 'deposit' || transaction.type === 'win'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {transaction.type === 'deposit' || transaction.type === 'win' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
              <p className={`text-sm ${
                transaction.status === 'completed' ? 'text-green-600' :
                transaction.status === 'pending' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {transaction.status === 'completed' ? 'Terminé' :
                 transaction.status === 'pending' ? 'En cours' :
                 'Échoué'}
              </p>
            </div>
          </div>
        </div>
      ))}

      {transactions.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          Aucune transaction
        </div>
      )}
    </div>
  );
}