import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function OrderAccordion({ order, isOpen, onToggle }) {
  return (
    <div className="border-2 border-green3/60 rounded-lg mb-2">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-green3/10 rounded-t-lg"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-nunito-bold text-green2 max-w-[18ch] truncate">
            Order #{order.orderId}
          </span>
          <div className="flex items-center">
            <span className="font-nunito-bold text-primary mr-2">
              {order.userName}
            </span>
            <div className="group relative">
              <Info className="w-4 h-4 text-green2" />
              <div className="text-xs font-nunito-bold text-primary/80 tracking-wider absolute hidden group-hover:block bg-background border-2 border-green3/60 p-2 rounded-md z-10 top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                User ID: {order.userId}
              </div>
            </div>
          </div>
          <span className="font-nunito-semibold text-primary">
            Total: ₱{order.total.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-text/60 hidden sm:inline text-sm">
            {new Date(order.date).toLocaleDateString()}
          </span>
          {isOpen ? (
            <ChevronUp className="text-green2" />
          ) : (
            <ChevronDown className="text-green2" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="p-4 space-y-2">
          <div className="sm:hidden mb-2 text-text/60">
            {new Date(order.date).toLocaleDateString()}
          </div>
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-green3/30 last:border-0"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div>
                  <p className="font-nunito-semibold text-text">
                    {item.productName}
                  </p>
                  <p className="text-sm text-text/60">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-nunito-semibold text-primary">
                ₱{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderHistory({ orders }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setOpenOrderId(null);
  };

  return (
    <div className="bg-background rounded-lg shadow-sm border-2 border-green3/60">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-green3/10"
      >
        <h3 className="font-nunito-bold text-green2">Order History</h3>
        {isOpen ? (
          <ChevronUp className="text-green2" />
        ) : (
          <ChevronDown className="text-green2" />
        )}
      </button>
      {isOpen && (
        <div className="p-6">
          <div className="space-y-2">
            {currentOrders.map((order) => (
              <OrderAccordion
                key={order.orderId}
                order={order}
                isOpen={openOrderId === order.orderId}
                onToggle={() =>
                  setOpenOrderId(
                    openOrderId === order.orderId ? null : order.orderId
                  )
                }
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded-md hover:bg-green3/10 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-5 h-5 text-green2" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === page
                          ? "bg-green3/20 text-green2"
                          : "hover:bg-green3/10 text-text"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md hover:bg-green3/10 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-5 h-5 text-green2" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
