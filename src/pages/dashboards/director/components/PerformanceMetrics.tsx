import React from 'react';
import { BarChart, TrendingUp } from 'lucide-react';

const metrics = [
  { label: 'Taux de conversion', value: '8.5%', target: '10%', progress: 85 },
  { label: 'Rétention client', value: '75%', target: '80%', progress: 94 },
  { label: 'Marge moyenne', value: '22%', target: '25%', progress: 88 },
  { label: 'Satisfaction client', value: '4.2/5', target: '4.5/5', progress: 93 }
];

export default function PerformanceMetrics() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart className="w-5 h-5 text-blue-600" />
        <h2 className="text-base md:text-lg font-semibold">Métriques de Performance</h2>
      </div>

      <div className="space-y-4 md:space-y-6">
        {metrics.map((metric, index) => (
          <div key={index}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
              <span className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">{metric.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {metric.value} / {metric.target}
                </span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metric.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}