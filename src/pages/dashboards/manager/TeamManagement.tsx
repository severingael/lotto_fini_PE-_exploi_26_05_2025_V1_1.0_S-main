import React from 'react';
import BaseDashboard from '../BaseDashboard';
import { Users, Star, TrendingUp } from 'lucide-react';

const teamMembers = [
  { 
    name: 'Jean Dupont',
    role: 'Agent Senior',
    performance: 95,
    clients: 234,
    revenue: '125K€'
  },
  { 
    name: 'Marie Martin',
    role: 'Agent',
    performance: 88,
    clients: 187,
    revenue: '98K€'
  },
  { 
    name: 'Pierre Durand',
    role: 'Agent Senior',
    performance: 92,
    clients: 205,
    revenue: '112K€'
  }
];

export default function TeamManagement() {
  return (
    <BaseDashboard title="Gestion de l'Équipe">
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="font-medium">Membres actifs</h3>
            </div>
            <p className="text-2xl font-bold">12</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <h3 className="font-medium">Performance moyenne</h3>
            </div>
            <p className="text-2xl font-bold">92%</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="font-medium">Chiffre d'affaires</h3>
            </div>
            <p className="text-2xl font-bold">335K€</p>
          </div>
        </div>

        {/* Liste des membres */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Membres de l'équipe</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nom</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Rôle</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Performance</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Clients</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">CA</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamMembers.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="font-medium text-gray-600">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {member.role}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${member.performance}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {member.performance}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {member.clients}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {member.revenue}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseDashboard>
  );
}