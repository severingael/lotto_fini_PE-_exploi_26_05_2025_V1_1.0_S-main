import React, { useState } from 'react';
import { Search, Calendar, AlertCircle } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import { useLottoParticipants } from '../../../hooks/useLottoParticipants';
import LoadingState from '../../../components/LoadingState';
import ParticipantsList from '../../../components/agent/ParticipantsList';
import TicketModal from '../../../components/lotto/ticket/TicketModal';
import type { LottoParticipation } from '../../../services/lotto/types';

export default function LottoParticipants() {
  const { participants, loading, error, cancelParticipation } = useLottoParticipants();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedParticipation, setSelectedParticipation] = useState<LottoParticipation | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [participationToCancel, setParticipationToCancel] = useState<LottoParticipation | null>(null);

  const handleViewTicket = (participation: LottoParticipation) => {
    setSelectedParticipation(participation);
    setShowTicketModal(true);
  };

  const handleCancelTicket = async (participation: LottoParticipation) => {
    setParticipationToCancel(participation);
    setShowCancelConfirmation(true);
  };

  const confirmCancellation = async () => {
    if (!participationToCancel?.id) return;
    
    try {
      await cancelParticipation(participationToCancel.id);
      setShowCancelConfirmation(false);
      setParticipationToCancel(null);
    } catch (err) {
      console.error('Error canceling participation:', err);
    }
  };

  if (loading) {
    return (
      <BaseDashboard title="Participants aux Lottos">
        <LoadingState message="Chargement des participants..." />
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Participants aux Lottos">
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un participant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
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
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <ParticipantsList 
        participants={participants}
        searchTerm={searchTerm}
        dateFilter={dateFilter}
        onViewTicket={handleViewTicket}
        onCancelTicket={handleCancelTicket}
      />

      {selectedParticipation && showTicketModal && (
        <TicketModal
          isOpen={showTicketModal}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedParticipation(null);
          }}
          participation={selectedParticipation}
          playerName="Client"
          gameParameters={{
            eventName: "Lotto",
            numbersToSelect: selectedParticipation.selectedNumbers.length,
            endDate: new Date().toISOString()
          }}
        />
      )}

      {/* Modal de confirmation d'annulation */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Confirmer l'annulation</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir annuler ce ticket ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowCancelConfirmation(false);
                  setParticipationToCancel(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={confirmCancellation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseDashboard>
  );
}