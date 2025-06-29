import React, { useState, useEffect } from 'react';
import { LottoService, LottoEvent } from '../../../services/lotto';
import { LottoPrizeService, LottoPrize } from '../../../services/lotto/prize';
import PrizeResultModal from '../../../components/lotto/PrizeResultModal';
import LoadingState from '../../../components/LoadingState';
import { AlertCircle, Trophy, Search, Eye, Calendar } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function PrizeHistory() {
  const [lottos, setLottos] = useState<LottoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrize, setSelectedPrize] = useState<LottoPrize | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchLottos();
  }, []);

  const fetchLottos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LottoService.getAllLottos();
      const completedLottos = data.filter(lotto => lotto.prizeCalculated);
      setLottos(completedLottos);
    } catch (err) {
      setError('Erreur lors du chargement des lottos');
      console.error('Error fetching lottos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrize = async (lotto: LottoEvent) => {
    try {
      const prizeResult = await LottoPrizeService.getPrizeResult(lotto.id!);
      if (prizeResult) {
        setSelectedPrize(prizeResult);
      }
    } catch (err) {
      setError('Erreur lors du chargement des résultats');
    }
  };

  const filteredAndSortedLottos = lottos
    .filter(lotto => {
      const matchesSearch = lotto.eventName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || lotto.endDate.startsWith(dateFilter);
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.endDate).getTime();
      const dateB = new Date(b.endDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  if (loading) {
    return <LoadingState message="Chargement de l'historique..." />;
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un lotto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtre par date */}
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

          {/* Tri par date */}
          <button
            onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            <span>Date {sortOrder === 'asc' ? '↑' : '↓'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {filteredAndSortedLottos.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun historique de gains disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedLottos.map((lotto) => (
            <div key={lotto.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{lotto.eventName}</h3>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  Date de fin: {new Date(lotto.endDate).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  Prix du ticket: {formatCurrency(lotto.ticketPrice)}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Numéros gagnants:</span>
                  <div className="flex flex-wrap gap-1">
                    {lotto.winningNumbers?.map((num, idx) => (
                      <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleViewPrize(lotto)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Voir les résultats
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPrize && (
        <PrizeResultModal
          prize={selectedPrize}
          onClose={() => setSelectedPrize(null)}
        />
      )}
    </div>
  );
}