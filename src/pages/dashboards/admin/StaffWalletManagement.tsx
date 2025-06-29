import React, { useState, useEffect } from 'react';
import { StaffWalletService } from '../../../services/staff/wallet';
import BaseDashboard from '../BaseDashboard';
import { AlertCircle, Wallet, Search } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';
import type { StaffWallet } from '../../../services/staff/types';
import LoadingState from '../../../components/LoadingState';
import { useAuth } from '../../../contexts/AuthContext';
import CreditWalletModal from '../../../components/admin/wallet/CreditWalletModal';

export default function StaffWalletManagement() {
  const { currentUser } = useAuth();
  const [wallets, setWallets] = useState<StaffWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<StaffWallet | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await StaffWalletService.getAllStaffWallets();
      setWallets(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des portefeuilles';
      setError(errorMessage);
      console.error('Error loading wallets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCredit = (wallet: StaffWallet) => {
    setSelectedWallet(wallet);
    setShowCreditModal(true);
  };

  const handleCreditSubmit = async (amount: number) => {
    if (!selectedWallet || !currentUser) return;
    
    try {
      await StaffWalletService.creditWallet(
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
      wallet.userId?.toLowerCase().includes(searchStr) ||
      wallet.balance.toString().includes(searchStr) ||
      wallet.currency.toLowerCase().includes(searchStr)
    );
  });

  if (loading) {
    return (
      <BaseDashboard title="Gestion des Portefeuilles Staff">
        <LoadingState message="Chargement des portefeuilles..." />
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Gestion des Portefeuilles Staff">
      <div className="space-y-6">
        {/* Statistiques globales */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
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
            placeholder="Rechercher par ID ou solde..."
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

        {/* Liste des staff */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Staff</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Solde</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWallets.map((wallet) => (
                  <tr key={wallet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                          <span className="text-lg font-medium text-blue-600">
                            {wallet.userId[0]?.toUpperCase() || 'S'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Staff #{wallet.userId?.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(wallet.balance, wallet.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleCredit(wallet)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Créditer
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredWallets.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      Aucun staff trouvé
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