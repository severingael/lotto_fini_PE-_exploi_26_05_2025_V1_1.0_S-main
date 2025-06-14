import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import LottoTicket from './LottoTicket';
import { LottoParticipation } from '../../../services/lotto/types';

interface TicketGeneratorProps {
  participation: LottoParticipation;
  playerName: string;
  gameParameters: {
    eventName: string;
    numbersToSelect: number;
    endDate: string;
  };
}

export default function TicketGenerator({ 
  participation, 
  playerName,
  gameParameters
}: TicketGeneratorProps) {
  const [error, setError] = useState<string | null>(null);

  const handlePrintTicket = () => {
    try {
      window.print();
    } catch (err) {
      setError('Erreur lors de l\'impression du ticket');
    }
  };

  if (!participation) {
    return null;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="print:m-0">
        <LottoTicket
          ticketNumber={participation.id || ''}
          playerName={playerName}
          selectedNumbers={participation.selectedNumbers}
          ticketPrice={participation.ticketPrice}
          currency={participation.currency}
          purchaseDate={participation.purchaseDate}
          gameParameters={gameParameters}
          onPrintTicket={handlePrintTicket}
        />
      </div>
    </div>
  );
}