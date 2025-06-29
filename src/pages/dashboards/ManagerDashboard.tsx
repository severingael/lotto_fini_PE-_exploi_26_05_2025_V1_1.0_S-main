import React from 'react';
import { Link } from 'react-router-dom';
import BaseDashboard from './BaseDashboard';
import { Users, BarChart, Settings, TrendingUp } from 'lucide-react';

const stats = [
  { 
    label: 'Agents actifs',
    value: '12',
    change: '+2',
    icon: Users,
    color: 'blue'
  },
  { 
    label: 'Performance moyenne',
    value: '92%',
    change: '+5.2%',
    icon: TrendingUp,
    color: 'green'
  },
  { 
    label: 'Objectifs atteints',
    value: '85%',
    change: '+3.1%',
    icon: BarChart,
    color: 'purple'
  }
];

const quickActions = [
  {
    title: 'Gestion',
    items: [
      { 
        label: 'Équipe',
        description: 'Gérer les membres de l\'équipe',
        path: '/dashboard/manager/team',
        icon: Users,
        color: 'blue'
      },
      { 
        label: 'Performance',
        description: 'Voir les rapports de performance',
        path: '/dashboard/manager/performance',
        icon: BarChart,
        color: 'green'
      }
    ]
  },
  {
    title: 'Configuration',
    items: [
      { 
        label: 'Paramètres',
        description: 'Configurer les préférences',
        path: '/dashboard/manager/settings',
        icon: Settings,
        color: 'purple'
      }
    ]
  }
];

export default function ManagerDashboard() {
  return (
    <BaseDashboard title="Tableau de bord Manager">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quickActions.map((section, index) => (
          <div key={index} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            {section.items.map((action, actionIndex) => (
              <Link
                key={actionIndex}
                to={action.path}
                className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-${action.color}-100 rounded-lg`}>
                    <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{action.label}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Graphique de performance */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Performance de l'équipe</h2>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>3 derniers mois</option>
          </select>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          [Graphique de performance]
        </div>
      </div>
    </BaseDashboard>
  );
}