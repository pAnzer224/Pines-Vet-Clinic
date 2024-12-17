import React from "react";
import { X, Edit, Trash2, Users } from "lucide-react";
import { toast } from "react-toastify";
import {
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase-config";

function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
  onEditCustomer,
  onDeleteCustomer,
}) {
  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete customer ${customer.name}?`
      )
    ) {
      try {
        const customerRef = doc(db, "users", customer.id);
        await deleteDoc(customerRef);

        // Delete associated pets
        const petsRef = collection(db, "pets");
        const petsQuery = query(petsRef, where("userId", "==", customer.id));
        const petsSnapshot = await getDocs(petsQuery);

        const deletePromises = petsSnapshot.docs.map((petDoc) =>
          deleteDoc(petDoc.ref)
        );

        await Promise.all(deletePromises);

        toast.success("Customer and associated pets deleted successfully");
        onDeleteCustomer(customer.id);
        onClose();
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast.error("Failed to delete customer");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
      <div className="bg-background w-full max-w-md mx-4 rounded-xl shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text/60 hover:text-text transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-0">
          <h2 className="text-xl font-nunito-bold text-green2 flex items-center">
            <Users className="mr-2 text-primary size-6" />
            Customer Details
          </h2>
        </div>

        {/* Customer Details */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-nunito-bold text-green2 mb-2">
              {customer.name}
            </h3>

            <div className="space-y-2">
              <div>
                <span className="font-nunito-bold text-text/80 mr-2">
                  Email:
                </span>
                <span className="text-text/60">{customer.email}</span>
              </div>

              {customer.phone && (
                <div>
                  <span className="font-nunito-bold text-text/80 mr-2">
                    Phone:
                  </span>
                  <span className="text-text/60">{customer.phone}</span>
                </div>
              )}

              <div>
                <span className="font-nunito-bold text-text/80 mr-2">
                  Joined:
                </span>
                <span className="text-text/60">{customer.joinedDate}</span>
              </div>

              <div>
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

          {customer.pets.length > 0 && (
            <div>
              <h4 className="font-nunito-bold text-text/80 mb-2">Pets:</h4>
              <div className="flex flex-wrap gap-2">
                {customer.pets.map((pet, index) => (
                  <span
                    key={index}
                    className="bg-green3/30 px-2 py-1 rounded-full text-xs"
                  >
                    {pet.name} ({pet.type})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => onEditCustomer(customer)}
              className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors font-nunito"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Customer
            </button>
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-nunito"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetailsModal;
