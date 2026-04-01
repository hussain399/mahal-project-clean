import React from "react";

const NewOrderBanner = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="new_order_banner">
      <span>
        🛒 New Order Received:
        <b> #{order.reference_id}</b>
      </span>

      <button onClick={onClose}>×</button>
    </div>
  );
};

export default NewOrderBanner;
