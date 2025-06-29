import React from 'react';
import { X, Trophy, Star } from 'lucide-react';
import { LottoDraw } from '../../services/lotto/draw';
import { formatCurrency } from '../../utils/format';

interface DrawResultModalProps {
  draw: LottoDraw;
  onClose: () => void;
}

export default function DrawResultModal({ draw, onClose }: DrawResultModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold">Résultats du tirage</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Numéros gagnants */}
            <div>
              <h3 className="text-lg font-medium mb-4">Numéros gagnants</h3>
              <div className="flex flex-wrap gap-2">
                {draw.winningNumbers.map((number, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center"
                  >
                    <span className="text-lg font-bold text-yellow-700">{number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cagnotte totale */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Cagnotte totale</h4>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(draw.totalPrizePool)}
              </p>
            </div>

            {/* Distribution des gains */}
            <div>
              <h3 className="text-lg font-medium mb-4">Distribution des gains</h3>
              <div className="space-y-3">
                {draw.prizes.map((prize, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{prize.numbers} numéros</span>
                    <span className="text-green-600 font-bold">
                      {formatCurrency(prize.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gagnants */}
            <div>
              <h3 className="text-lg font-medium mb-4">Gagnants</h3>
              {draw.winners.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucun gagnant pour ce tirage
                </p>
              ) : (
                <div className="space-y-3">
                  {draw.winners.map((winner, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">Participant #{index + 1}</span>
                        <p className="text-sm text-gray-600">
                          {winner.matchedNumbers} numéros trouvés
                        </p>
                      </div>
                      <span className="text-green-600 font-bold">
                        {formatCurrency(winner.prize)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}