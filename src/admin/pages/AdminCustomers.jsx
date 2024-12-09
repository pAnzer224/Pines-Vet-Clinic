import React, { useState, useEffect } from "react";
import { ChevronDown, Users, UserPlus, PlusCircle } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";
import { toast } from "react-toastify";
import AddCustomerModal from "./AddCustomerModal";
import PetAddModal from "../../components/PetAddModal";

function CustomerCard({ customer, onAddPet }) {
  const statusColors = {
    Active: "bg-green3/50 text-green-800",
    Inactive: "bg-primary/30 text-text/80",
  };

  return (
    <div className="bg-background p-4 rounded-lg border-2 border-green3 hover:border-primary/70 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-nunito-bold text-green2">{customer.name}</h3>
          <p className="font-nunito-bold text-xs text-text/60">
            {customer.email}
          </p>
          {customer.phone && (
            <p className="font-nunito text-xs text-text/60">{customer.phone}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-nunito-bold ${
            statusColors[customer.status]
          }`}
        >
          {customer.status}
        </span>
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
                onClick={() => onAddPet(customer.id)}
                className="text-primary hover:bg-green3/20 rounded-full p-1 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div className="font-nunito text-sm text-text/60">
          Joined: {customer.joinedDate}
        </div>
      </div>
    </div>
  );
}

function Customers() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const statusOptions = ["All Status", "Active", "Inactive"];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const usersRef = collection(db, "users");
      const petsRef = collection(db, "pets");

      // Fetch all users
      const usersSnapshot = await getDocs(usersRef);

      const customerData = await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();

          // Fetch pets for this user
          const petsQuery = query(petsRef, where("userId", "==", userDoc.id));
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
      setLoading(false);
    }
  };

  const handleAddPet = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsPetModalOpen(true);
  };

  const handlePetAdded = (addedPet) => {
    // Update the customers state to include the new pet
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

  // Filter customers based on selected status
  const filteredCustomers =
    selectedStatus === "All Status"
      ? customers
      : customers.filter((customer) => customer.status === selectedStatus);

  return (
    <div className="space-y-6 mt-12">
      {/* Customer Modal */}
      <AddCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onCustomerAdded={fetchCustomers}
      />

      {/* Pet Modal */}
      <PetAddModal
        isOpen={isPetModalOpen}
        onClose={() => {
          setIsPetModalOpen(false);
          setSelectedCustomerId(null);
        }}
        onPetAdded={handlePetAdded}
        userId={selectedCustomerId}
      />

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
        <div className="relative w-full md:w-64">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-2 bg-green3 text-text rounded-full hover:bg-green3/80 transition-colors border-[1.6px] border-green2 flex items-center justify-between font-nunito"
          >
            <span>{selectedStatus}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 border-[1.6px] border-green2 rounded-xl shadow-lg z-50">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-green3/20 text-text transition-colors first:rounded-t-xl last:rounded-b-xl font-nunito"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="hidden md:flex items-center px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors font-nunito"
        >
          <UserPlus className="size-4 mr-2" />
          Add Customer
        </button>
      </div>

      {loading ? (
        <div className="text-center text-text/60">Loading customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center text-text/60">No customers found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onAddPet={handleAddPet}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Customers;
