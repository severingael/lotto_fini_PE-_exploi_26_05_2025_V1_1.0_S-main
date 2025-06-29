import React, { useState, useEffect } from 'react';
import { Printer, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PrinterStatus() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  const handlePrinterClick = () => {
    // Afficher le tooltip au clic
    setShowTooltip(true);
    
    // Masquer le tooltip après 3 secondes
    setTimeout(() => {
      setShowTooltip(false);
    }, 3000);
  };

  return (
    <div className="relative">
      <button 
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={handlePrinterClick}
        aria-label="Imprimante"
      >
        <Printer className="w-6 h-6 text-gray-600" />
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-3 z-50 text-sm">
          <p className="text-gray-700 mb-2">
            Pour configurer votre imprimante, veuillez contacter l'administrateur du système.
          </p>
        </div>
      )}
    </div>
  );
}