import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ChevronDown, Calendar, Search } from 'lucide-react';
import { LottoService } from '../../services/lotto';
import { formatCurrency } from '../../utils/format';

export default function LottoResultsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const lottos = await LottoService.getAllLottos();
        const completedLottos = lottos
          .filter(lotto => lotto.prizeCalculated)
          .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
          .slice(0, 10);
        setResults(completedLottos);
      } catch (err) {
        setError('Erreur lors du chargement des résultats');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchResults();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults = results.filter(result =>
    result.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <Trophy className="w-5 h-5" />
        <span className="font-medium">Résultats Lotto</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg py-4 z-50">
          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un tirage..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Aucun résultat trouvé
              </div>
            ) : (
              <div className="space-y-2">
                {filteredResults.map((result) => (
                  <div key={result.id} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{result.eventName}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(result.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Tirage du {new Date(result.endDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {result.winningNumbers && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {result.winningNumbers.map((number: number, index: number) => (
                          <span
                            key={index}
                            className="w-8 h-8 flex items-center justify-center bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                          >
                            {number}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}