import React, { useState } from "react";
import { Users, Search, Trash2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { toast } from "react-toastify";
import StatusDropdown from "../../components/StatusDropdown";
import CustomerDetailsModal from "../components/CustomerDetailsModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import useFirestoreCrud from "../../hooks/useFirestoreCrud";

const AdminCarePlans = () => {
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(false);

  const statusOptions = ["All Status", "Pending", "Approved", "Rejected"];
  const planOptions = ["Basic", "Standard", "Premium"];

  const { items: customers, loading } = useFirestoreCrud("users");

  const getPlanColor = (plan, status) => {
    if (status === "Pending") {
      return "bg-yellow-100 text-yellow-800";
    }
    switch (plan?.toLowerCase()) {
      case "basic":
        return "bg-[#478CDD]/40 text-blue-900";
      case "standard":
        return "bg-[#54E25A]/50 text-primary";
      case "premium":
        return "bg-[#DD47BC]/40 text-amber-900";
      default:
        return "bg-text/10 text-text/70";
    }
  };
  const getCurrentPlanDisplay = (customer) => {
    if (customer.planStatus === "Pending") {
      return (
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-text/80">Requesting</span>
          <span>{customer.planRequest?.requestedPlan || "N/A"}</span>
        </div>
      );
    }
    return customer.plan || "Free";
  };

  const handlePlanRequest = async (customerId, action, newPlan = null) => {
    try {
      setProcessingRequest(true);
      const userRef = doc(db, "users", customerId);

      let updateData = {};
      if (action === "approve") {
        updateData = {
          plan: newPlan,
          planStatus: "Approved",
          planRequestDate: new Date().toISOString(),
        };
        toast.success(`Care plan ${newPlan} approved successfully`);
      } else if (action === "reject") {
        updateData = {
          planStatus: "Rejected",
          planRequestDate: new Date().toISOString(),
        };
        toast.success("Care plan request rejected");
      } else if (action === "remove") {
        updateData = {
          plan: "free",
          planStatus: null,
          planRequestDate: null,
        };
        toast.success("Care plan removed successfully");
      }

      await updateDoc(userRef, updateData);
    } catch (error) {
      toast.error("Error processing request");
      console.error("Error:", error);
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleViewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const filteredCustomers = customers
    .filter((customer) =>
      selectedStatus === "All Status"
        ? true
        : customer.planStatus === selectedStatus
    )
    .filter((customer) =>
      searchQuery
        ? customer.fullName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  return (
    <div className="space-y-6 mt-12">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">
          Care Plans Management
        </h1>
        <div className="flex items-center mt-5">
          <Users className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage customer care plans
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-[1.6px] border-green2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green2 focus:border-transparent font-nunito"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/60 size-5" />
        </div>
        <StatusDropdown
          statusOptions={statusOptions}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto rounded-xl border-[1.6px] border-green2">
          <table className="w-full bg-background border-collapse">
            <thead>
              <tr className="bg-green3/20 font-nunito-bold text-text">
                <th className="p-3 text-left text-base min-w-[200px]">
                  Customer Name
                </th>
                <th className="p-3 text-left text-base min-w-[200px]">Email</th>
                <th className="p-3 text-left text-base min-w-[120px]">
                  Current Plan
                </th>
                <th className="p-3 text-left text-base min-w-[100px]">
                  Status
                </th>
                <th className="p-3 text-left text-base min-w-[200px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-green3/30 hover:bg-green3/10 font-nunito-semibold text-text/80"
                >
                  <td
                    className="p-3 font-nunito-bold text-base cursor-pointer"
                    onClick={() => handleViewCustomerDetails(customer)}
                  >
                    {customer.fullName}
                  </td>
                  <td
                    className="p-3 text-base cursor-pointer"
                    onClick={() => handleViewCustomerDetails(customer)}
                  >
                    {customer.email}
                  </td>
                  <td
                    className="p-3 cursor-pointer"
                    onClick={() => handleViewCustomerDetails(customer)}
                  >
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-nunito-bold ${getPlanColor(
                        customer.plan,
                        customer.planStatus
                      )}`}
                    >
                      {getCurrentPlanDisplay(customer)}
                    </span>
                  </td>
                  <td
                    className="p-3 cursor-pointer"
                    onClick={() => handleViewCustomerDetails(customer)}
                  >
                    <span
                      className={`
                        inline-flex px-3 py-1 rounded-full text-xs font-nunito-semibold
                        ${
                          customer.planStatus === "Approved"
                            ? "bg-green3/50 text-primary tracking-wide"
                            : customer.planStatus === "Rejected"
                            ? "bg-red/30 text-red"
                            : customer.planStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-200/90 text-primary"
                        }
                      `}
                    >
                      {customer.planStatus || "No Request"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {customer.planStatus === "Pending" ? (
                        <>
                          <StatusDropdown
                            statusOptions={planOptions}
                            selectedStatus="Select Plan"
                            onStatusChange={(plan) =>
                              handlePlanRequest(
                                customer.id,
                                "approve",
                                plan.toLowerCase()
                              )
                            }
                            className="w-32"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlanRequest(customer.id, "reject");
                            }}
                            disabled={processingRequest}
                            className="px-3 py-1.5 bg-red/10 text-red rounded-lg hover:bg-red/20 transition-colors border border-red/60 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <StatusDropdown
                          statusOptions={planOptions}
                          selectedStatus="Change Plan"
                          onStatusChange={(plan) =>
                            handlePlanRequest(
                              customer.id,
                              "approve",
                              plan.toLowerCase()
                            )
                          }
                          className="w-32"
                        />
                      )}
                      {customer.plan && customer.plan !== "free" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlanRequest(customer.id, "remove");
                          }}
                          disabled={processingRequest}
                          className="px-3 py-1.5 bg-red/10 text-red rounded-lg hover:bg-red/20 transition-colors border border-red/60 text-sm flex items-center gap-2"
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCustomer && (
        <CustomerDetailsModal
          isOpen={isCustomerModalOpen}
          onClose={() => {
            setIsCustomerModalOpen(false);
            setSelectedCustomer(null);
          }}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
};

export default AdminCarePlans;
