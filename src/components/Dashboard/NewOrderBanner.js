import React from "react";
import { useNavigate } from "react-router-dom";
import "../../pages/css/status.css";

const NewOrderBanner = ({ notification, onClose }) => {
  const navigate = useNavigate();
  if (!notification) return null;

  return (
    <div className="new_order_banner">
      <div>
        <b>New Order Received</b><br />
        Order ID: {notification.reference_id}
      </div>

      <div>
        <button
          className="view_btn"
          onClick={() => {
            navigate(`/dashboard/orders?orderId=${notification.reference_id}`);
            onClose();
          }}
        >
          View
        </button>
        <button className="close_btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default NewOrderBanner;
