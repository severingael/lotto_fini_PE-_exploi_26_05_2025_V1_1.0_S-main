import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import BaseDashboard from '../BaseDashboard';
import { Search, Edit, AlertCircle, X, Save, Lock, Unlock, Power, PowerOff, UserPlus } from 'lucide-react';
import { UserRole } from '../../../types/auth';
import LoadingState from '../../../components/LoadingState';
import StaffManagementNav from '../../../components/manager/StaffManagementNav';

interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  createdAt?: string;
  lastLogin?: string;
  isBlocked?: boolean;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'blocked';
}

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  blocked: 'bg-red-100 text-red-800'
};

export default function StaffManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    blocked: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'staffuser'));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().isBlocked ? 'blocked' : doc.data().isActive ? 'active' : 'inactive'
      })) as User[];
      
      setUsers(usersData);
      
      // Calculer les statistiques
      const stats = {
        total: usersData.length,
        active: usersData.filter(u => u.status === 'active').length,
        inactive: usersData.filter(u => u.status === 'inactive').length,
        blocked: usersData.filter(u => u.status === 'blocked').length
      };
      
      setUserStats(stats);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    if (!editingUser) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      
      // Pour les managers, on ne permet que la mise à jour du numéro de téléphone
      await updateDoc(userRef, { 
        phoneNumber: editingUser.phoneNumber 
      });
      
      await fetchUsers();
      setEditingUser(null);
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'utilisateur');
      console.error('Error updating user:', err);
    }
  };

  const handleStatusChange = async (userId: string, action: 'block' | 'unblock' | 'activate' | 'deactivate') => {
    try {
      const userRef = doc(db, 'users', userId);
      const updates: Partial<User> = {};
      
      switch (action) {
        case 'block':
          updates.isBlocked = true;
          updates.isActive = false;
          updates.status = 'blocked';
          break;
        case 'unblock':
          updates.isBlocked = false;
          updates.status = 'inactive';
          break;
        case 'activate':
          updates.isActive = true;
          updates.isBlocked = false;
          updates.status = 'active';
          break;
        case 'deactivate':
          updates.isActive = false;
          updates.status = 'inactive';
          break;
      }

      await updateDoc(userRef, updates);
      await fetchUsers();
    } catch (err) {
      setError('Erreur lors de la modification du statut');
      console.error('Error updating status:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.phoneNumber || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <BaseDashboard title="Gestion des Staffs">
        <LoadingState message="Chargement des staffs..." />
      </BaseDashboard>
    );
  }

  return (
    <BaseDashboard title="Gestion des Staffs">
      <StaffManagementNav />
      
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total staffs</p>
            <p className="text-2xl font-bold">{userStats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Actifs</p>
            <p className="text-2xl font-bold">{userStats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Inactifs</p>
            <p className="text-2xl font-bold">{userStats.inactive}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Bloqués</p>
            <p className="text-2xl font-bold">{userStats.blocked}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'blocked')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="blocked">Bloqués</option>
            </select>
          </div>
          <Link
            to="/dashboard/manager/create-staff"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Ajouter un staff
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé le</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="font-medium text-gray-600">
                            {user.email[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingUser?.id === user.id ? (
                        <input
                          type="text"
                          value={editingUser.phoneNumber || ''}
                          onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Téléphone"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">
                          {user.phoneNumber || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status || 'inactive']}`}>
                        {user.status === 'active' ? 'Actif' :
                         user.status === 'blocked' ? 'Bloqué' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {editingUser?.id === user.id ? (
                        <>
                          <button
                            onClick={() => {
                              handleUpdateUser(user.id);
                              setEditingUser(null);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier le téléphone"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          {user.status === 'blocked' ? (
                            <button
                              onClick={() => handleStatusChange(user.id, 'unblock')}
                              className="text-green-600 hover:text-green-900"
                              title="Débloquer"
                            >
                              <Unlock className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(user.id, 'block')}
                              className="text-red-600 hover:text-red-900"
                              title="Bloquer"
                            >
                              <Lock className="w-5 h-5" />
                            </button>
                          )}
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(user.id, 'deactivate')}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Désactiver"
                            >
                              <PowerOff className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(user.id, 'activate')}
                              className="text-green-600 hover:text-green-900"
                              title="Activer"
                            >
                              <Power className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseDashboard>
  );
}