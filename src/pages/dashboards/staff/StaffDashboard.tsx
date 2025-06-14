import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Trophy, Clock, Wallet } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import StaffWalletBalance from '../../../components/staff/wallet/StaffWalletBalance';
import StaffTransactionList from '../../../components/staff/wallet/StaffTransactionList';
import StaffCommissionDashboard from '../../../components/staff/wallet/StaffCommissionDashboard';
import { useStaffWallet } from '../../../hooks/useStaffWallet';
import LoadingState from '../../../components/LoadingState';
import { formatCurrency } from '../../../utils/format';

export default function StaffDashboard() {
  const { wallet, commissionWallet, transactions, loading, error } = useStaffWallet();
  const [activeTab, setActiveTab] = useState<'transactions' | 'commissions'>('transactions');

  if (loading) {
    return (
      <BaseDashboard title="Tableau de bord Staff">
        <LoadingState message="Chargement du portefeuille..." />
      </BaseDashboard>
    );
  }

  if (!wallet || !commissionWallet) {
    return (
      <BaseDashboard title="Tableau de bord Staff">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          Votre portefeuille n'est pas encore activé. Veuillez contacter l'administrateur.
        </div>
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Tableau de bord Staff">
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
        {activeTab === 'transactions' ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Historique des transactions</h2>
            <StaffTransactionList transactions={transactions} />
          </div>
        ) : (
          <StaffCommissionDashboard />
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/dashboard/staff/lotto-tickets"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Tickets Lotto</h3>
                <p className="text-gray-600">Gérer les tickets et paiements</p>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/staff/clients"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Clients</h3>
                <p className="text-gray-600">Gérer les clients</p>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/staff/tickets"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Support</h3>
                <p className="text-gray-600">Gérer les tickets support</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </BaseDashboard>
  );
}