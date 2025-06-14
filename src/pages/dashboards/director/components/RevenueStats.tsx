import React from 'react';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import { formatCurrency } from '../../../../utils/format';

const stats = [
  {
    label: 'Chiffre d\'affaires mensuel',
    value: formatCurrency(1234567),
    change: '+12.5%',
    icon: DollarSign,
    color: 'blue'
  },
  {
    label: 'Marge brute',
    value: formatCurrency(345678),
    change: '+8.2%',
    icon: TrendingUp,
    color: 'green'
  },
  {
    label: 'Nouveaux clients',
    value: '2,847',
    change: '+15.3%',
    icon: Users,
    color: 'purple'
  },
  {
    label: 'Objectifs atteints',
    value: '92%',
    change: '+5.4%',
    icon: Target,
    color: 'yellow'
  }
];

export default function RevenueStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}-600`} />
            </div>
            <span className={`text-${stat.color === 'red' ? 'red' : 'green'}-600 text-sm font-medium`}>
              {stat.change}
            </span>
          </div>
          <h3 className="text-gray-500 text-sm">{stat.label}</h3>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}