import React from 'react';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';

const risks = [
  {
    level: 'high',
    description: 'Paris suspects détectés',
    count: 3,
    change: '+2',
    action: 'Vérification requise'
  },
  {
    level: 'medium',
    description: 'Comptes à surveiller',
    count: 8,
    change: '-1',
    action: 'Surveillance continue'
  },
  {
    level: 'low',
    description: 'Transactions inhabituelles',
    count: 12,
    change: '+4',
    action: 'Analyse recommandée'
  }
];

export default function RiskAnalysis() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-blue-600" />
        <h2 className="text-base md:text-lg font-semibold">Analyse des Risques</h2>
      </div>

      <div className="space-y-3 md:space-y-4">
        {risks.map((risk, index) => (
          <div key={index} className="p-3 md:p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                  risk.level === 'high' ? 'text-red-500' :
                  risk.level === 'medium' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <span className="font-medium">{risk.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{risk.count}</span>
                <span className={`text-sm ${
                  risk.change.startsWith('+') ? 'text-red-500' : 'text-green-500'
                }`}>
                  {risk.change}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-2 sm:gap-0">
              <span className="text-gray-600">{risk.action}</span>
              <button className="text-blue-600 hover:text-blue-700">
                Voir détails
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 md:p-4 bg-yellow-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">Tendance du risque</span>
        </div>
        <p className="text-sm text-yellow-700">
          Le niveau de risque global est en légère augmentation par rapport à la semaine dernière.
          Une vigilance accrue est recommandée.
        </p>
      </div>
    </div>
  );
}