import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase-config";

const useFirestoreCrud = (collectionName, options = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to collection changes
  useEffect(() => {
    let q = collection(db, collectionName);

    // Apply query options if provided
    if (options.orderBy) {
      q = query(
        q,
        orderBy(options.orderBy.field, options.orderBy.direction || "desc")
      );
    }
    if (options.where) {
      q = query(
        q,
        where(options.where.field, options.where.operator, options.where.value)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(fetchedItems);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, options.orderBy, options.where]);

  // Create
  const createItem = async (data) => {
    try {
      const collectionRef = collection(db, collectionName);
      const docData = {
        ...data,
        createdAt: Timestamp.now(),
      };
      const docRef = await addDoc(collectionRef, docData);
      return { id: docRef.id, ...docData };
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Update
  const updateItem = async (id, data) => {
    try {
      const docRef = doc(db, collectionName, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(docRef, updateData);
      return { id, ...updateData };
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Delete
  const deleteItem = async (id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Delete multiple related documents
  const deleteRelatedDocs = async (id, relatedCollections) => {
    try {
      const deletePromises = [deleteItem(id)];

      for (const relatedCollection of relatedCollections) {
        const q = query(
          collection(db, relatedCollection.name),
          where(relatedCollection.foreignKey, "==", id)
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach((doc) => {
          deletePromises.push(deleteDoc(doc.ref));
        });
      }

      await Promise.all(deletePromises);
      return id;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    deleteRelatedDocs,
  };
};

export default useFirestoreCrud;
