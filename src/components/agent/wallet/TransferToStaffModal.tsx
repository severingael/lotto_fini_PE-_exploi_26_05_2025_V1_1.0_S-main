import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { AgentTransferService } from '../../../services/agent/transfer';
import { formatCurrency } from '../../../utils/format';

interface TransferToStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  agentId: string;
  onTransferComplete?: () => void;
}

export default function TransferToStaffModal({
  isOpen,
  onClose,
  currentBalance,
  agentId,
  onTransferComplete
}: TransferToStaffModalProps) {
  const [amount, setAmount] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculer les frais et le total
  const calculations = React.useMemo(() => {
    const transferAmount = parseFloat(amount) || 0;
    const feeAmount = Math.round((transferAmount * 0.02) * 100) / 100; // 2% arrondi à 2 décimales
    const totalAmount = transferAmount + feeAmount;

    return {
      transferAmount,
      feeAmount,
      totalAmount
    };
  }, [amount]);

  if (!isOpen) return null;

  const handleAmountChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setIsSubmitting(true);

      const { transferAmount, totalAmount } = calculations;

      if (isNaN(transferAmount) || transferAmount <= 0) {
        throw new Error('Montant invalide');
      }

      if (totalAmount > currentBalance) {
        throw new Error('Solde insuffisant');
      }

      if (!staffEmail.trim()) {
        throw new Error('Veuillez saisir l\'email du staff');
      }

      // Valider le format de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(staffEmail)) {
        throw new Error('Format d\'email invalide');
      }

      // Effectuer le transfert en utilisant l'email
      await AgentTransferService.transferToStaffByEmail(agentId, staffEmail, transferAmount);
      
      onTransferComplete?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold">Transférer à un staff</h2>
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email du staff
              </label>
              <input
                type="email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="email.staff@exemple.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant à transférer
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                  disabled={isSubmitting}
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  CFA
                </span>
              </div>
            </div>

            {/* Récapitulatif des frais - Amélioré pour mobile */}
            {calculations.transferAmount > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant du transfert</span>
                  <span>{formatCurrency(calculations.transferAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais (2%)</span>
                  <span>{formatCurrency(calculations.feeAmount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center font-medium">
                  <span>Total à débiter</span>
                  <span>{formatCurrency(calculations.totalAmount)}</span>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-800">Solde disponible</span>
                <span className="font-bold text-blue-800">
                  {formatCurrency(currentBalance)}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !amount || !staffEmail}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Transfert en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Transférer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}