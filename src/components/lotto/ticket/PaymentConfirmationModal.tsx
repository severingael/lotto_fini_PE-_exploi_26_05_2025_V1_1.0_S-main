import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, AlertTriangle, X } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  amount: number;
  currency: string;
  isSubmitting: boolean;
  error?: string | null;
  ticketNumber?: string;
}

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  amount,
  currency,
  isSubmitting,
  error,
  ticketNumber
}: PaymentConfirmationModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      // Si pas d'erreur, rediriger vers la page de succès avec les informations nécessaires
      navigate('/payment-success', {
        state: {
          amount,
          ticketNumber
        }
      });
    } catch (err) {
      // L'erreur sera gérée par le composant parent
      console.error('Payment error:', err);
    }
  };

  // Si c'est une erreur de limite de paiement, afficher un bouton pour rediriger
  const isLimitError = error && error.includes('dépasse votre limite de paiement');
  
  // Extraire la limite du message d'erreur si c'est une erreur de limite
  const getLimitFromError = () => {
    if (!error) return 0;
    const match = error.match(/autorisée de (\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const handleLimitExceeded = () => {
    navigate('/payment-limit-exceeded', {
      state: {
        amount,
        limit: getLimitFromError(),
        ticketNumber
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Confirmation de paiement</h2>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(amount, currency)}
              </p>
              <p className="text-gray-600">Montant à payer en espèces</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                Assurez-vous d'avoir le montant exact en espèces avant de confirmer le paiement.
                Cette action est irréversible.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            
            {isLimitError ? (
              <button
                onClick={handleLimitExceeded}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Voir les détails
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Paiement...' : 'Confirmer le paiement'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}