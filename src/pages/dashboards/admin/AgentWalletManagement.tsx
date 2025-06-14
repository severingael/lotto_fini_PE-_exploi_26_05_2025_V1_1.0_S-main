import React, { useState, useEffect } from 'react';
import { AgentWalletService } from '../../../services/agent/wallet';
import BaseDashboard from '../BaseDashboard';
import { AlertCircle, Wallet, Search } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';
import type { AgentWallet } from '../../../services/agent/types';
import LoadingState from '../../../components/LoadingState';
import { useAuth } from '../../../contexts/AuthContext';
import CreditWalletModal from '../../../components/admin/wallet/CreditWalletModal';

export default function AgentWalletManagement() {
  const { currentUser } = useAuth();
  const [wallets, setWallets] = useState<AgentWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<AgentWallet | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AgentWalletService.getAllAgentWallets();
      setWallets(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des portefeuilles';
      setError(errorMessage);
      console.error('Error loading wallets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCredit = (wallet: AgentWallet) => {
    setSelectedWallet(wallet);
    setShowCreditModal(true);
  };

  const handleCreditSubmit = async (amount: number) => {
    if (!selectedWallet || !currentUser) return;
    
    try {
      await AgentWalletService.creditWallet(
        selectedWallet.id, 
        amount, 
        currentUser.uid, 
        currentUser.email || undefined
      );
      await loadWallets();
      setShowCreditModal(false);
      setSelectedWallet(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du crédit';
      setError(errorMessage);
    }
  };

  const filteredWallets = wallets.filter(wallet => {
    const searchStr = searchTerm.toLowerCase();
    return (
      wallet.userEmail?.toLowerCase().includes(searchStr) ||
      (wallet.userId ?? '').toLowerCase().includes(searchStr) ||
      wallet.balance.toString().includes(searchStr) ||
      wallet.currency.toLowerCase().includes(searchStr)
    );
  });

  if (loading) {
    return (
      <BaseDashboard title="Gestion des Portefeuilles">
        <LoadingState message="Chargement des portefeuilles..." />
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Gestion des Portefeuilles">
      <div className="space-y-6">
        {/* Statistiques globales */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Agents</p>
                <p className="text-xl font-bold">{wallets.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Solde Total</p>
                <p className="text-xl font-bold">
                  {formatCurrency(wallets.reduce((sum, w) => sum + w.balance, 0), 'EUR')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Wallet className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Solde Moyen</p>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    wallets.length > 0 
                      ? wallets.reduce((sum, w) => sum + w.balance, 0) / wallets.length 
                      : 0, 
                    'EUR'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par email, ID, solde ou devise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Liste des agents */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Agent</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Solde</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Valeur unitaire</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Dernière mise à jour</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWallets.map((wallet) => (
                  <tr key={wallet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Wallet className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="font-medium">{wallet.userId ? `Agent #${wallet.userId.slice(0, 8)}` : 'Agent'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{wallet.userEmail}</td>
                    <td className="px-6 py-4 text-sm">
                      {formatCurrency(wallet.balance, wallet.currency)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {wallet.unitValue}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(wallet.updatedAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleCredit(wallet)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Créditer
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredWallets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Aucun agent trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de crédit */}
      {selectedWallet && showCreditModal && (
        <CreditWalletModal
          isOpen={showCreditModal}
          onClose={() => {
            setShowCreditModal(false);
            setSelectedWallet(null);
          }}
          wallet={selectedWallet}
          onSubmit={handleCreditSubmit}
        />
      )}
    </BaseDashboard>
  );
}