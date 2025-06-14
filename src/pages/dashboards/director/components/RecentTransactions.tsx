import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../../../utils/format';

const transactions = [
  { 
    type: 'deposit',
    amount: 5000,
    user: 'Jean M.',
    time: '10:30',
    status: 'completed'
  },
  { 
    type: 'withdraw',
    amount: 2500,
    user: 'Sophie L.',
    time: '09:45',
    status: 'pending'
  },
  { 
    type: 'deposit',
    amount: 7500,
    user: 'Pierre D.',
    time: '09:15',
    status: 'completed'
  },
  { 
    type: 'withdraw',
    amount: 1000,
    user: 'Marie B.',
    time: '08:30',
    status: 'completed'
  }
];

export default function RecentTransactions() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h2 className="text-base md:text-lg font-semibold">Transactions Récentes</h2>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          Voir tout
        </button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {transactions.map((transaction, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full flex-shrink-0 ${
                transaction.type === 'deposit' 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {transaction.type === 'deposit' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                </p>
                <p className="text-sm text-gray-600">{transaction.user}</p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
              <p className={`font-medium ${
                transaction.type === 'deposit' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {transaction.type === 'deposit' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-sm text-gray-600">{transaction.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}