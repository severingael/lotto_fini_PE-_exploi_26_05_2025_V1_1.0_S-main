import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, AlertCircle } from 'lucide-react';
import BaseDashboard from '../dashboards/BaseDashboard';
import { useLottoParticipants } from '../../hooks/useLottoParticipants';
import { useLottoPayment } from '../../hooks/useLottoPayment';
import { useTicketScanner } from '../../hooks/useTicketScanner';
import { useAuth } from '../../contexts/AuthContext';
import LoadingState from '../../components/LoadingState';
import ErrorAlert from '../../components/ErrorAlert';
import TicketList from '../../components/lotto/ticket/TicketList';
import ScannerModal from '../../components/lotto/ticket/ScannerModal';
import TicketModal from '../../components/lotto/ticket/TicketModal';
import PaymentConfirmationModal from '../../components/lotto/ticket/PaymentConfirmationModal';
import TicketSearch from '../../components/lotto/ticket/TicketSearch';
import type { LottoParticipation } from '../../services/lotto/types';

export default function LottoTickets() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { participants, loading, error: fetchError, cancelParticipation } = useLottoParticipants();
  const { processPayment, isSubmitting, error: paymentError, setError } = useLottoPayment();
  const [ticketNumber, setTicketNumber] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<LottoParticipation | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [ticketToCancel, setTicketToCancel] = useState<LottoParticipation | null>(null);
  
  const {
    showScanner,
    setShowScanner,
    scanError,
    scannedParticipation,
    setScannedParticipation,
    handleScan
  } = useTicketScanner(participants);

  const filteredParticipations = participants.filter(participation => {
    if (!ticketNumber) return true;
    return participation.id?.toLowerCase().includes(ticketNumber.toLowerCase());
  });

  const handlePayWinnings = (ticket: LottoParticipation) => {
    setSelectedTicket(ticket);
    setShowPaymentModal(true);
  };

  const handleCancelTicket = async (ticket: LottoParticipation) => {
    // Vérifier si l'agent est le créateur du ticket
    if (ticket.userId !== currentUser?.uid) {
      navigate('/unauthorized-cancel', { 
        state: { ticketNumber: ticket.id }
      });
      return;
    }

    setTicketToCancel(ticket);
    setShowCancelConfirmation(true);
  };

  const confirmCancellation = async () => {
    if (!ticketToCancel?.id || !currentUser) return;

    try {
      await cancelParticipation(ticketToCancel.id, currentUser.uid);
      // Rediriger vers la page de succès avec l'ID du ticket
      navigate('/cancellation-success', { 
        state: { ticketNumber: ticketToCancel.id }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'annulation");
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedTicket) return;

    try {
      const success = await processPayment(selectedTicket);
      if (success) {
        setShowPaymentModal(false);
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du paiement');
    }
  };

  if (loading) {
    return (
      <BaseDashboard title="Tickets Lotto">
        <LoadingState message="Chargement des tickets..." />
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Tickets Lotto">
      <div className="space-y-6">
        {/* Barre de recherche et scan */}
        <div className="flex flex-col md:flex-row gap-4">
          <TicketSearch 
            value={ticketNumber}
            onChange={setTicketNumber}
          />
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <QrCode className="w-5 h-5" />
            Scanner un ticket
          </button>
        </div>

        {/* Messages d'erreur */}
        {fetchError && <ErrorAlert message={fetchError} />}
        {scanError && <ErrorAlert message={scanError} />}
        {paymentError && <ErrorAlert message={paymentError} />}

        {/* Liste des tickets */}
        <TicketList 
          tickets={filteredParticipations}
          onViewTicket={setScannedParticipation}
          onPayWinnings={handlePayWinnings}
          onCancelTicket={handleCancelTicket}
        />

        {/* Modals */}
        <ScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleScan}
          error={scanError}
        />

        {scannedParticipation && (
          <TicketModal
            isOpen={true}
            onClose={() => setScannedParticipation(null)}
            participation={scannedParticipation}
            playerName="Client"
            gameParameters={{
              eventName: "Lotto",
              numbersToSelect: scannedParticipation.selectedNumbers.length,
              endDate: new Date().toISOString()
            }}
          />
        )}

        {selectedTicket && showPaymentModal && (
          <PaymentConfirmationModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedTicket(null);
              setError(null);
            }}
            onConfirm={handleConfirmPayment}
            amount={selectedTicket.winAmount || 0}
            currency={selectedTicket.currency}
            isSubmitting={isSubmitting}
            error={paymentError}
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
                    setTicketToCancel(null);
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
      </div>
    </BaseDashboard>
  );
}