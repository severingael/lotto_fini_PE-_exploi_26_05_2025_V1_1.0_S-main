import React from 'react';
import { ToggleRight, ToggleLeft, Users } from 'lucide-react';

interface StaffPaymentPermissionStatsProps {
  totalStaff: number;
  enabledCount: number;
  disabledCount: number;
}

export default function StaffPaymentPermissionStats({ 
  totalStaff, 
  enabledCount, 
  disabledCount 
}: StaffPaymentPermissionStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Staffs</p>
            <p className="text-xl font-bold">{totalStaff}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <ToggleRight className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Paiement activé</p>
            <p className="text-xl font-bold">{enabledCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <ToggleLeft className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Paiement désactivé</p>
            <p className="text-xl font-bold">{disabledCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}