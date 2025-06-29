import React, { useState } from 'react';
import { Search, Calendar, Filter, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import { useBetsList } from '../../../hooks/useBetsList';
import { formatCurrency } from '../../../utils/format';
import LoadingState from '../../../components/LoadingState';

export default function BettingHistory() {
  const { bets, loading, error } = useBetsList();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'won':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'lost':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBets = bets.filter(bet => {
    const matchesSearch = bet.type === 'simple' 
      ? bet.match.toLowerCase().includes(searchTerm.toLowerCase())
      : bet.matches?.some(m => m.match.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = !dateFilter || bet.date.startsWith(dateFilter);
    const matchesStatus = statusFilter === 'all' || bet.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  if (loading) {
    return (
      <BaseDashboard title="Historique des Paris">
        <LoadingState message="Chargement des paris..." />
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Historique des Paris">
      <div className="space-y-6">
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un match..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'won' | 'lost')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">Tous les paris</option>
              <option value="pending">En cours</option>
              <option value="won">Gagnés</option>
              <option value="lost">Perdus</option>
            </select>
          </div>
        </div>

        {/* Liste des paris */}
        {filteredBets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun pari trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBets.map((bet) => (
              <div key={bet.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(bet.status)}`}>
                      {bet.type === 'simple' ? 'Pari Simple' : 'Pari Combiné'}
                    </span>
                    {getStatusIcon(bet.status)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(bet.date).toLocaleString('fr-FR')}
                  </span>
                </div>

                {bet.type === 'simple' ? (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">{bet.match}</h3>
                    <p className="text-sm text-gray-600">Sélection: {bet.selection}</p>
                    <p className="text-sm text-gray-600">Cote: {bet.odds}</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Combiné {bet.matches?.length} matchs</h3>
                    <div className="space-y-2">
                      {bet.matches?.map((match, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium">{match.match}</p>
                          <p className="text-gray-600">
                            {match.selection} (Cote: {match.odds})
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Cote totale: {bet.totalOdds}
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Mise</span>
                    <span className="font-medium">{formatCurrency(bet.stake)}</span>
                  </div>
                  {bet.status === 'pending' && bet.potentialWin && (
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-600">Gain potentiel</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(bet.potentialWin)}
                      </span>
                    </div>
                  )}
                  {bet.status === 'won' && bet.actualWin && (
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-600">Gain</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(bet.actualWin)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseDashboard>
  );
}