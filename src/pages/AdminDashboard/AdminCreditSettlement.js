import React, { useEffect, useState } from "react";
import "../css/admincredit.css";

const API = "http://192.168.1.193:5000/api";

export default function AdminCreditSettlement() {

  const token = localStorage.getItem("admin_token");

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [amountReceived, setAmountReceived] = useState("");

  const [viewOrder, setViewOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [paymentMode, setPaymentMode] = useState("BANK");
const [remarks, setRemarks] = useState("");
const [receiptFile, setReceiptFile] = useState(null);

const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
const [minDue, setMinDue] = useState("");
const [searchOrder, setSearchOrder] = useState("");
const [activeTab, setActiveTab] = useState("UNPAID");
const [paidOrders, setPaidOrders] = useState([]);

const loadPaidOrders = async (restaurantId) => {
  const res = await fetch(
    `${API}/admin/credit/paid-credit-orders/${restaurantId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  setPaidOrders(Array.isArray(data) ? data : []);
};



  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadHistory = async (restaurantId) => {

    const res = await fetch(
      `${API}/admin/credit/settlement-history/${restaurantId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();

    setHistory(Array.isArray(data) ? data : []);
  };

  const loadRestaurants = async () => {
    const res = await fetch(`${API}/admin/credit/restaurants`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRestaurants(data || []);
  };

  const loadOrders = async (restaurantId) => {
    const res = await fetch(
      `${API}/admin/credit/credit-orders/${restaurantId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setOrders(data || []);
    setSelectedOrders([]);
  };

  const handleRestaurantChange = (id) => {
    const rest = restaurants.find(r => r.restaurant_id == id);
    setSelectedRestaurant(rest);
    if (id) {
      loadOrders(id);
      loadPaidOrders(id); // 🔥 ADD THIS
    }
  };

  const toggleOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(o => o !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  /* ✅ FIXED — USE DUE AMOUNT IF EXISTS */
  const totalSelected = orders
    .filter(o => selectedOrders.includes(o.order_id))
    .reduce((sum, o) => sum + Number(o.due_amount || o.total_amount), 0);

 // ONLY changed parts shown

// ================= DOWNLOAD RECEIPT =================
const downloadReceipt = async (id) => {

  const res = await fetch(
    `${API}/admin/credit/settlement-pdf/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  const blob = await res.blob();

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Settlement_${id}.pdf`;
  a.click();

  window.URL.revokeObjectURL(url);
};


// ================= SETTLE PAYMENT =================
const settlePayment = async () => {

  if (!selectedRestaurant) return alert("Select restaurant");
  if (selectedOrders.length === 0) return alert("Select orders");

  const formData = new FormData();

  formData.append("token", token); // ✅ important (middleware safety)
  formData.append("restaurant_id", selectedRestaurant.restaurant_id);
  formData.append("order_ids", JSON.stringify(selectedOrders));
  formData.append("amount", amountReceived);
  formData.append("reference_no", referenceNo);
  formData.append("payment_mode", paymentMode);
  formData.append("remarks", remarks);

  if (receiptFile) {
    formData.append("receipt", receiptFile);
  }

  const res = await fetch(`${API}/admin/credit/settle-orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`   // ✅ keep header also
    },
    body: formData
  });

  const data = await res.json();

  if (data.success) {
    alert("Settlement completed");

    loadOrders(selectedRestaurant.restaurant_id);

    setAmountReceived("");
    setReferenceNo("");
    setReceiptFile(null);
    setRemarks("");

  } else {
    alert(data.error || "Settlement failed");
  }
};
const viewProof = async (id) => {

  const res = await fetch(
    `${API}/admin/credit/settlement-receipt/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    alert("Unable to load proof");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  window.open(url, "_blank");
};


const filteredOrders = orders.filter(o => {

  // 🔎 Search by order id
  if (
    searchOrder &&
    !String(o.order_id).includes(searchOrder)
  ) return false;

  // Status filter
  if (
    orderStatusFilter === "UNPAID" &&
    o.payment_status !== "UNPAID"
  ) return false;

  if (
    orderStatusFilter === "PARTIAL" &&
    o.payment_status !== "PARTIAL"
  ) return false;

  if (orderStatusFilter === "OVERDUE") {
    if (!o.credit_due_date) return false;

    const dueDate = new Date(o.credit_due_date);

    if (dueDate >= new Date()) return false;
  }

  // Min due
  if (
    minDue &&
    Number(o.due_amount || 0) < Number(minDue)
  ) return false;

  return true;
});
  return (
    <div className="dashboard_page">

      <h2>Credit Settlement</h2>

      {/* SELECT RESTAURANT */}
      <div className="card p-3 mb-3">

        <div className="row">

          

          <div className="col-md-6">
            <label>Select Restaurant</label>
            <select
              className="form-control"
              onChange={(e) => handleRestaurantChange(e.target.value)}
            >
              <option value="">-- Select --</option>

              {restaurants.map(r => (
                <option key={r.restaurant_id} value={r.restaurant_id}>
                  {r.restaurant_name_english}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>




      {selectedRestaurant && (

        
  <>
    {/* ================= FILTER CARD ================= */}
    <div className="row">

          {/* Orders */}
    <div className="col-md-8">
    <div className="card p-2 mb-3">

      <div className="row">

        {/* Search Order */}
        <div className="col-md-3">
          <label>Search Order ID</label>
          <input
            className="form-control"
            placeholder="Order ID..."
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="col-md-3">
          <label>Status</label>
          <select
            className="form-control"
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        {/* Min Due */}
        <div className="col-md-3">
          <label>Min Due Amount</label>
          <input
            className="form-control"
            placeholder="QAR"
            value={minDue}
            onChange={(e) => setMinDue(e.target.value)}
          />
        </div>

        {/* Reset */}
        <div className="col-md-3 d-flex align-items-end">
          <button
            className="btn btn-secondary w-100"
            onClick={() => {
              setOrderStatusFilter("ALL");
              setMinDue("");
              setSearchOrder("");
            }}
          >
            Reset Filters
          </button>
        </div>

      </div>

    </div>
    </div>
    </div>


    <div className="mb-2 d-flex gap-2">

      <button
        className={`btn ${activeTab === "UNPAID" ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => setActiveTab("UNPAID")}
      >
        Unpaid Orders
      </button>

      <button
        className={`btn ${activeTab === "PAID" ? "btn-success" : "btn-outline-success"}`}
        onClick={() => setActiveTab("PAID")}
      >
        Paid Orders
      </button>

    </div>



        <div className="row">

          {/* ORDERS TABLE */}
          <div className="col-md-8">

            <div className="card p-3">

              <h5>
                {activeTab === "UNPAID"
                  ? "Unpaid Credit Orders"
                  : "Paid Credit Orders"}
              </h5>

              <table className="table table-hover">

                <thead>
                  <tr>

                    {/* ✅ Checkbox column ONLY for unpaid */}
                    {activeTab === "UNPAID" && <th></th>}

                    <th>Order</th>
                    <th>Supplier</th>
                    <th>Amount</th>
                    <th>Due</th>

                    {/* ✅ View column ONLY for unpaid */}
                    {activeTab === "UNPAID" && <th></th>}

                  </tr>
                </thead>

                <tbody>

                  {(activeTab === "UNPAID" ? filteredOrders : paidOrders).map(o => {

                    const isSelected = selectedOrders.includes(o.order_id);

                    return (
                      <tr
                        key={o.order_id}
                        className={isSelected ? "table-success" : ""}
                      >

                        {activeTab === "UNPAID" && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(o.order_id)}
                              onChange={() => toggleOrder(o.order_id)}
                            />
                          </td>
                        )}

                        <td>{o.order_id}</td>

                        <td>{o.supplier_name}</td>

                        {/* ✅ UPDATED AMOUNT DISPLAY */}
                        <td>
                          <div><b>Total:</b> QAR {o.total_amount}</div>

                          {o.paid_amount !== undefined && (
                            <div className="text-success">
                              Paid: QAR {o.paid_amount || 0}
                            </div>
                          )}

                          {activeTab === "UNPAID" && o.due_amount !== undefined && (
                            <div className="text-danger">
                              Due: QAR {o.due_amount || 0}
                            </div>
                          )}
                        </td>

                        {/* ✅ STATUS + DATE */}
                        <td>

                          {o.payment_status && (
                            <span
                              className={
                                o.payment_status === "PAID"
                                  ? "badge bg-success"
                                  : o.payment_status === "PARTIAL"
                                  ? "badge bg-warning"
                                  : "badge bg-danger"
                              }
                            >
                              {o.payment_status}
                            </span>
                          )}

                          <div>{o.credit_due_date}</div>

                        </td>

                        {activeTab === "UNPAID" && (
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => setViewOrder(o)}
                            >
                              View
                            </button>
                          </td>
                        )}

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          </div>


          {/* SUMMARY */}
          <div className="col-md-4">

            <div className="card p-3">

              <h5 className="mb-3">Settlement Summary</h5>

              <div className="credit_summary_box">
                <span>Orders Selected</span>
                <strong>{selectedOrders.length}</strong>
              </div>

              <div className="credit_summary_box">
                <span>Total Amount</span>
                <strong className="text-success">
                  QAR {totalSelected.toFixed(2)}
                </strong>
              </div>

              <label className="mt-2">Amount Received</label>

              <input
                className="form-control"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="Optional"
              />

              <label className="mt-2">Reference Number</label>
              <input
                className="form-control"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="Transaction / Cheque No"
              />

              <label className="mt-2">Payment Mode</label>
              <select
                className="form-control"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option>BANK</option>
                <option>CASH</option>
                <option>UPI</option>
                <option>CHEQUE</option>
              </select>

              <label className="mt-2">Remarks</label>
              <input
                className="form-control"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <label className="mt-2">Upload Proof</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setReceiptFile(e.target.files[0])}
              />

              <button
                className="btn btn-success w-100 mt-3"
                onClick={settlePayment}
                disabled={selectedOrders.length === 0}
              >
                Confirm Settlement
              </button>

              <button
                className="btn btn-outline-primary"
                onClick={() => {
                  loadHistory(selectedRestaurant.restaurant_id);
                  setShowHistory(true);
                }}
              >
                View Settlement History
              </button>

            </div>

          </div>
        </div>

        </>

      )}


{viewOrder && (

  <div className="modal_show">

    <div className="modal_box" style={{ width: 700 }}>

      <h4 className="modal_title">
        Order Details — {viewOrder?.order_id}
      </h4>

      <hr />

      {/* ================= TOP SECTION ================= */}
      <div className="row">

        {/* Restaurant */}
        <div className="col-md-6">
          <div className="info_card">

            <h6 className="section_heading">Restaurant</h6>

            <div className="info_row">
              <span>Name</span>
              <span>{viewOrder?.restaurant_name || "-"}</span>
            </div>

            <div className="info_row">
              <span>Contact</span>
              <span>{viewOrder?.restaurant_contact || "-"}</span>
            </div>

            <div className="info_row">
              <span>Phone</span>
              <span>{viewOrder?.restaurant_mobile || "-"}</span>
            </div>

            <div className="info_row">
              <span>City</span>
              <span>{viewOrder?.restaurant_city || "-"}</span>
            </div>

            <div className="info_row">
              <span>Address</span>
              <span>{viewOrder?.restaurant_address || "-"}</span>
            </div>

          </div>
        </div>

        {/* Supplier */}
        <div className="col-md-6">
          <div className="info_card">

            <h6 className="section_heading">Supplier</h6>

            <div className="info_row">
              <span>Name</span>
              <span>{viewOrder?.supplier_name}</span>
            </div>

            <div className="info_row">
              <span>Contact</span>
              <span>{viewOrder?.contact_person_name}</span>
            </div>

            <div className="info_row">
              <span>Phone</span>
              <span>{viewOrder?.contact_person_mobile}</span>
            </div>

            <div className="info_row">
              <span>Due Date</span>
              <span>{viewOrder?.credit_due_date}</span>
            </div>

          </div>
        </div>

      </div>

      {/* ================= CREDIT SUMMARY ================= */}
      <div className="credit_summary_section">

        <h6 className="section_heading">Credit Summary</h6>

        <div className="credit_grid">

          <div className="credit_box">
            <small>Limit</small>
            <div>QAR {viewOrder?.credit_limit || 0}</div>
          </div>

          <div className="credit_box text-danger">
            <small>Used</small>
            <div>QAR {viewOrder?.credit_used || 0}</div>
          </div>

          <div className="credit_box text-success">
            <small>Available</small>
            <div>
              QAR {
                (
                  (Number(viewOrder?.credit_limit) || 0) -
                  (Number(viewOrder?.credit_used) || 0)
                ).toFixed(2)
              }
            </div>
          </div>

          <div className="credit_box">
            <small>Credit Days</small>
            <div>{viewOrder?.credit_days || 0}</div>
          </div>

        </div>

      </div>

      {/* ================= ITEMS ================= */}
      <div className="items_section">

        <h6 className="section_heading">Items</h6>

        <table className="table table-bordered table-striped table-sm">
          <thead className="table-light">
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(viewOrder?.items) &&
              viewOrder.items.map((it, i) => (
                <tr key={i}>
                  <td>{it.product_name}</td>
                  <td>{it.qty}</td>
                  <td>{it.price}</td>
                  <td>{it.total}</td>
                </tr>
              ))}
          </tbody>
        </table>

      </div>

      <div className="modal_footer">
        <button
          className="btn btn-secondary"
          onClick={() => setViewOrder(null)}
        >
          Close
        </button>
      </div>

    </div>

  </div>

)}


      {/* ================= HISTORY MODAL ================= */}
      {showHistory && (

        <div className="modal_show">

          <div className="modal_box" style={{ width: 800 }}>

            <h4>Settlement History</h4>

            <table className="table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Orders</th>
                  <th>Amount</th>
                  <th>Mode</th>
                </tr>
              </thead>

              <tbody>

                {history.map(h => (

                  <tr key={h.settlement_id}>

                    <td>{new Date(h.created_at).toLocaleDateString()}</td>

                    <td>
                      {Array.isArray(h.order_ids)
                        ? h.order_ids.join(", ")
                        : ""}
                    </td>

                    <td>QAR {h.amount}</td>

                    <td>{h.payment_mode}</td>

                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => downloadReceipt(h.settlement_id)}
                      >
                        Download
                      </button>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => viewProof(h.settlement_id)}
                      >
                        Proof
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            <button
              className="btn btn-secondary"
              onClick={() => setShowHistory(false)}
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}