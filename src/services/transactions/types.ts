export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  type?: Transaction['type'];
  status?: Transaction['status'];
  startDate?: string;
  endDate?: string;
}