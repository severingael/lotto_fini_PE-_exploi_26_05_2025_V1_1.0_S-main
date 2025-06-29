import React from 'react';
import { Trophy } from 'lucide-react';
import type { AgentCommission } from '../../../services/agent/types';

interface CommissionListProps {
  commissions: AgentCommission[];
}

export default function CommissionList({ commissions }: CommissionListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Commissions</h2>
      <div className="space-y-4">
        {commissions.map((commission) => (
          <div key={commission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">
                  {commission.betType === 'simple' ? 'Paris Simple' : 'Paris Combiné'}
                </p>
                <p className="text-sm text-gray-600">
                  Mis à jour le {new Date(commission.updatedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {commission.percentage}%
            </div>
          </div>
        ))}

        {commissions.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            Aucune commission configurée
          </div>
        )}
      </div>
    </div>
  );
}