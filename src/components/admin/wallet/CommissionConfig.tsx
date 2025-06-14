import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import type { AgentCommission } from '../../../services/agent/types';

interface CommissionConfigProps {
  commissions: AgentCommission[];
  onSave: (betType: string, percentage: number) => Promise<void>;
}

export default function CommissionConfig({ commissions, onSave }: CommissionConfigProps) {
  const [editingCommission, setEditingCommission] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (commission: AgentCommission) => {
    setEditingCommission(commission.betType);
    setPercentage(commission.percentage.toString());
    setError(null);
  };

  const handleSave = async (betType: string) => {
    try {
      setError(null);
      setIsSubmitting(true);

      const value = parseFloat(percentage);
      if (isNaN(value) || value < 0 || value > 100) {
        throw new Error('Le pourcentage doit être entre 0 et 100');
      }

      await onSave(betType, value);
      setEditingCommission(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Configuration des commissions</h2>
      
      <div className="space-y-4">
        {commissions.map((commission) => (
          <div key={commission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">
                {commission.betType === 'simple' ? 'Paris Simple' : 'Paris Combiné'}
              </p>
              <p className="text-sm text-gray-600">
                Dernière mise à jour: {new Date(commission.updatedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            {editingCommission === commission.betType ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={percentage}
                  onChange={(e) => {
                    if (/^\d*\.?\d*$/.test(e.target.value)) {
                      setPercentage(e.target.value);
                    }
                  }}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                  placeholder="0-100"
                />
                <span className="text-gray-600">%</span>
                <button
                  onClick={() => handleSave(commission.betType)}
                  disabled={isSubmitting}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                >
                  <Save className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-blue-600">
                  {commission.percentage}%
                </span>
                <button
                  onClick={() => handleEdit(commission)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}