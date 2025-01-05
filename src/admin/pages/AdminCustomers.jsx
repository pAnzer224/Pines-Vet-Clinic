import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  PlusCircle,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { toast } from "react-toastify";
import StatusDropdown from "../../components/StatusDropdown";
import AddCustomerModal from "../components/AddCustomerModal";
import PetAddModal from "../../components/PetAddModal";
import CustomerDetailsModal from "../components/CustomerDetailsModal";
import LoadingSpinner from "../../components/LoadingSpinner";

function CustomerCard({
  customer,
  onAddPet,
  onEditCustomer,
  onDeleteCustomer,
  onViewDetails,
  onDeletePet,
}) {
  const [showAllPets, setShowAllPets] = useState(false);
  const statusColors = {
    Active: "bg-green3/50 text-green-800",
    Inactive: "bg-primary/30 text-text/80",
  };

  const displayPets = showAllPets ? customer.pets : customer.pets.slice(0, 1);

  const handlePetsClick = (e) => {
    e.stopPropagation();
    setShowAllPets(!showAllPets);
  };

  return (
    <div
      className="bg-background p-4 rounded-lg border-2 border-green3 hover:border-primary/70 transition-colors relative group cursor-pointer"
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
            if (
              window.confirm(
                `Are you sure you want to delete ${customer.name}?`
              )
            ) {
              onDeleteCustomer(customer.id);
            }
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
        <div className="text-sm text-text/60">{customer.email}</div>
        {customer.phone && (
          <div className="text-sm text-text/60">{customer.phone}</div>
        )}
        <div className="font-nunito-bold text-xs text-text/80">
          <span className="font-nunito-bold text-text/80">Pets:</span>{" "}
          {customer.pets.length > 0 ? (
            <div className="mt-2 space-y-2">
              {displayPets.map((pet, index) => (
                <div
                  key={index}
                  className="bg-green3/30 px-2 py-1 rounded-full text-xs inline-block mr-2"
                >
                  {pet.name} ({pet.type})
                </div>
              ))}
              {customer.pets.length > 1 && !showAllPets && (
                <button
                  onClick={handlePetsClick}
                  className="text-primary hover:text-primary/80 text-xs ml-1"
                >
                  See all ({customer.pets.length})
                </button>
              )}
            </div>
          ) : (
            <div className="mt-2 flex items-center">
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
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCustomerDetailsModalOpen, setIsCustomerDetailsModalOpen] =
    useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] =
    useState(null);
  const statusOptions = ["All Status", "Active", "Inactive"];

  useEffect(() => {
    const usersRef = collection(db, "users");
    const petsRef = collection(db, "pets");

    const unsubscribe = onSnapshot(
      usersRef,
      async (usersSnapshot) => {
        try {
          setLoading(true);
          const customerData = await Promise.all(
            usersSnapshot.docs.map(async (userDoc) => {
              const userData = userDoc.data();

              const petsQuery = query(
                petsRef,
                where("userId", "==", userDoc.id)
              );
              const petsSnapshot = await getDocs(petsQuery);

              const userPets = petsSnapshot.docs.map((petDoc) => ({
                id: petDoc.id,
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
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error in customers listener:", error);
        toast.error("Failed to listen to customers");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddPet = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsPetModalOpen(true);
  };

  const handlePetAdded = (addedPet) => {
    setIsPetModalOpen(false);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomerForDetails(customer);
    setIsCustomerDetailsModalOpen(true);
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

  const handleDeletePet = async (customerId, petId) => {
    try {
      const petRef = doc(db, "pets", petId);
      await deleteDoc(petRef);
      toast.success("Pet deleted successfully");
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Failed to delete pet");
    }
  };

  const handleViewCustomerDetails = (customer) => {
    setSelectedCustomerForDetails(customer);
    setIsCustomerDetailsModalOpen(true);
  };

  const filteredCustomers = customers
    .filter((customer) =>
      selectedStatus === "All Status"
        ? true
        : customer.status === selectedStatus
    )
    .filter((customer) =>
      searchQuery
        ? customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery)
        : true
    );

  return (
    <div className="space-y-6 mt-12">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">Customers</h1>
        <div className="flex items-center mt-5">
          <Users className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage your customer base
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-green3/50 rounded-lg focus:outline-none focus:border-green2 font-nunito-b"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/60 size-5" />
          </div>
          <StatusDropdown
            statusOptions={statusOptions}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </div>

        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-green2 text-background rounded-full hover:bg-green2/80 transition-colors font-nunito-semibold"
        >
          <UserPlus className="size-4 mr-2" />
          Add Customer
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center text-text/60 py-8">
          {searchQuery
            ? "No customers found matching your search"
            : "No customers found"}
        </div>
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
              onDeletePet={handleDeletePet}
            />
          ))}
        </div>
      )}

      <AddCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onCustomerAdded={() => {}}
      />

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
          onAddPet={handleAddPet}
          onDeletePet={handleDeletePet}
        />
      )}
    </div>
  );
}

export default Customers;
