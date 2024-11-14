import React, { useState } from "react";
import { ChevronDown, Users, UserPlus } from "lucide-react";

const mockCustomers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 234-567-8901",
    pets: [
      { name: "Max", type: "Golden Retriever" },
      { name: "Luna", type: "Persian Cat" },
    ],
    joinedDate: "Nov 10, 2024",
    status: "Active",
  },
  {
    id: 2,
    name: "Mike Williams",
    email: "mike.w@email.com",
    phone: "+1 234-567-8902",
    pets: [{ name: "Rocky", type: "German Shepherd" }],
    joinedDate: "Nov 8, 2024",
    status: "Active",
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma.d@email.com",
    phone: "+1 234-567-8903",
    pets: [{ name: "Bella", type: "Siamese Cat" }],
    joinedDate: "Nov 5, 2024",
    status: "Inactive",
  },
];

function CustomerCard({ customer }) {
  const statusColors = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="bg-background p-4 rounded-lg border-2 border-green3 hover:border-primary transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-nunito-bold text-green2">{customer.name}</h3>
          <p className="font-nunito text-sm text-text/60">{customer.email}</p>
          <p className="font-nunito text-sm text-text/60">{customer.phone}</p>
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
        <div className="font-nunito text-sm text-text/80">
          <span className="font-nunito-medium">Pets:</span>{" "}
          {customer.pets.map((pet, index) => (
            <span key={index}>
              {pet.name} ({pet.type})
              {index < customer.pets.length - 1 ? ", " : ""}
            </span>
          ))}
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
  const statusOptions = ["All Status", "Active", "Inactive"];

  return (
    <div className="space-y-6">
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

        <button className="hidden md:flex items-center px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors font-nunito">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockCustomers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
    </div>
  );
}

export default Customers;
