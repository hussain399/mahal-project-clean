import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../pages/css/status.css";

const NewOrderPopup = ({ notification, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [notification, onClose]);

  if (!notification) return null;

  const isIssue = notification.type === "ORDER_ISSUE";

  return (
    <div className="order_popup">
      <div className="order_popup_header">
        <span className="dot" />
        <strong>
          {isIssue ? "New Order Issue Reported" : "New Order Received"}
        </strong>
        <button className="popup_close" onClick={onClose}>×</button>
      </div>

      <div className="order_popup_body">
        <p>
          {isIssue ? "Order ID" : "Order ID"}
          <br />
          <b>{notification.reference_id}</b>
        </p>

        <button
          className="popup_view_btn"
          onClick={() => {
            if (isIssue) {
              navigate(
                `/dashboard/order-issues?issueId=${notification.reference_id}`
              );
            } else {
              navigate(
                `/dashboard/orders?orderId=${notification.reference_id}`
              );
            }
            onClose();
          }}
        >
          View {isIssue ? "Issue" : "Order"}
        </button>
      </div>
    </div>
  );
};

export default NewOrderPopup;
