import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Ticket, AlertCircle } from 'lucide-react';
import { LottoEvent } from '../../services/lotto';
import LottoGrid from './LottoGrid';
import TicketModal from './ticket/TicketModal';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';

interface ParticipationModalProps {
  lotto: LottoEvent;
  onClose: () => void;
  onSubmit: (numbers: number[]) => Promise<string>;
}

export default function ParticipationModal({ lotto, onClose, onSubmit }: ParticipationModalProps) {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [participation, setParticipation] = useState<any | null>(null);

  const handleGridSubmit = async (selectedNumbers: number[]) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Vérifications supplémentaires
      if (selectedNumbers.length !== lotto.numbersToSelect) {
        throw new Error(`Veuillez sélectionner exactement ${lotto.numbersToSelect} numéros`);
      }

      // Vérifier que les numéros sont uniques
      const uniqueNumbers = new Set(selectedNumbers);
      if (uniqueNumbers.size !== selectedNumbers.length) {
        throw new Error('Les numéros doivent être uniques');
      }

      // Vérifier que les numéros sont dans la plage valide
      if (selectedNumbers.some(n => n < 1 || n > 50)) {
        throw new Error('Les numéros doivent être entre 1 et 50');
      }

      const participationId = await onSubmit(selectedNumbers);
      
      // Créer l'objet participation
      const newParticipation = {
        id: participationId,
        lottoId: lotto.id!,
        selectedNumbers,
        ticketPrice: lotto.ticketPrice,
        currency: lotto.currency,
        purchaseDate: new Date().toISOString()
      };

      setParticipation(newParticipation);
      setShowTicketModal(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation');
      console.error('Error submitting numbers:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200 z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">{lotto.eventName}</h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Prix du ticket: {formatCurrency(lotto.ticketPrice, lotto.currency)}
                  </p>
                </div>
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

          <div className="p-4 sm:p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                Sélectionnez {lotto.numbersToSelect} numéros différents entre 1 et 50 pour participer au tirage.
              </p>
            </div>

            <LottoGrid
              numbersToSelect={lotto.numbersToSelect}
              onSubmit={handleGridSubmit}
              disabled={isSubmitting}
              ticketPrice={lotto.ticketPrice}
            />
          </div>
        </div>
      </div>

      {participation && showTicketModal && (
        <TicketModal
          isOpen={showTicketModal}
          onClose={() => {
            setShowTicketModal(false);
            onClose();
            
            // Rediriger vers la page appropriée après la fermeture
            const basePath = userData?.role === 'staffuser' ? '/dashboard/staff' : '/dashboard/agent';
            navigate(`${basePath}/lotto-tickets`);
          }}
          participation={participation}
          playerName="Client"
          gameParameters={{
            eventName: lotto.eventName,
            numbersToSelect: lotto.numbersToSelect,
            endDate: lotto.endDate
          }}
          autoPrint={true}
        />
      )}
    </>
  );
}