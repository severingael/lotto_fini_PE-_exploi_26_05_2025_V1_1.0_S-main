import React, { useState } from 'react';
import { Send, Search, Calendar, AlertCircle } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import { useStaffWallet } from '../../../hooks/useStaffWallet';
import TransferCreditModal from '../../../components/staff/wallet/TransferCreditModal';
import TransferToAgentModal from '../../../components/staff/wallet/TransferToAgentModal';
import LoadingState from '../../../components/LoadingState';
import { formatCurrency } from '../../../utils/format';

export default function Transfers() {
  const { wallet, transactions, loading, error } = useStaffWallet();
  const [showStaffTransferModal, setShowStaffTransferModal] = useState(false);
  const [showAgentTransferModal, setShowAgentTransferModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Filtrer uniquement les transactions de transfert
  const transferTransactions = transactions.filter(t => 
    (t.referenceType === 'transfer' || t.referenceType === 'agent_transfer') &&
    (!searchTerm || t.transferTo?.includes(searchTerm) || t.transferFrom?.includes(searchTerm)) &&
    (!dateFilter || t.createdAt.startsWith(dateFilter))
  );

  if (loading) {
    return (
      <BaseDashboard title="Transferts">
        <LoadingState message="Chargement des transferts..." />
      </BaseDashboard>
    );
  }

  if (!wallet) {
    return (
      <BaseDashboard title="Transferts">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          Votre portefeuille n'est pas encore activé. Veuillez contacter l'administrateur.
        </div>
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Transferts">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* En-tête avec solde et boutons de transfert */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Solde disponible</p>
              <p className="text-2xl font-bold">{formatCurrency(wallet.balance)}</p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
              <button
                onClick={() => setShowStaffTransferModal(true)}
                className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>Transférer à un staff</span>
              </button>
              <button
                onClick={() => setShowAgentTransferModal(true)}
                className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>Transférer à un agent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-full md:w-48">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Liste des transferts - Vue mobile */}
        <div className="md:hidden space-y-4">
          {transferTransactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
              Aucun transfert trouvé
            </div>
          ) : (
            transferTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'credit' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type === 'credit' ? 'Reçu' : 'Envoyé'}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-gray-900">
                    {transaction.type === 'credit' 
                      ? `De: ${transaction.transferFrom}`
                      : `Vers: ${transaction.transferTo}`
                    }
                  </div>
                  {transaction.referenceType === 'agent_transfer' && (
                    <div className="text-xs text-gray-500">
                      Transfer agent
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-xs text-gray-500">
                    {transaction.status === 'completed' ? 'Terminé' : 'En cours'}
                  </div>
                  <div className={`text-base font-medium ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Liste des transferts - Vue desktop */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Détails</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transferTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Aucun transfert trouvé
                    </td>
                  </tr>
                ) : (
                  transferTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleTimeString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'credit' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'credit' ? 'Reçu' : 'Envoyé'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {transaction.type === 'credit' 
                            ? `De: ${transaction.transferFrom}`
                            : `Vers: ${transaction.transferTo}`
                          }
                        </div>
                        {transaction.referenceType === 'agent_transfer' && (
                          <div className="text-xs text-gray-500">
                            Transfer agent
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-medium ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.status === 'completed' ? 'Terminé' : 'En cours'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        {showStaffTransferModal && (
          <TransferCreditModal
            isOpen={showStaffTransferModal}
            onClose={() => setShowStaffTransferModal(false)}
            currentBalance={wallet.balance}
            staffId={wallet.id}
            onTransferComplete={() => {
              window.location.reload();
            }}
          />
        )}

        {showAgentTransferModal && (
          <TransferToAgentModal
            isOpen={showAgentTransferModal}
            onClose={() => setShowAgentTransferModal(false)}
            currentBalance={wallet.balance}
            staffId={wallet.id}
            onTransferComplete={() => {
              window.location.reload();
            }}
          />
        )}
      </div>
    </BaseDashboard>
  );
}