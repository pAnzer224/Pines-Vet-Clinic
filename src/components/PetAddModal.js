import React, { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase-config";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";

const PetAddModal = ({ isOpen, onClose, onPetAdded }) => {
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        toast.error("You must be logged in to add a pet");
        onClose();
      }
    });

    return () => unsubscribe();
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("You must be logged in to add a pet");
      return;
    }

    try {
      const newPet = {
        name: petName,
        species: petSpecies,
        breed: petBreed,
        age: parseInt(petAge, 10) || 0,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "pets"), newPet);
      const addedPet = { ...newPet, id: docRef.id };

      onPetAdded(addedPet);

      // Reset form
      setPetName("");
      setPetSpecies("");
      setPetBreed("");
      setPetAge("");

      onClose();
    } catch (error) {
      toast.error("Failed to add pet");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-2xl w-full max-w-md mx-4 p-10">
        <h2 className="text-2xl font-bold text-primary/80 mb-6">Add New Pet</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text/80 mb-2">Pet Name</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="w-full px-4 py-2 border-[1.6px] border-green2 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-text/80 mb-2">Species</label>
            <select
              value={petSpecies}
              onChange={(e) => setPetSpecies(e.target.value)}
              className="w-full px-4 py-2 border-[1.6px] border-green2 rounded-lg"
              required
            >
              <option value="">Select Species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Hamster">Hamster</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-text/80 mb-2">Breed</label>
            <input
              type="text"
              value={petBreed}
              onChange={(e) => setPetBreed(e.target.value)}
              className="w-full px-4 py-2 border-[1.6px] border-green2 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-text/80 mb-2">Age</label>
            <input
              type="number"
              value={petAge}
              onChange={(e) => setPetAge(e.target.value)}
              className="w-full px-4 py-2 border-[1.6px] border-green2 rounded-lg"
              min="0"
              max="30"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-[1.6px] border-green2 rounded-full hover:bg-green3/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green3 border-[1.6px] border-green2 rounded-full hover:bg-green3/80"
            >
              Add Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetAddModal;
