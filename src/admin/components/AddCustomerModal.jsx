import React, { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import useFirestoreCrud from "../../hooks/useFirestoreCrud";

function AddCustomerModal({
  isOpen,
  onClose,
  onCustomerAdded,
  customerToEdit,
}) {
  const [customerData, setCustomerData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "Active",
  });

  const { createItem, updateItem } = useFirestoreCrud("users");

  useEffect(() => {
    if (customerToEdit) {
      setCustomerData(customerToEdit);
    } else {
      setCustomerData({
        fullName: "",
        email: "",
        phone: "",
        status: "Active",
      });
    }
  }, [customerToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!customerData.fullName || !customerData.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      if (customerToEdit) {
        // Update customer
        await updateItem(customerToEdit.id, {
          ...customerData,
          updatedAt: Timestamp.now(),
        });
        toast.success("Customer updated successfully");
      } else {
        // Add new customer
        await createItem({
          ...customerData,
          createdAt: Timestamp.now(),
        });
        toast.success("Customer added successfully");
      }

      // Reset form and close modal
      setCustomerData({
        fullName: "",
        email: "",
        phone: "",
        status: "Active",
      });

      // Call the onCustomerAdded callback if provided
      onCustomerAdded && onCustomerAdded();
      onClose();
    } catch (error) {
      console.error("Error adding/updating customer:", error);
      toast.error("Failed to add/update customer");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="bg-background w-full max-w-md mx-4 rounded-xl shadow-xl relative border-green2/30 border-2">
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
            {customerToEdit ? (
              <>
                <UserPlus className="mr-2 text-primary size-6" />
                Edit Customer
              </>
            ) : (
              <>
                <UserPlus className="mr-2 text-primary size-6" />
                Add New Customer
              </>
            )}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-nunito-bold text-text/80 mb-2"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={customerData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-green3 rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter customer's full name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-nunito-bold text-text/80 mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={customerData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-green3 rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter customer's email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-nunito-bold text-text/80 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={customerData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-green3 rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter customer's phone number"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-nunito-bold text-text/80 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={customerData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-green3 rounded-lg focus:outline-none focus:border-primary transition-colors"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 bg-background border-2 border-green3 text-text rounded-full hover:bg-green3/20 transition-colors font-nunito"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-background rounded-full hover:bg-primary/80 transition-colors font-nunito"
            >
              {customerToEdit ? "Save Changes" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCustomerModal;
