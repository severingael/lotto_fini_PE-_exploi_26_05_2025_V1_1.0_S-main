import React from 'react';
import { AlertCircle } from 'lucide-react';
import { BettingService, CombinedBetsConfig } from '../../services/betting';

interface BetValidationProps {
  bet: any;
  config: CombinedBetsConfig;
}

export default function BetValidation({ bet, config }: BetValidationProps) {
  const error = BettingService.validateCombinedBet(bet, config);

  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
}