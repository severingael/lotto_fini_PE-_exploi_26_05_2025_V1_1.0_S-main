import React, { useState, useEffect } from 'react';
import { CommissionService } from '../../../services/admin/commission';
import BaseDashboard from '../BaseDashboard';
import CommissionList from '../../../components/admin/commission/CommissionList';
import CommissionForm from '../../../components/admin/commission/CommissionForm';
import LoadingState from '../../../components/LoadingState';
import { AlertCircle } from 'lucide-react';

interface Commission {
  id: string;
  betType: string;
  percentage: number;
  updatedAt: string;
}

export default function AgentCommissionConfig() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CommissionService.getCommissions();
      console.log('Loaded commissions:', data); // Debug log
      setCommissions(data);
    } catch (err) {
      console.error('Error loading commissions:', err);
      setError('Erreur lors du chargement des commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCommission = async (percentage: number) => {
    if (!selectedCommission) return;

    try {
      setError(null);
      await CommissionService.updateCommission(selectedCommission.betType, percentage);
      await loadCommissions();
      setSelectedCommission(null);
    } catch (err) {
      console.error('Error updating commission:', err);
      throw new Error('Erreur lors de la mise à jour de la commission');
    }
  };

  if (loading) {
    return (
      <BaseDashboard title="Configuration des Commissions">
        <LoadingState message="Chargement des commissions..." />
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Configuration des Commissions">
      <div className="max-w-3xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {selectedCommission ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">
              Modifier la commission - {selectedCommission.betType === 'simple' ? 'Paris Simple' : 'Paris Combiné'}
            </h2>
            <CommissionForm
              betType={selectedCommission.betType}
              currentPercentage={selectedCommission.percentage}
              onSave={handleSaveCommission}
            />
          </div>
        ) : (
          <CommissionList
            commissions={commissions}
            onEdit={setSelectedCommission}
          />
        )}
      </div>
    </BaseDashboard>
  );
}