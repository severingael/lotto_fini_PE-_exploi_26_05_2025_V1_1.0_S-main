import React, { useState, useEffect } from 'react';
import { LottoService, LottoEvent } from '../../../services/lotto';
import { LottoPrizeService } from '../../../services/lotto/prize';
import PrizeModal from '../../../components/lotto/PrizeModal';
import PrizeResultModal from '../../../components/lotto/PrizeResultModal';
import LoadingState from '../../../components/LoadingState';
import { AlertCircle, Trophy, Search } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function PendingDraws() {
  const [lottos, setLottos] = useState<LottoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLotto, setSelectedLotto] = useState<LottoEvent | null>(null);
  const [prizeResult, setPrizeResult] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLottos();
  }, []);

  const fetchLottos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LottoService.getAllLottos();
      // Filtrer uniquement les lottos terminés sans calcul de gains
      const pendingLottos = data.filter(lotto => {
        const endDate = new Date(lotto.endDate);
        return endDate < new Date() && !lotto.prizeCalculated;
      });
      setLottos(pendingLottos);
    } catch (err) {
      setError('Erreur lors du chargement des lottos');
      console.error('Error fetching lottos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrizeCalculated = async () => {
    await fetchLottos();
  };

  const filteredLottos = lottos.filter(lotto =>
    lotto.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingState message="Chargement des lottos..." />;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un lotto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {filteredLottos.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun lotto en attente de calcul des gains</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLottos.map((lotto) => (
            <div key={lotto.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{lotto.eventName}</h3>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  Date de fin: {new Date(lotto.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Prix du ticket: {formatCurrency(lotto.ticketPrice)}
                </p>
                <p className="text-sm text-gray-600">
                  Numéros à sélectionner: {lotto.numbersToSelect}
                </p>
              </div>

              <button
                onClick={() => setSelectedLotto(lotto)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Définir les gains
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedLotto && (
        <PrizeModal
          lotto={selectedLotto}
          onClose={() => setSelectedLotto(null)}
          onPrizeCalculated={handlePrizeCalculated}
        />
      )}

      {prizeResult && (
        <PrizeResultModal
          prize={prizeResult}
          onClose={() => setPrizeResult(null)}
        />
      )}
    </div>
  );
}