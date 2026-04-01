import React, { useEffect, useState } from "react";
import axios from "axios";
import ReviewModal from "./ReviewModal";

const RatingsAndReviews = () => {
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  /* ================= LOAD DELIVERED ORDERS ================= */
  useEffect(() => {
    axios
      .get(
        "http://127.0.0.1:5000/api/v1/orders/restaurant/orders?status=DELIVERED",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => setOrders(res.data || []))
      .catch(() => alert("Failed to load delivered orders"));
  }, [token]);

  return (
    <div className="dashboard_page">
      {/* HEADER */}
      <div className="page_header">
        <h2>⭐ Reviews & Ratings</h2>
        <p className="page_subtitle">
          View Delivered Orders and Submit Reviews
        </p>
      </div>

      {/* TABLE */}
      <div className="card mt-3">
        <table className="table order_table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Total</th>
              <th>Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No Delivered Orders Found
                </td>
              </tr>
            )}

            {orders.map((o) => (
              <tr key={o.order_id}>
                <td>{o.order_id}</td>

                <td>
                  {new Date(o.order_date).toLocaleDateString()}
                  <br />
                  <small>
                    {new Date(o.order_date).toLocaleTimeString()}
                  </small>
                </td>

                <td>{o.supplier_name}</td>

                <td>QAR {o.total_amount}</td>

                <td>
                  <span className="status_badge success">
                    {o.status}
                  </span>
                </td>

                <td className="text-end">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedOrder(o)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* REVIEW MODAL */}
      {selectedOrder && (
        <ReviewModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default RatingsAndReviews;    