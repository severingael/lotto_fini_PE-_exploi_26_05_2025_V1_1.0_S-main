import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AlertCircle, Trash2, RefreshCw, Edit, ChevronDown, ChevronUp, Save, X } from 'lucide-react';

// TypeScript types
interface FirestoreData {
  id: string;
  [key: string]: any;
}

interface CollectionData {
  collectionName: string;
  data: FirestoreData[];
}

interface EditingState {
  collectionName: string;
  docId: string;
  data: object;
}

const FirestoreManager: React.FC = () => {
  const [data, setData] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCollections, setExpandedCollections] = useState<string[]>([]);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [editedData, setEditedData] = useState<string>('');

  const collections = [
    "betting_config",
    "lotto_draws",
    "lotto_participations",
    "lotto_prizes",
    "lottos",
    "odds_config",
    "referral_codes",
    "site_config",
    "sports_config",
    "users",
  ];

  const fetchAllCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const allData: CollectionData[] = [];

      for (const collectionName of collections) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const collectionData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        allData.push({ collectionName, data: collectionData });
      }

      setData(allData);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError("Failed to load collections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (collectionName: string, docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, collectionName, docId));
      await fetchAllCollections();
    } catch (error) {
      console.error("Error deleting document:", error);
      setError("Failed to delete document. Please try again.");
    }
  };

  const handleUpdate = async (collectionName: string, docId: string) => {
    try {
      const updatedData = JSON.parse(editedData);
      await updateDoc(doc(db, collectionName, docId), updatedData);
      setEditing(null);
      await fetchAllCollections();
    } catch (error) {
      console.error("Error updating document:", error);
      setError(error instanceof SyntaxError 
        ? "Invalid JSON format. Please check your input." 
        : "Failed to update document. Please try again."
      );
    }
  };

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
  };

  useEffect(() => {
    fetchAllCollections();
  }, []);

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

        <div className="space-y-4">
          {data.map((collectionData) => (
            <div key={collectionData.collectionName} className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => toggleCollection(collectionData.collectionName)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {collectionData.collectionName}
                  </h2>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                    {collectionData.data.length} documents
                  </span>
                </div>
                {expandedCollections.includes(collectionData.collectionName) 
                  ? <ChevronUp className="w-5 h-5 text-gray-500" />
                  : <ChevronDown className="w-5 h-5 text-gray-500" />
                }
              </button>

              {expandedCollections.includes(collectionData.collectionName) && (
                <div className="px-6 pb-6">
                  <div className="space-y-4">
                    {collectionData.data.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                            ID: {item.id}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditing(collectionData.collectionName, item.id, item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(collectionData.collectionName, item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Edit Document - {editing.collectionName}
                </h3>
                <button
                  onClick={() => setEditing(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <textarea
                value={editedData}
                onChange={(e) => setEditedData(e.target.value)}
                className="w-full h-96 font-mono text-sm p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate(editing.collectionName, editing.docId)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirestoreManager;