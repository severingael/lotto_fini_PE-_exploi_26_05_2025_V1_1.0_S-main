import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function UsageStats() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Statistiques d'utilisation</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Requêtes aujourd'hui" value="1,234" />
        <StatCard label="Temps moyen" value="45ms" />
        <StatCard label="Disponibilité" value="99.9%" />
      </div>
    </div>
  );
}