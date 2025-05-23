import React, { useState, useEffect, useRef } from "react";
import { X, Edit, Trash2, Users, PlusCircle, ChevronRight } from "lucide-react";
import {
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase-config";
// Fix: Import PetAddModal at the component level
import PetAddModal from "../../components/PetAddModal";

function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
  onEditCustomer,
  onDeleteCustomer,
  onAddPet,
  onDeletePet,
  hideAddPet = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState(customer);
  const [showAllPets, setShowAllPets] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [pets, setPets] = useState([]);
  // Add state for pet modal
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (customer?.id) {
      const petsRef = collection(db, "pets");
      const petsQuery = query(petsRef, where("userId", "==", customer.id));

      const unsubscribe = onSnapshot(petsQuery, (snapshot) => {
        const petsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPets(petsData);
      });

      return () => unsubscribe();
    }
  }, [customer?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete customer ${customer.name}?`
      )
    ) {
      try {
        const customerRef = doc(db, "users", customer.id);
        const petsRef = collection(db, "pets");
        const petsQuery = query(petsRef, where("userId", "==", customer.id));
        const petsSnapshot = await getDocs(petsQuery);

        const deletePromises = [
          deleteDoc(customerRef),
          ...petsSnapshot.docs.map((petDoc) => deleteDoc(petDoc.ref)),
        ];

        await Promise.all(deletePromises);
        onDeleteCustomer(customer.id);
        onClose();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      await onEditCustomer(editedCustomer);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  const handleDeletePet = async (petId) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        await onDeletePet(customer.id, petId);
      } catch (error) {
        console.error("Error deleting pet:", error);
      }
    }
  };

  // Fix: Create a function to handle opening the pet modal
  const handleAddPetClick = () => {
    setIsPetModalOpen(true);
  };

  // Fix: Handle pet added
  const handlePetAdded = () => {
    setIsPetModalOpen(false);
  };

  const displayPets = showAllPets ? pets : pets.slice(0, 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-background w-full max-w-md mx-4 rounded-xl shadow-xl relative border-green2/30 border-2"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text/60 hover:text-text transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-nunito-bold text-green2 flex items-center mb-6">
            <Users className="mr-2 text-primary size-6" />
            Customer Details
          </h2>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-nunito-bold mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editedCustomer.name}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-green3/50 focus:border-primary focus:ring-0 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-nunito-bold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editedCustomer.email}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-green3/50 focus:border-primary focus:ring-0 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-nunito-bold mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editedCustomer.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-green3/50 focus:border-primary focus:ring-0 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-nunito-bold mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editedCustomer.status}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-green3/50 focus:border-primary focus:ring-0 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="pb-4 border-b border-green3/30">
                <h3 className="text-lg font-nunito-bold text-green2 mb-2">
                  {customer.fullName}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-nunito-bold text-text/80">
                      Email:
                    </span>
                    <span className="ml-2 text-text/60">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div>
                      <span className="font-nunito-bold text-text/80">
                        Phone:
                      </span>
                      <span className="ml-2 text-text/60">
                        {customer.phone}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-nunito-bold text-text/80">
                      Joined:
                    </span>
                    <span className="ml-2 text-text/60">
                      {customer.joinedDate}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-nunito-bold text-text/80 mr-2">
                      Status:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-nunito-bold ${
                        customer.status === "Active"
                          ? "bg-green3/50 text-green-800"
                          : "bg-primary/30 text-text/80"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>
                </div>
              </div>

              {!hideAddPet && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-nunito-bold text-text/80">Pets</h4>
                    <button
                      onClick={handleAddPetClick}
                      className="text-primary hover:bg-green3/20 rounded-full p-1 transition-colors"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {displayPets.map((pet) => (
                      <div
                        key={pet.id}
                        className="bg-green3/30 px-3 py-2 rounded-lg text-sm flex items-center justify-between group"
                        onMouseEnter={() => setSelectedPet(pet.id)}
                        onMouseLeave={() => setSelectedPet(null)}
                      >
                        <span>
                          {pet.name} (
                          {`${pet.species} ${pet.breed || ""}`.trim()})
                        </span>
                        {selectedPet === pet.id && (
                          <button
                            onClick={() => handleDeletePet(pet.id)}
                            className="text-red/90 hover:text-red transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red" />
                          </button>
                        )}
                      </div>
                    ))}

                    {pets.length > 1 && !showAllPets && (
                      <button
                        onClick={() => setShowAllPets(true)}
                        className="text-primary hover:text-primary/80 text-sm flex items-center"
                      >
                        See all ({pets.length}) pets
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    )}

                    {pets.length === 0 && (
                      <span className="text-text/60 text-sm">
                        No pets added yet
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-4 mt-6">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="w-full flex items-center justify-center px-4 py-2 bg-primary text-background rounded-full hover:bg-primary/80 transition-colors font-nunito"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedCustomer(customer);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-primary text-background rounded-full hover:bg-primary/80 transition-colors font-nunito"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Customer
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red/80 text-background rounded-full hover:bg-red transition-colors font-nunito"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Customer
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <PetAddModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
        onPetAdded={handlePetAdded}
        userId={customer?.id}
      />
    </div>
  );
}

export default CustomerDetailsModal;
