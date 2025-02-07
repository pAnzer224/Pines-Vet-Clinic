import React, { useState } from "react";
import { Users, Check, Search, XCircle } from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { toast } from "react-toastify";
import StatusDropdown from "../../components/StatusDropdown";
import CustomerDetailsModal from "../components/CustomerDetailsModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import useFirestoreCrud from "../../hooks/useFirestoreCrud";

const CarePlanCard = ({
  customer,
  onViewDetails,
  onHandlePlanRequest,
  onHandleAssignPlan,
  processingRequest,
}) => {
  const planOptions = ["Basic", "Standard", "Premium"];

  const statusColors = {
    Approved: "bg-green3/50 text-green-800",
    Rejected: "bg-red/30 text-red",
    Pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div
      className="bg-pantone/20 p-4 rounded-lg border-2 border-green3 hover:border-primary/70 transition-colors relative group cursor-pointer"
      onClick={() => onViewDetails(customer)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-nunito-bold text-green2">
            {customer.fullName || "Unknown"}
          </h3>
          <div className="text-sm text-text/60">{customer.email}</div>
          <div className="mt-2">
            <span className="text-sm font-nunito-bold text-text/80">
              Current Plan:{" "}
            </span>
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-nunito-bold bg-green3/50 text-green-800">
              {customer.plan?.charAt(0).toUpperCase() +
                customer.plan?.slice(1) || "Free"}
            </span>
          </div>
          {customer.planStatus && (
            <div className="mt-2">
              <span className="text-sm font-nunito-bold text-text/80">
                Status:{" "}
              </span>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-nunito-bold ${
                  statusColors[customer.planStatus]
                }`}
              >
                {customer.planStatus}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {customer.planStatus === "Pending" ? (
            <>
              <select
                onChange={(e) =>
                  onHandlePlanRequest(customer.id, "approve", e.target.value)
                }
                disabled={processingRequest}
                className="px-3 py-1.5 border-2 border-green3/50 rounded-lg focus:outline-none focus:border-green2 font-nunito bg-background text-sm"
              >
                <option value="">Select Plan</option>
                {planOptions.map((plan) => (
                  <option key={plan} value={plan.toLowerCase()}>
                    {plan}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onHandlePlanRequest(customer.id, "reject")}
                disabled={processingRequest}
                className="px-3 py-1.5 bg-red/10 text-red rounded-full hover:bg-red/20 transition-colors border border-red/60 flex items-center gap-1.5 text-sm"
              >
                <XCircle className="size-4" />
                Reject
              </button>
            </>
          ) : (
            <>
              <select
                onChange={(e) =>
                  onHandleAssignPlan(customer.id, e.target.value)
                }
                disabled={processingRequest}
                className="px-3 py-1.5 border-2 border-green3/50 rounded-lg focus:outline-none focus:border-green2 font-nunito bg-background text-sm"
              >
                <option value="">Assign Plan</option>
                {planOptions.map((plan) => (
                  <option key={plan} value={plan.toLowerCase()}>
                    {plan}
                  </option>
                ))}
              </select>
              {customer.plan && customer.plan !== "free" && (
                <button
                  onClick={() => onHandlePlanRequest(customer.id, "remove")}
                  disabled={processingRequest}
                  className="px-3 py-1.5 bg-red/10 text-red rounded-full hover:bg-red/20 transition-colors border border-red/60 flex items-center gap-1.5 text-sm"
                >
                  <XCircle className="size-4" />
                  Remove
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminCarePlans = () => {
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(false);

  const statusOptions = ["All Status", "Pending", "Approved", "Rejected"];

  const { items: customers, loading } = useFirestoreCrud("users");

  const handlePlanRequest = async (customerId, action, newPlan = null) => {
    try {
      setProcessingRequest(true);
      const userRef = doc(db, "users", customerId);
      const userDoc = await getDoc(userRef);

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

  const handleAssignPlan = async (customerId, plan) => {
    try {
      setProcessingRequest(true);
      const userRef = doc(db, "users", customerId);

      await updateDoc(userRef, {
        plan: plan,
        planStatus: "Approved",
        planRequestDate: new Date().toISOString(),
      });

      toast.success(`${plan} plan assigned successfully`);
    } catch (error) {
      toast.error("Error assigning plan");
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-green3/50 rounded-lg focus:outline-none focus:border-green2 font-nunito"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/60 size-5" />
          </div>
          <StatusDropdown
            statusOptions={statusOptions}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </div>
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
        <div className="grid grid-cols-1 gap-4">
          {filteredCustomers.map((customer) => (
            <CarePlanCard
              key={customer.id}
              customer={customer}
              onViewDetails={handleViewCustomerDetails}
              onHandlePlanRequest={handlePlanRequest}
              onHandleAssignPlan={handleAssignPlan}
              processingRequest={processingRequest}
            />
          ))}
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
