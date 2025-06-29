import React, { useState } from 'react';
import { History, Search, Filter, Calendar, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import BaseDashboard from '../dashboards/BaseDashboard';
import { formatCurrency } from '../../utils/format';
import { useBetsList } from '../../hooks/useBetsList';
import LoadingState from '../../components/LoadingState';

export default function BetsHistory() {
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
      <BaseDashboard title="Historique des paris">
        <LoadingState message="Chargement des paris..." />
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Historique des paris">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les paris</option>
              <option value="pending">En cours</option>
              <option value="won">Gagnés</option>
              <option value="lost">Perdus</option>
            </select>
          </div>
        </div>

        {/* Tableau des paris */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredBets.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun pari trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Match(s)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mise
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cote
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gain potentiel/réel
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBets.map((bet) => (
                    <tr key={bet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(bet.date).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium">
                          {bet.type === 'simple' ? 'Simple' : 'Combiné'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {bet.type === 'simple' ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{bet.match}</div>
                            <div className="text-gray-500">{bet.selection}</div>
                          </div>
                        ) : (
                          <div className="text-sm space-y-1">
                            {bet.matches?.map((match, idx) => (
                              <div key={idx}>
                                <div className="font-medium text-gray-900">{match.match}</div>
                                <div className="text-gray-500">{match.selection}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {formatCurrency(bet.stake)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {bet.type === 'simple' ? bet.odds : bet.totalOdds}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {bet.status === 'won' ? (
                          <span className="text-green-600">{formatCurrency(bet.actualWin || 0)}</span>
                        ) : (
                          <span className="text-gray-600">{formatCurrency(bet.potentialWin || 0)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(bet.status)}`}>
                            {getStatusIcon(bet.status)}
                            <span className="ml-1">
                              {bet.status === 'pending' ? 'En cours' :
                               bet.status === 'won' ? 'Gagné' : 'Perdu'}
                            </span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </BaseDashboard>
  );
}