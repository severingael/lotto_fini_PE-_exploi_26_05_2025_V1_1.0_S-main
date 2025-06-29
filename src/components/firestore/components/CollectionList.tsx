import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CollectionData } from '../types';
import DocumentList from './DocumentList';

interface CollectionListProps {
  collections: CollectionData[];
  expandedCollections: string[];
  onToggleCollection: (name: string) => void;
  onEdit: (collection: string, id: string, data: object) => void;
  onDelete: (collection: string, id: string) => void;
}

export default function CollectionList({
  collections,
  expandedCollections,
  onToggleCollection,
  onEdit,
  onDelete
}: CollectionListProps) {
  return (
    <div className="space-y-4">
      {collections.map((collectionData) => (
        <div key={collectionData.collectionName} className="bg-white rounded-lg shadow-sm">
          <button
            onClick={() => onToggleCollection(collectionData.collectionName)}
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
            <DocumentList
              collectionName={collectionData.collectionName}
              documents={collectionData.data}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </div>
      ))}
    </div>
  );
}