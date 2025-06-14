import React from 'react';
import { Wallet, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';
import type { AgentWallet } from '../../../services/agent/types';

interface AgentWalletListProps {
  wallets: AgentWallet[];
  onCredit: (wallet: AgentWallet) => void;
}

export default function AgentWalletList({ wallets, onCredit }: AgentWalletListProps) {
  if (!wallets) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
        Aucun portefeuille disponible
      </div>
    );
  }

  return (
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
            {wallets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aucun portefeuille trouvé
                </td>
              </tr>
            ) : (
              wallets.map((wallet) => (
                <tr key={wallet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <Wallet className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium">
                        {wallet.userId ? `Agent #${wallet.userId.slice(0, 8)}` : 'Agent'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {wallet.userEmail}
                  </td>
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
                      onClick={() => onCredit(wallet)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Créditer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}