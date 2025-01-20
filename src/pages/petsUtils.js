import { db, auth } from "../firebase-config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";

export const addPet = async (petData) => {
  try {
    if (!auth.currentUser) {
      toast.error("Please log in to add a pet");
      throw new Error("User not authenticated");
    }

    const userId = auth.currentUser.uid;
    const petWithUser = {
      ...petData,
      userId: userId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "pets"), petWithUser);

    return {
      ...petWithUser,
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error adding pet:", error);
    toast.error("Failed to add pet. Please try again.");
    throw error;
  }
};

export const getPets = async () => {
  try {
    if (!auth.currentUser) {
      return [];
    }

    const q = query(
      collection(db, "pets"),
      where("userId", "==", auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(q);

    const pets = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Remove duplicates based on pet name and userId
    const uniquePets = Array.from(
      new Map(pets.map((pet) => [`${pet.name}-${pet.userId}`, pet])).values()
    );

    return uniquePets;
  } catch (error) {
    console.error("Error fetching pets:", error);
    toast.error("Failed to fetch pets. Please try again.");
    return [];
  }
};
