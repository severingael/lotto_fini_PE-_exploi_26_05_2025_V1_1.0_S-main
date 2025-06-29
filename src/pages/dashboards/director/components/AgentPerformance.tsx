import React from 'react';
import { Users, Award } from 'lucide-react';

const agents = [
  { name: 'Jean Dupont', performance: 95, revenue: '125K€', clients: 234 },
  { name: 'Marie Martin', performance: 88, revenue: '98K€', clients: 187 },
  { name: 'Pierre Durand', performance: 92, revenue: '112K€', clients: 205 },
  { name: 'Sophie Bernard', performance: 85, revenue: '78K€', clients: 156 }
];

export default function AgentPerformance() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-blue-600" />
        <h2 className="text-base md:text-lg font-semibold">Performance des Agents</h2>
      </div>

      <div className="space-y-3 md:space-y-4">
        {agents.map((agent, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
              <div className="flex items-center gap-2 mb-1 sm:mb-0">
                {index === 0 && <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                <span className="font-medium truncate">{agent.name}</span>
              </div>
              <span className="text-sm text-gray-600">{agent.revenue}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-600 mb-2">
              <span>{agent.clients} clients</span>
              <span>{agent.performance}% objectifs</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${agent.performance}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}