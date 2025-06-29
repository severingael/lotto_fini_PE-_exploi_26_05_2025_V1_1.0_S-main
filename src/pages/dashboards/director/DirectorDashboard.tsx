import React from 'react';
import BaseDashboard from '../BaseDashboard';
import RevenueStats from './components/RevenueStats';
import PerformanceMetrics from './components/PerformanceMetrics';
import AgentPerformance from './components/AgentPerformance';
import RecentTransactions from './components/RecentTransactions';
import RiskAnalysis from './components/RiskAnalysis';

export default function DirectorDashboard() {
  return (
    <BaseDashboard title="Tableau de bord Directeur">
      <div className="space-y-6 p-4 md:p-0">
        {/* Statistiques des revenus */}
        <RevenueStats />

        {/* Métriques de performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <PerformanceMetrics />
          <AgentPerformance />
        </div>

        {/* Transactions et Analyse des risques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <RecentTransactions />
          <RiskAnalysis />
        </div>
      </div>
    </BaseDashboard>
  );
}