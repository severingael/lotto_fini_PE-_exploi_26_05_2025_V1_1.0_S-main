import React from 'react';
import { Wallet } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { formatCurrency } from '../../utils/format';
import LoadingState from '../LoadingState';

export default function WalletBalance() {
  const { balance, loading, error } = useWallet();

  if (loading) {
    return <LoadingState message="Chargement du solde..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Solde disponible</p>
            <p className="text-2xl font-bold">
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}