import React from 'react';
import BaseDashboard from './BaseDashboard';
import { FileText, Users, Trophy, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StaffDashboard() {
  const stats = [
    { label: 'Tickets ouverts', value: '23', icon: FileText },
    { label: 'Clients actifs', value: '156', icon: Users },
    { label: 'Participants Lotto', value: '45', icon: Trophy },
    { label: 'Temps moyen', value: '15min', icon: Clock },
  ];

  const quickActions = [
    { 
      label: 'Voir les participants', 
      path: '/dashboard/staff/lotto-participants',
      icon: Trophy,
      color: 'blue'
    },
    { 
      label: 'Gérer les tickets', 
      path: '/dashboard/staff/tickets',
      icon: FileText,
      color: 'green'
    },
    { 
      label: 'Liste des clients', 
      path: '/dashboard/staff/clients',
      icon: Users,
      color: 'purple'
    }
  ];

  return (
    <BaseDashboard title="Tableau de bord Staff">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-${action.color}-100 rounded-lg`}>
                <action.icon className={`w-6 h-6 text-${action.color}-600`} />
              </div>
              <span className="font-medium text-gray-900">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </BaseDashboard>
  );
}