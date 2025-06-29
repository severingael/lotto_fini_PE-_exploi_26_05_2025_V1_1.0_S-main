import React, { useState } from 'react';
import { Wallet, CreditCard, Phone, AlertCircle, Info } from 'lucide-react';
import BaseDashboard from '../dashboards/BaseDashboard';
import { formatCurrency } from '../../utils/format';

const WITHDRAWAL_METHODS = [
  {
    id: 'bank',
    name: 'Virement bancaire',
    icon: CreditCard,
    minAmount: 50,
    maxAmount: 10000,
    fees: 0,
    processingTime: '2-3 jours ouvrés'
  },
  {
    id: 'mobile',
    name: 'Mobile Money',
    icon: Phone,
    minAmount: 10,
    maxAmount: 1000,
    fees: 1,
    processingTime: 'Instantané'
  }
];

export default function Withdraw() {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(WITHDRAWAL_METHODS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solde disponible (à remplacer par la vraie valeur)
  const availableBalance = 1500;

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

      const withdrawalAmount = parseFloat(amount);
      if (isNaN(withdrawalAmount) || withdrawalAmount < selectedMethod.minAmount) {
        throw new Error(`Le montant minimum est de ${formatCurrency(selectedMethod.minAmount)}`);
      }

      if (withdrawalAmount > selectedMethod.maxAmount) {
        throw new Error(`Le montant maximum est de ${formatCurrency(selectedMethod.maxAmount)}`);
      }

      if (withdrawalAmount > availableBalance) {
        throw new Error('Solde insuffisant');
      }

      // TODO: Implémenter la logique de retrait
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Réinitialiser le formulaire
      setAmount('');
      setIsSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  };

  const calculateFees = () => {
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount)) return 0;
    return (withdrawalAmount * selectedMethod.fees) / 100;
  };

  const calculateTotal = () => {
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount)) return 0;
    return withdrawalAmount - calculateFees();
  };

  return (
    <BaseDashboard title="Retrait">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Effectuer un retrait</h2>
              <p className="text-sm text-gray-600">
                Choisissez votre méthode de retrait préférée
              </p>
            </div>
          </div>

          {/* Solde disponible */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">Solde disponible</span>
              <span className="font-bold text-blue-800">{formatCurrency(availableBalance)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Méthodes de retrait */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WITHDRAWAL_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedMethod.id === method.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <method.icon className={`w-6 h-6 ${
                      selectedMethod.id === method.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="text-left">
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-gray-600">
                        {method.fees > 0 ? `Frais: ${method.fees}%` : 'Sans frais'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant du retrait
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Min: ${formatCurrency(selectedMethod.minAmount)} - Max: ${formatCurrency(selectedMethod.maxAmount)}`}
                  disabled={isSubmitting}
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  CFA
                </span>
              </div>
            </div>

            {/* Récapitulatif */}
            {amount && !isNaN(parseFloat(amount)) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Montant du retrait</span>
                    <span>{formatCurrency(parseFloat(amount))}</span>
                  </div>
                  {selectedMethod.fees > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frais ({selectedMethod.fees}%)</span>
                      <span>{formatCurrency(calculateFees())}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                    <span>Montant à recevoir</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Informations sur le délai */}
            <div className="bg-yellow-50 rounded-lg p-4 flex items-center gap-3">
              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800">
                  Délai de traitement : {selectedMethod.processingTime}
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Traitement en cours...' : 'Effectuer le retrait'}
            </button>
          </form>
        </div>
      </div>
    </BaseDashboard>
  );
}