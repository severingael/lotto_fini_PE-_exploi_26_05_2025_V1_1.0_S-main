import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useFirestoreData } from './hooks/useFirestoreData';
import { useFirestoreOperations } from './hooks/useFirestoreOperations';
import { EditingState } from './types';
import CollectionList from './components/CollectionList';
import EditModal from './components/EditModal';

export default function FirestoreManager() {
  const { data, loading, error: fetchError, fetchAllCollections } = useFirestoreData();
  const { handleDelete, handleUpdate, error: operationError, setError } = useFirestoreOperations(fetchAllCollections);
  const [expandedCollections, setExpandedCollections] = useState<string[]>([]);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [editedData, setEditedData] = useState<string>('');

  const error = fetchError || operationError;

  useEffect(() => {
    fetchAllCollections();
  }, [fetchAllCollections]);

  const toggleCollection = (collectionName: string) => {
    setExpandedCollections(prev => 
      prev.includes(collectionName)
        ? prev.filter(name => name !== collectionName)
        : [...prev, collectionName]
    );
  };

  const startEditing = (collectionName: string, docId: string, data: object) => {
    setEditing({ collectionName, docId, data });
    setEditedData(JSON.stringify(data, null, 2));
    setError(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    const success = await handleUpdate(editing.collectionName, editing.docId, editedData);
    if (success) {
      setEditing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Firestore Collections</h1>
          <button
            onClick={fetchAllCollections}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <CollectionList
          collections={data}
          expandedCollections={expandedCollections}
          onToggleCollection={toggleCollection}
          onEdit={startEditing}
          onDelete={handleDelete}
        />

        {editing && (
          <EditModal
            editing={editing}
            editedData={editedData}
            onClose={() => setEditing(null)}
            onSave={handleSave}
            onChange={setEditedData}
          />
        )}
      </div>
    </div>
  );
}