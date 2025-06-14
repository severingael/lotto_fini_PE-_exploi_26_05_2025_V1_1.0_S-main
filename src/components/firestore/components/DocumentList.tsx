import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { FirestoreData } from '../types';

interface DocumentListProps {
  collectionName: string;
  documents: FirestoreData[];
  onEdit: (collection: string, id: string, data: object) => void;
  onDelete: (collection: string, id: string) => void;
}

export default function DocumentList({
  collectionName,
  documents,
  onEdit,
  onDelete
}: DocumentListProps) {
  return (
    <div className="px-6 pb-6">
      <div className="space-y-4">
        {documents.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                ID: {item.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(collectionName, item.id, item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(collectionName, item.id)}
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
  );
}