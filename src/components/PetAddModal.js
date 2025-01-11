import React, { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase-config";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import StatusDropdown from "../components/StatusDropdown";
import { X } from "lucide-react";

const PetAddModal = ({ isOpen, onClose, onPetAdded, userId }) => {
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("Select Species");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const speciesOptions = [
    "Select Species",
    "Dog",
    "Cat",
    "Bird",
    "Rabbit",
    "Hamster",
    "Other",
  ];

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

    if (petSpecies === "Select Species") {
      toast.error("Please select a species");
      return;
    }

    try {
      const newPet = {
        name: petName,
        species: petSpecies,
        breed: petBreed,
        age: parseInt(petAge, 10) || 0,
        userId: userId || currentUser.uid,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "pets"), newPet);
      const addedPet = { ...newPet, id: docRef.id };

      onPetAdded(addedPet);
      resetForm();
      onClose();
    } catch (error) {
      toast.error("Failed to add pet");
      console.error(error);
    }
  };

  const resetForm = () => {
    setPetName("");
    setPetSpecies("Select Species");
    setPetBreed("");
    setPetAge("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-text/50 z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-background w-full max-w-md mx-4 rounded-xl shadow-xl relative"
        onClick={handleModalClick}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text/60 hover:text-text transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-nunito-bold text-green2 mb-6">
            Add New Pet
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-nunito-bold mb-1">
                Pet Name
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full p-2 rounded-lg border border-green3/50 focus:border-primary focus:ring-0 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-nunito-bold mb-1">
                Species
              </label>
              <StatusDropdown
                statusOptions={speciesOptions}
                selectedStatus={petSpecies}
                onStatusChange={setPetSpecies}
              />
            </div>

            <div>
              <label className="block text-sm font-nunito-bold mb-1">
                Breed
              </label>
              <input
                type="text"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                className="w-full p-2 rounded-lg border border-green3/50 focus:border-primary focus:ring-0 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-nunito-bold mb-1">Age</label>
              <input
                type="number"
                value={petAge}
                onChange={(e) => setPetAge(e.target.value)}
                className="w-full p-2 rounded-lg border border-green3/50 focus:border-primary focus:ring-0 focus:outline-none"
                min="0"
                max="30"
              />
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full flex items-center justify-center px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-2 bg-primary text-background rounded-full hover:bg-primary/80 transition-colors font-nunito"
              >
                Add Pet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PetAddModal;
