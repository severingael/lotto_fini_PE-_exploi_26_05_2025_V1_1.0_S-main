import React, { useState } from 'react';
import BaseDashboard from '../BaseDashboard';
import { useStaffWallet } from '../../../hooks/useStaffWallet';
import StaffWalletBalance from '../../../components/staff/wallet/StaffWalletBalance';
import StaffTransactionList from '../../../components/staff/wallet/StaffTransactionList';
import ConvertCommissionModal from '../../../components/staff/wallet/ConvertCommissionModal';
import LoadingState from '../../../components/LoadingState';
import { Wallet, Trophy, Send, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function StaffWallet() {
  const { wallet, commissionWallet, transactions, loading, error } = useStaffWallet();
  const [activeTab, setActiveTab] = useState<'transactions' | 'commissions'>('transactions');
  const [showConvertModal, setShowConvertModal] = useState(false);

  if (loading) {
    return (
      <BaseDashboard title="Mon Portefeuille">
        <LoadingState message="Chargement du portefeuille..." />
      </BaseDashboard>
    );
  }

  if (!wallet || !commissionWallet) {
    return (
      <BaseDashboard title="Mon Portefeuille">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          Votre portefeuille n'est pas encore activé. Veuillez contacter l'administrateur.
        </div>
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Mon Portefeuille">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Soldes des portefeuilles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StaffWalletBalance wallet={wallet} />
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Commissions</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(commissionWallet.balance, commissionWallet.currency)}
                  </p>
                </div>
              </div>
              {commissionWallet.balance > 0 && (
                <button
                  onClick={() => setShowConvertModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Convertir</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'transactions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Transactions</span>
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'commissions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="font-medium">Commissions</span>
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            {activeTab === 'transactions' ? 'Historique des transactions' : 'Historique des commissions'}
          </h2>
          <StaffTransactionList 
            transactions={transactions.filter(t => 
              activeTab === 'transactions' 
                ? t.type !== 'commission'
                : t.type === 'commission'
            )} 
          />
        </div>

        {/* Modal de conversion */}
        {showConvertModal && (
          <ConvertCommissionModal
            isOpen={showConvertModal}
            onClose={() => setShowConvertModal(false)}
            commissionBalance={commissionWallet.balance}
            staffId={wallet.id}
            onConvertComplete={() => {
              // Recharger les données
              window.location.reload();
            }}
          />
        )}
      </div>
    </BaseDashboard>
  );
}