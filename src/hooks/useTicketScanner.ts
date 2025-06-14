import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { LottoParticipation } from '../services/lotto/types';

export function useTicketScanner(participants: LottoParticipation[]) {
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedParticipation, setScannedParticipation] = useState<LottoParticipation | null>(null);
  const [scannedTicketId, setScannedTicketId] = useState<string | null>(null);

  const handleScan = async (data: string) => {
    try {
      setScanError(null);
      
      // Check if the scanned data is valid
      if (!data || typeof data !== 'string') {
        throw new Error('Code QR invalide');
      }
      
      let ticketId = data.trim();
      
      // First, try to parse as JSON in case it's a QR code with ticket data
      try {
        const ticketData = JSON.parse(data);
        if (ticketData.ticketNumber) {
          // If it's a JSON with ticketNumber, use that as the document ID
          ticketId = ticketData.ticketNumber;
        }
      } catch (e) {
        // Not JSON, assume it's a direct document ID
        console.log('Not JSON data, using as document ID:', ticketId);
      }
      
      // Set the scanned ticket ID for search
      setScannedTicketId(ticketId);
      
      // Close the scanner
      setShowScanner(false);
    } catch (err) {
      console.error('Error scanning ticket:', err);
      setScanError(err instanceof Error ? err.message : 'Erreur lors du scan');
    }
  };

  return {
    showScanner,
    setShowScanner,
    scanError,
    scannedParticipation,
    setScannedParticipation,
    scannedTicketId,
    setScannedTicketId,
    handleScan,
    setScanError
  };
}