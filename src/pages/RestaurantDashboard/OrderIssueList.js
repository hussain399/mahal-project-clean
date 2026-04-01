import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000/api/v1";

export default function OrderIssueList() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API}/orders/restaurant/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const deliveredOrders = Array.isArray(data)
          ? data.filter(o => o.status === "DELIVERED")
          : [];
        setOrders(deliveredOrders);
      })
      .catch(() => setOrders([]));
  }, [token]);

  return (
    <div className="orders_page">
      <h3 className="page_title">Order Issues</h3>

      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>#</th>
              <th>Order ID</th>
              <th>Supplier</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                  No delivered orders
                </td>
              </tr>
            )}

            {orders.map((o, i) => (
              <tr key={o.order_id}>
                <td>{i + 1}</td>
                <td>{o.order_id}</td>
                <td>{o.supplier_name}</td>
                <td>
                  <span className={`status ${o.status}`}>
                    {o.status}
                  </span>
                </td>
                <td>
                  <button
                    className="view_btn"
                    onClick={() =>
                      navigate(`/restaurantdashboard/issues/${o.order_id}`)
                    }
                  >
                    Report / View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
