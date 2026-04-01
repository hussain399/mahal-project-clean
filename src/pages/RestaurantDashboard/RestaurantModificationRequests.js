import React, { useEffect, useState } from "react";
import ModificationRequestDetails from "./ModificationRequestDetails";

const API = "http://127.0.0.1:5000/api/v1/orders/restaurant";

export default function RestaurantModificationRequests() {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetch(`${API}/orders/modification-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]));
  }, [token]);

  useEffect(() => {
  fetch(
    "http://127.0.0.1:5000/api/v1/orders/restaurant/notifications/auto-read",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "ORDER_MODIFICATION",
        reference_id: "ALL", // or specific order id
      }),
    }
  ).then(() => {
    window.dispatchEvent(new Event("refreshNotifications"));
  });
}, [token]);

  const decide = async (id, decision) => {
    await fetch(`${API}/orders/modification-requests/${id}/decision`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ decision }),
    });

    setRequests((prev) => prev.filter((r) => r.id !== id));
    setSelectedRequest(null);
  };

  /* ================= DETAILS PAGE ================= */
  if (selectedRequest) {
    return (
      <ModificationRequestDetails
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
        onDecision={decide}
      />
    );
  }

  /* ================= LIST PAGE ================= */
  return (
    <div className="dashboard_page">

      <div className="page_header">
        <h2>Modification Requests</h2>
        <p className="page_subtitle">
          Review and approve supplier order changes
        </p>
      </div>

      <div className="card mt-3">
        <table className="table order_table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Supplier</th>
              <th>Before</th>
              <th>After</th>
              <th>Reason</th>
              <th>Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>

          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No modification requests
                </td>
              </tr>
            )}

            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.order_id}</td>
                <td>{r.supplier_name}</td>
                <td>QAR {r.total_before}</td>
                <td className={r.total_after < r.total_before ? "text-danger" : "text-success"}>
                  QAR {r.total_after}
                </td>
                <td>{r.note}</td>
                <td>
                  <span className="status_badge warning">Pending</span>
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setSelectedRequest(r)}
                  >
                    View
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
