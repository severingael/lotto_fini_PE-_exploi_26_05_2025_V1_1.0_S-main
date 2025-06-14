import React, { useState } from 'react';
import { Search, Calendar, AlertCircle } from 'lucide-react';
import BaseDashboard from '../BaseDashboard';
import { useLottoParticipants } from '../../../hooks/useLottoParticipants';
import LoadingState from '../../../components/LoadingState';
import { useAuth } from '../../../contexts/AuthContext';

export default function LottoParticipants() {
  const { currentUser } = useAuth();
  const { participants, loading, error } = useLottoParticipants();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Filtrer uniquement les participations de l'utilisateur courant
  const userParticipations = participants.filter(p => p.userId === currentUser?.uid);

  if (loading) {
    return (
      <BaseDashboard title="Mes Participations">
        <LoadingState message="Chargement de vos participations..." />
      </BaseDashboard>
    );
  }

  const filteredParticipations = userParticipations.filter(participation => {
    const matchesDate = !dateFilter || participation.purchaseDate.startsWith(dateFilter);
    return matchesDate;
  });

  return (
    <BaseDashboard title="Mes Participations">
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-48">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Montant</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Numéros joués</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredParticipations.map((participation) => (
                <tr key={participation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(participation.purchaseDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: participation.currency
                    }).format(participation.ticketPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {participation.selectedNumbers.map((number, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      En attente
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BaseDashboard>
  );
}