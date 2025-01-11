import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

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
        <div className="p-6 space-y-2">
          {orders.map((order) => (
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
      )}
    </div>
  );
}

export default OrderHistory;
