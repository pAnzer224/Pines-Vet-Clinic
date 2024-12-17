import React, { useState, useEffect } from "react";
import { Users, UserPlus, PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { toast } from "react-toastify";
import StatusDropdown from "../../components/StatusDropdown";
import AddCustomerModal from "../components/AddCustomerModal";
import EditCustomerModal from "../components/EditCustomerModal";
import PetAddModal from "../../components/PetAddModal";
import CustomerDetailsModal from "../components/CustomerDetailsModal";

function CustomerCard({
  customer,
  onAddPet,
  onEditCustomer,
  onDeleteCustomer,
  onViewDetails,
}) {
  const statusColors = {
    Active: "bg-green3/50 text-green-800",
    Inactive: "bg-primary/30 text-text/80",
  };

  return (
    <div
      className="bg-background p-4 rounded-lg border-2 border-green3 hover:border-primary/70 transition-colors relative group"
      onClick={() => onViewDetails(customer)}
    >
      <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditCustomer(customer);
          }}
          className="text-primary hover:bg-green3/20 rounded-full p-1 transition-colors"
        >
          <Edit className="size-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCustomer(customer.id);
          }}
          className="text-primary hover:bg-red-100 rounded-full p-1 transition-colors"
        >
          <Trash2 className="size-5 text-red" />
        </button>
      </div>

      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-nunito-bold text-green2">{customer.name}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-nunito-bold ${
              statusColors[customer.status]
            }`}
          >
            {customer.status}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-nunito-bold text-xs text-text/80 flex items-center">
          <span className="font-nunito-bold text-text/80">Pets:</span>{" "}
          {customer.pets.length > 0 ? (
            <div className="ml-2 flex items-center flex-wrap gap-2">
              {customer.pets.map((pet, index) => (
                <span
                  key={index}
                  className="bg-green3/30 px-2 py-1 rounded-full text-xs"
                >
                  {pet.name} ({pet.type})
                </span>
              ))}
            </div>
          ) : (
            <div className="ml-2 flex items-center">
              <span className="text-text/60 mr-2">No pets</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddPet(customer.id);
                }}
                className="text-primary hover:bg-green3/20 rounded-full p-1 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Customers() {
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [customers, setCustomers] = useState([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [isCustomerDetailsModalOpen, setIsCustomerDetailsModalOpen] =
    useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState(null);
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] =
    useState(null);
  const statusOptions = ["All Status", "Active", "Inactive"];

  useEffect(() => {
    const usersRef = collection(db, "users");
    const petsRef = collection(db, "pets");

    // Real-time listener for users and pets
    const unsubscribe = onSnapshot(
      usersRef,
      async (usersSnapshot) => {
        try {
          const customerData = await Promise.all(
            usersSnapshot.docs.map(async (userDoc) => {
              const userData = userDoc.data();

              const petsQuery = query(
                petsRef,
                where("userId", "==", userDoc.id)
              );
              const petsSnapshot = await getDocs(petsQuery);

              const userPets = petsSnapshot.docs.map((petDoc) => ({
                name: petDoc.data().name,
                type: `${petDoc.data().species} ${
                  petDoc.data().breed || ""
                }`.trim(),
              }));

              return {
                id: userDoc.id,
                name: userData.fullName || "Unknown",
                email: userData.email || "N/A",
                phone: userData.phone || "",
                pets: userPets,
                joinedDate: userData.createdAt
                  ? new Date(userData.createdAt.toDate()).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )
                  : "Unknown",
                status: userData.status || "Active",
              };
            })
          );

          setCustomers(customerData);
        } catch (error) {
          console.error("Error fetching customers:", error);
          toast.error("Failed to load customers");
        }
      },
      (error) => {
        console.error("Error in customers listener:", error);
        toast.error("Failed to listen to customers");
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleAddPet = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsPetModalOpen(true);
  };

  const handlePetAdded = (addedPet) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === selectedCustomerId
          ? {
              ...customer,
              pets: [
                ...customer.pets,
                {
                  name: addedPet.name,
                  type: `${addedPet.species} ${addedPet.breed || ""}`.trim(),
                },
              ],
            }
          : customer
      )
    );
    setIsPetModalOpen(false);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomerForEdit(customer);
    setIsEditCustomerModalOpen(true);
  };

  const handleUpdateCustomer = async (updatedCustomerData) => {
    try {
      const customerRef = doc(db, "users", updatedCustomerData.id);
      await updateDoc(customerRef, {
        fullName: updatedCustomerData.name,
        email: updatedCustomerData.email,
        phone: updatedCustomerData.phone,
        status: updatedCustomerData.status,
      });

      toast.success("Customer updated successfully");
      setIsEditCustomerModalOpen(false);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      const customerRef = doc(db, "users", customerId);
      await deleteDoc(customerRef);

      const petsRef = collection(db, "pets");
      const petsQuery = query(petsRef, where("userId", "==", customerId));
      const petsSnapshot = await getDocs(petsQuery);

      const deletePromises = petsSnapshot.docs.map((petDoc) =>
        deleteDoc(petDoc.ref)
      );

      await Promise.all(deletePromises);

      toast.success("Customer and associated pets deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleViewCustomerDetails = (customer) => {
    setSelectedCustomerForDetails(customer);
    setIsCustomerDetailsModalOpen(true);
  };

  const filteredCustomers =
    selectedStatus === "All Status"
      ? customers
      : customers.filter((customer) => customer.status === selectedStatus);

  return (
    <div className="space-y-6 mt-12">
      <AddCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onCustomerAdded={() => {}} // No need for manual refresh with real-time listener
      />

      {selectedCustomerForEdit && (
        <EditCustomerModal
          isOpen={isEditCustomerModalOpen}
          onClose={() => {
            setIsEditCustomerModalOpen(false);
            setSelectedCustomerForEdit(null);
          }}
          customer={selectedCustomerForEdit}
          onUpdateCustomer={handleUpdateCustomer}
        />
      )}

      <PetAddModal
        isOpen={isPetModalOpen}
        onClose={() => {
          setIsPetModalOpen(false);
          setSelectedCustomerId(null);
        }}
        onPetAdded={handlePetAdded}
        userId={selectedCustomerId}
      />

      {selectedCustomerForDetails && (
        <CustomerDetailsModal
          isOpen={isCustomerDetailsModalOpen}
          onClose={() => {
            setIsCustomerDetailsModalOpen(false);
            setSelectedCustomerForDetails(null);
          }}
          customer={selectedCustomerForDetails}
          onEditCustomer={handleEditCustomer}
          onDeleteCustomer={handleDeleteCustomer}
        />
      )}

      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">Customers</h1>
        <div className="flex items-center mt-5">
          <Users className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage your customer base
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <StatusDropdown
          statusOptions={statusOptions}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="hidden md:flex items-center px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors font-nunito"
        >
          <UserPlus className="size-4 mr-2" />
          Add Customer
        </button>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center text-text/60">No customers found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onAddPet={handleAddPet}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onViewDetails={handleViewCustomerDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Customers;
