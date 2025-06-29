import { useState, useCallback } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { CollectionData, COLLECTIONS } from '../types';

export function useFirestoreData() {
  const [data, setData] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allData: CollectionData[] = [];

      for (const collectionName of COLLECTIONS) {
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
  }, []);

  return { data, loading, error, fetchAllCollections };
}