import React from 'react';
import { Eye, User, Ticket, XCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { differenceInMinutes } from 'date-fns';

interface Participant {
  id: string;
  userId: string;
  lottoId: string;
  selectedNumbers: number[];
  purchaseDate: string;
  ticketPrice: number;
  currency: string;
}

interface ParticipantsListProps {
  participants: Participant[];
  searchTerm: string;
  dateFilter: string;
  onViewTicket: (participant: Participant) => void;
  onCancelTicket?: (participant: Participant) => void;
}

const CANCELLATION_WINDOW_MINUTES = 15;

export default function ParticipantsList({
  participants,
  searchTerm,
  dateFilter,
  onViewTicket,
  onCancelTicket
}: ParticipantsListProps) {
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || participant.purchaseDate.startsWith(dateFilter);
    return matchesSearch && matchesDate;
  });

  const canCancel = (purchaseDate: string) => {
    const now = new Date();
    const purchaseTime = new Date(purchaseDate);
    const minutesSinceSubmission = differenceInMinutes(now, purchaseTime);
    return minutesSinceSubmission <= CANCELLATION_WINDOW_MINUTES;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ID Participant</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Lotto</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Montant</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Numéros</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredParticipants.map((participant) => {
              const isCancellable = canCancel(participant.purchaseDate);
              
              return (
                <tr key={participant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium">{participant.userId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{participant.lottoId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(participant.purchaseDate).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(participant.ticketPrice, participant.currency)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {participant.selectedNumbers.map((number, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onViewTicket(participant)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir le ticket"
                      >
                        <Ticket className="w-5 h-5" />
                      </button>
                      {onCancelTicket && isCancellable && (
                        <button
                          onClick={() => onCancelTicket(participant)}
                          className="text-red-600 hover:text-red-900"
                          title="Annuler le ticket (possible dans les 15 minutes)"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}