import React, { useState, useEffect } from 'react';
import { X, Trophy, AlertCircle, Info } from 'lucide-react';
import { LottoEvent } from '../../services/lotto';
import { LottoPrizeService } from '../../services/lotto/prize';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';

interface PrizeModalProps {
  lotto: LottoEvent;
  onClose: () => void;
  onPrizeCalculated: () => void;
}

interface TicketStats {
  [key: number]: number; // nombre de numéros -> nombre de tickets
}

export default function PrizeModal({ lotto, onClose, onPrizeCalculated }: PrizeModalProps) {
  const { currentUser, userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [prizes, setPrizes] = useState<{ [key: number]: string }>({});
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isAdmin = userData?.role === 'adminuser';

  // Initialiser les champs de prix en fonction du nombre de numéros à sélectionner
  useEffect(() => {
    const initialPrizes: { [key: number]: string } = {};
    // Créer un champ pour chaque nombre possible de numéros corrects (de 1 à numbersToSelect)
    for (let i = 1; i <= lotto.numbersToSelect; i++) {
      initialPrizes[i] = '';
    }
    setPrizes(initialPrizes);
  }, [lotto.numbersToSelect]);

  const calculateStats = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validation des numéros gagnants
      if (winningNumbers.length !== lotto.numbersToSelect) {
        throw new Error(`Veuillez saisir les ${lotto.numbersToSelect} numéros gagnants`);
      }

      // Vérifier que les numéros sont uniques
      const uniqueNumbers = new Set(winningNumbers);
      if (uniqueNumbers.size !== lotto.numbersToSelect) {
        throw new Error('Les numéros gagnants doivent être uniques');
      }

      // Vérifier que les numéros sont dans la plage valide
      if (winningNumbers.some(n => n < 1 || n > 50)) {
        throw new Error('Les numéros doivent être entre 1 et 50');
      }

      // Calculer les statistiques
      const stats = await LottoPrizeService.calculateMatchingStats(lotto.id!, winningNumbers);
      setTicketStats(stats);
      setShowConfirmation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showConfirmation) {
      await calculateStats();
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);

      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      // Vérifier que tous les montants sont renseignés
      const prizeAmounts = Object.entries(prizes).map(([numbers, amount]) => ({
        numbers: parseInt(numbers),
        amount: parseInt(amount.replace(/[^0-9]/g, '')) || 0
      }));

      if (prizeAmounts.some(prize => prize.amount <= 0)) {
        throw new Error('Veuillez définir tous les montants de gains');
      }

      // Calculer le jackpot total
      const totalPrizePool = prizeAmounts.reduce((sum, prize) => sum + prize.amount, 0);

      const drawData = {
        winningNumbers,
        jackpotAmount: totalPrizePool,
        prizeDistribution: prizeAmounts,
        ticketStats
      };

      if (isAdmin) {
        // Pour les admins, calculer directement les gains
        await LottoPrizeService.calculatePrizes(
          lotto.id!,
          winningNumbers,
          totalPrizePool,
          prizeAmounts
        );
        onPrizeCalculated();
      } else {
        // Pour les managers, créer une demande d'approbation
        await LottoPrizeService.createApprovalRequest({
          lottoId: lotto.id!,
          draw: drawData,
          status: 'pending',
          requestedBy: currentUser.uid,
          createdAt: new Date().toISOString()
        });
      }

      onClose();
    } catch (err) {
      console.error('Error submitting prize calculation:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumberChange = (index: number, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 50) {
      const newNumbers = [...winningNumbers];
      newNumbers[index] = numValue;
      setWinningNumbers(newNumbers);
      // Réinitialiser les stats quand les numéros changent
      setTicketStats(null);
      setShowConfirmation(false);
    }
  };

  const handlePrizeChange = (numbers: number, value: string) => {
    // Permettre uniquement les chiffres
    const numericValue = value.replace(/[^0-9]/g, '');
    setPrizes(prev => ({
      ...prev,
      [numbers]: numericValue
    }));
  };

  // Formater l'affichage du montant en CFA
  const formatPrizeDisplay = (value: string) => {
    if (!value) return '';
    const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    return numericValue.toLocaleString('fr-FR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold">Calcul des gains - {lotto.eventName}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Numéros gagnants */}
            <div>
              <h3 className="text-lg font-medium mb-4">Numéros gagnants</h3>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: lotto.numbersToSelect }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={winningNumbers[index] || ''}
                    onChange={(e) => handleNumberChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center"
                    placeholder={(index + 1).toString()}
                    disabled={showConfirmation}
                    maxLength={2}
                  />
                ))}
              </div>
            </div>

            {/* Statistiques des tickets */}
            {ticketStats && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Répartition des tickets</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(ticketStats)
                    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                    .map(([numbers, count]) => (
                      <div key={numbers} className="bg-white p-2 rounded">
                        <div className="text-xs text-gray-600">{numbers} numéro{parseInt(numbers) > 1 ? 's' : ''}</div>
                        <div className="font-bold">{count}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Distribution des gains */}
            {showConfirmation && (
              <div>
                <h3 className="text-lg font-medium mb-4">Montants des gains</h3>
                <div className="space-y-4">
                  {Object.entries(prizes)
                    .sort((a, b) => parseInt(b[0]) - parseInt(a[0])) // Trier par nombre de numéros décroissant
                    .map(([numbers, amount]) => (
                      <div key={numbers} className="flex items-center gap-4">
                        <div className="flex-1">
                          <span className="font-medium">
                            {numbers} numéro{parseInt(numbers) > 1 ? 's' : ''}
                          </span>
                          {ticketStats && (
                            <span className="text-sm text-gray-600 ml-2">
                              ({ticketStats[parseInt(numbers)] || 0} ticket{ticketStats[parseInt(numbers)] !== 1 ? 's' : ''})
                            </span>
                          )}
                        </div>
                        <div className="relative flex-shrink-0">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={amount}
                            onChange={(e) => handlePrizeChange(parseInt(numbers), e.target.value)}
                            className="w-48 px-3 py-2 pr-16 border border-gray-300 rounded-lg text-right"
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                            CFA
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {!isAdmin && showConfirmation && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="font-medium text-yellow-800">Approbation requise</p>
                </div>
                <p className="text-sm text-yellow-700">
                  Les gains proposés devront être validés par un administrateur avant d'être appliqués.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Traitement...' : 
                 !showConfirmation ? 'Vérifier les tickets' :
                 isAdmin ? 'Calculer les gains' : 
                 'Soumettre pour approbation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}