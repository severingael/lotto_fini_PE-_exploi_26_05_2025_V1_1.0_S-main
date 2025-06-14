import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Trophy, Wallet } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import { useAgentWallet } from '../../../hooks/useAgentWallet';
import { formatCurrency } from '../../../utils/format';
import LoadingState from '../../../components/LoadingState';

const quickActions = [
  { 
    label: 'Scanner un ticket',
    description: 'Scanner un ticket Lotto',
    path: '/dashboard/agent/lotto-tickets',
    icon: QrCode,
    color: 'blue'
  },
  { 
    label: 'Tickets Lotto',
    description: 'Gérer les tickets Lotto',
    path: '/dashboard/agent/lotto-tickets',
    icon: Trophy,
    color: 'green'
  }
];

export default function AgentDashboard() {
  const { wallet, commissionWallet, loading, error } = useAgentWallet();

  if (loading) {
    return (
      <BaseDashboard title="Tableau de bord Agent">
        <LoadingState message="Chargement des données..." />
      </BaseDashboard>
    );
  }

  if (error) {
    return (
      <BaseDashboard title="Tableau de bord Agent">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Tableau de bord Agent">
      {/* Soldes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Solde disponible</p>
              <p className="text-2xl font-bold">
                {formatCurrency(wallet?.balance || 0, wallet?.currency || 'XAF')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Commissions</p>
              <p className="text-2xl font-bold">
                {formatCurrency(commissionWallet?.balance || 0, commissionWallet?.currency || 'XAF')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className={`p-3 bg-${action.color}-100 rounded-lg`}>
                <action.icon className={`w-6 h-6 text-${action.color}-600`} />
              </div>
              <h3 className="font-medium text-lg">{action.label}</h3>
            </div>
            <p className="text-gray-600">{action.description}</p>
          </Link>
        ))}
      </div>
    </BaseDashboard>
  );
}