import React from 'react';
import { Trophy, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Football() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4 pb-20">
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Football</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Info className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Service temporairement indisponible</h2>
          <p className="text-gray-600 mb-6">
            Nous effectuons actuellement une maintenance de notre service de paris sportifs. 
            Les matchs seront de nouveau disponibles très prochainement.
          </p>
          <p className="text-gray-600 mb-6">
            En attendant, nous vous invitons à découvrir notre offre de Lotto.
          </p>
          <Link
            to="/lotto"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Trophy className="w-5 h-5" />
            Découvrir le Lotto
          </Link>
        </div>
      </div>
    </div>
  );
}