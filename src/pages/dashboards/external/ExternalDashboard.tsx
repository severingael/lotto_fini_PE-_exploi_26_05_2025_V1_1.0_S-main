import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Wallet } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import BetsList from './BetsList';
import WalletBalance from '../../../components/wallet/WalletBalance';
import TransactionList from '../../../components/wallet/TransactionList';

export default function ExternalDashboard() {
  return (
    <BaseDashboard title="Mon Tableau de bord">
      <div className="space-y-8">
        {/* Wallet Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WalletBalance />
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Actions rapides</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/deposit"
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Wallet className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">Dépôt</span>
              </Link>
              <Link
                to="/withdraw"
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Wallet className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">Retrait</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold mb-4">Transactions récentes</h2>
          <TransactionList />
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/football"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-lg">Paris Sportifs</h3>
            </div>
            <p className="text-gray-600">Pariez sur vos équipes favorites</p>
          </Link>

          <Link
            to="/lotto"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-lg">Lotto</h3>
            </div>
            <p className="text-gray-600">Participez aux tirages Lotto</p>
          </Link>
        </div>

        {/* Liste des paris récents */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold mb-4">Mes paris récents</h2>
          <BetsList />
        </div>
      </div>
    </BaseDashboard>
  );
}