import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import BaseDashboard from './dashboards/BaseDashboard';
import { TransactionRepository } from '../services/transactions/repository';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';
import type { Transaction, TransactionFilters } from '../services/transactions/types';
import LoadingState from '../components/LoadingState';

export default function Transactions() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadTransactions();
    }
  }, [currentUser, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionRepository.getTransactions(currentUser!.uid, filters);
      setTransactions(data);
    } catch (err) {
      setError('Erreur lors du chargement des transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: Transaction['type']) => {
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

  if (loading) {
    return (
      <BaseDashboard title="Transactions">
        <LoadingState message="Chargement des transactions..." />
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Transactions">
      <div className="space-y-6">
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as Transaction['type'] || undefined }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="deposit">Dépôts</option>
              <option value="withdraw">Retraits</option>
              <option value="bet">Paris</option>
              <option value="win">Gains</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Liste des transactions */}
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Aucune transaction trouvée
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-sm p-4">
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
            ))
          )}
        </div>
      </div>
    </BaseDashboard>
  );
}