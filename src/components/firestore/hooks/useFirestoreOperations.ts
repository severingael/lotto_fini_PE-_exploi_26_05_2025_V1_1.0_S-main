import { useState } from 'react';
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export function useFirestoreOperations(onSuccess: () => Promise<void>) {
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (collectionName: string, docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, collectionName, docId));
      await onSuccess();
    } catch (error) {
      console.error("Error deleting document:", error);
      setError("Failed to delete document. Please try again.");
    }
  };

  const handleUpdate = async (collectionName: string, docId: string, data: string) => {
    try {
      const updatedData = JSON.parse(data);
      await updateDoc(doc(db, collectionName, docId), updatedData);
      await onSuccess();
      return true;
    } catch (error) {
      console.error("Error updating document:", error);
      setError(error instanceof SyntaxError 
        ? "Invalid JSON format. Please check your input." 
        : "Failed to update document. Please try again."
      );
      return false;
    }
  };

  return { handleDelete, handleUpdate, error, setError };
}