import React, { useEffect, useState } from "react";
import "../css/admincredit.css";

const API = "http://192.168.1.193:5000/api/admin/supplier-payments";

export default function AdminSupplierPayments() {

  const token = localStorage.getItem("admin_token");

  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("BANK");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [showRestaurantView, setShowRestaurantView] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [searchOrder, setSearchOrder] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [minDue, setMinDue] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [paidOrders, setPaidOrders] = useState([]);
const [showPaid, setShowPaid] = useState(false);
const [activeTab, setActiveTab] = useState("PENDING"); 

const loadPaidOrders = async (supplierId) => {
  const res = await fetch(`${API}/paid-orders/${supplierId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  setPaidOrders(Array.isArray(data) ? data : []);
};
const uniqueRestaurants = [
  ...new Map(
    orders.map(o => [Number(o.restaurant_id), o])
  ).values()
];

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {

    const res = await fetch(`${API}/suppliers`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setSuppliers(Array.isArray(data) ? data : []);
  };

  const loadPayments = async (supplierId) => {

  const res = await fetch(`${API}/history/${supplierId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  setPayments(Array.isArray(data) ? data : []);
};


  const loadOrders = async (supplierId) => {

    const res = await fetch(`${API}/orders/${supplierId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setOrders(Array.isArray(data) ? data : []);
    setSelectedOrders([]);
  };


  const toggleOrder = (o) => {

    if (o.status !== "DELIVERED") {
      alert("Only DELIVERED orders can be paid");
      return;
    }

    if (selectedOrders.includes(o.order_id)) {
      setSelectedOrders(selectedOrders.filter(id => id !== o.order_id));
    } else {
      setSelectedOrders([...selectedOrders, o.order_id]);
    }
  };


  const totalSelected = orders
    .filter(o => selectedOrders.includes(o.order_id))
    .reduce((sum, o) => sum + Number(o.supplier_due_amount), 0);


const paySupplier = async () => {

  if (!selectedSupplier) return alert("Select supplier");

  const form = new FormData();

  form.append("supplier_id", selectedSupplier.supplier_id);
  form.append("order_ids", JSON.stringify(selectedOrders));
  form.append("amount", amount || totalSelected);
  form.append("payment_mode", paymentMode);
  form.append("reference_no", reference);
  form.append("remarks", remarks);

  if (receipt) form.append("receipt", receipt);

  try {

    const res = await fetch(`${API}/pay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });

    const data = await res.json();

    if (data.success) {

      alert("Payment Successful");

      // ✅ FULL AUTO REFRESH
      await loadSuppliers();
      await loadOrders(selectedSupplier.supplier_id);
      await loadPaidOrders(selectedSupplier.supplier_id);

      setSelectedOrders([]);
      setAmount("");
      setReference("");
      setRemarks("");
      setReceipt(null);

    } else {

      alert(data.error || "Error");

    }

  } catch (err) {

    alert("Network Error");

  }
};

const downloadReceipt = async (paymentId) => {

  const res = await fetch(`${API}/receipt/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    alert("Download failed");
    return;
  }

  const blob = await res.blob();

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt_${paymentId}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const downloadPaymentPDF = async (paymentId) => {

  const res = await fetch(
    `${API}/payment-pdf/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    alert("PDF generation failed");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Supplier_Payment_${paymentId}.pdf`;
  a.click();

  window.URL.revokeObjectURL(url);
};

const loadRestaurants = async (supplierId) => {

  const res = await fetch(`${API}/restaurants/${supplierId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  setRestaurants(Array.isArray(data) ? data : []);
};

const filteredOrders = orders.filter(o => {

  if (searchOrder && !String(o.order_id).includes(searchOrder))
    return false;

  if (
  restaurantFilter !== null &&
  Number(o.restaurant_id) !== restaurantFilter
) return false;
   

  // ✅ Payment status filter
  if (
    paymentStatusFilter !== "ALL" &&
    o.supplier_payment_status !== paymentStatusFilter
  )
    return false;

  // ✅ Order status filter
  if (
    orderStatusFilter !== "ALL" &&
    o.status !== orderStatusFilter
  )
    return false;

  if (
    minDue &&
    Number(o.supplier_due_amount) < Number(minDue)
  )
    return false;

  return true;
});

  return (
    <div className="dashboard_page">

      <h2>Supplier Credit Payments</h2>

      {/* Supplier Select */}
      <div className="card p-3 mb-3">

        <label>Select Supplier</label>

        <select
          className="form-control"
          onChange={(e) => {
            const sup = suppliers.find(
              s => s.supplier_id == e.target.value
            );

            setSelectedSupplier(sup);

            if (sup) {
              loadOrders(sup.supplier_id);
              loadPayments(sup.supplier_id);
              loadRestaurants(sup.supplier_id);
              loadPaidOrders(sup.supplier_id);
            }
          }}
        >
          <option value="">-- Select Supplier --</option>

          {suppliers.map(s => (
            <option key={s.supplier_id} value={s.supplier_id}>
              {s.supplier_name} — Due QAR {s.total_due}
            </option>
          ))}
        </select>

        {/* ✅ MOVE HERE */}
        {/* <button
          className="btn btn-outline-success w-100 mt-2"
          onClick={() => setShowPaid(!showPaid)}
          disabled={!selectedSupplier}
        >
          {showPaid ? "Hide Paid Orders" : "View Paid Orders"}
        </button> */}

      </div>


      {selectedSupplier && (

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

                {/* Restaurant Filter */}
                <div className="col-md-3">
                  <label>Restaurant</label>
                  <select
                    className="form-control"
                    value={restaurantFilter || ""}
                    onChange={(e) =>
                      setRestaurantFilter(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  >
                    <option value="">All</option>

                    {restaurants.map(r => (
                      <option key={r.restaurant_id} value={r.restaurant_id}>
                        {r.restaurant_name_english}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="col-md-3">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="PAID">Paid</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <label>Order Status</label>
                  <select
                    className="form-control"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All</option>
                    <option value="PLACED">Placed</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>

                {/* Min Due */}
                <div className="col-md-2">
                  <label>Min Due</label>
                  <input
                    className="form-control"
                    placeholder="QAR"
                    value={minDue}
                    onChange={(e) => setMinDue(e.target.value)}
                  />
                </div>

                {/* Reset */}
                <div className="col-md-1 d-flex align-items-end">
                  <button
                    className="btn btn-secondary w-100"
                    onClick={() => {
                      setSearchOrder("");
                      setRestaurantFilter(null);
                      setPaymentStatusFilter("ALL");
                      setOrderStatusFilter("ALL");
                      setStatusFilter("ALL");
                      setMinDue("");
                    }}
                  >
                    ↺
                  </button>
                </div>

              </div>

            </div>

            <div className="mb-2 d-flex gap-2">

              <button
                className={`btn ${activeTab === "PENDING" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setActiveTab("PENDING")}
              >
                Pending Orders
              </button>

              <button
                className={`btn ${activeTab === "PAID" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setActiveTab("PAID")}
              >
                Paid Orders
              </button>

            </div>

            {/* <div className="card p-3">

              <h5>Pending Credit Orders</h5>

              <table className="table table-hover">

                <thead>
                  <tr>
                    <th></th>
                    <th>Order</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th>Order Status</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredOrders.map(o => (

                    <tr key={o.order_id}>

                      <td>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(o.order_id)}
                          onChange={() => toggleOrder(o)}
                        />
                      </td>

                      <td>{o.order_id}</td>

                      <td>QAR {o.total_amount}</td>

                      <td>QAR {o.supplier_paid_amount}</td>

                      <td className="text-danger">
                        QAR {o.supplier_due_amount}
                      </td>

                      <td>{o.supplier_payment_status}</td>

                      <td>
                        <span
                          className={
                            o.status === "DELIVERED"
                              ? "badge bg-success"
                              : o.status === "PACKED"
                              ? "badge bg-warning"
                              : "badge bg-danger"
                          }
                        >
                          {o.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setViewOrder(o)}
                        >
                          View
                        </button>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div> */}

 <div className="card p-3">

  <h5>
    {activeTab === "PENDING"
      ? "Pending Credit Orders"
      : "Paid Credit Orders"}
  </h5>

  <table className="table table-hover">

    <thead>
      <tr>
        {activeTab === "PENDING" && <th></th>}
        <th>Order</th>
        <th>Total</th>
        <th>Paid</th>
        <th>Due</th>
        <th>Status</th>
        {activeTab === "PENDING" && <th>Order Status</th>}
        {activeTab === "PENDING" && <th>Action</th>}
      </tr>
    </thead>

    <tbody>

      {(activeTab === "PENDING" ? filteredOrders : paidOrders).map(o => (

        <tr key={o.order_id}>

          {/* Checkbox only for pending */}
          {activeTab === "PENDING" && (
            <td>
              <input
                type="checkbox"
                checked={selectedOrders.includes(o.order_id)}
                onChange={() => toggleOrder(o)}
              />
            </td>
          )}

          <td>{o.order_id}</td>

          <td>QAR {o.total_amount}</td>

          <td>QAR {o.supplier_paid_amount}</td>

          <td className="text-danger">
            QAR {o.supplier_due_amount}
          </td>

          <td>
            <span
              className={
                o.supplier_payment_status === "PAID"
                  ? "badge bg-success"
                  : "badge bg-warning"
              }
            >
              {o.supplier_payment_status}
            </span>
          </td>

          {/* Order Status */}
          {activeTab === "PENDING" && (
            <td>
              <span
                className={
                  o.status === "DELIVERED"
                    ? "badge bg-success"
                    : o.status === "OUT_FOR_DELIVERY"
                    ? "badge bg-warning"
                    : "badge bg-danger"
                }
              >
                {o.status}
              </span>
            </td>
          )}

          {/* ✅ VIEW BUTTON BACK */}
          {activeTab === "PENDING" && (
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

      ))}

      {(activeTab === "PENDING" ? filteredOrders : paidOrders).length === 0 && (
        <tr>
          <td colSpan="8" className="text-center">
            No {activeTab === "PENDING" ? "pending" : "paid"} orders
          </td>
        </tr>
      )}

    </tbody>

  </table>

</div>

          </div>


          {/* Payment Panel */}
          <div className="col-md-4">

            <div className="card p-3">

              <h5>Payment Summary</h5>

              <p>Total Due: <b>QAR {totalSelected.toFixed(2)}</b></p>

              <label>Amount Paying</label>
              <input
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Leave empty for full"
              />

              <label className="mt-2">Payment Mode</label>
              <select
                className="form-control"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="BANK">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
              </select>

              <label className="mt-2">Reference No</label>
              <input
                className="form-control"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />

              <label className="mt-2">Remarks</label>
              <textarea
                className="form-control"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <label className="mt-2">Upload Receipt</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setReceipt(e.target.files[0])}
              />

              <button
                className="btn btn-success w-100 mt-3"
                onClick={paySupplier}
                disabled={selectedOrders.length === 0}
              >
                Pay Supplier
              </button>

              <button
                className="btn btn-outline-primary w-100 mt-2"
                onClick={() => setShowHistory(true)}
                >
                View Payment History
                </button>

            </div>



          </div>

        </div>

      )}

      {/* {showPaid && (
        <div className="card p-3 mt-3">

          <h5>Paid Credit Orders</h5>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Order</th>
                <th>Restaurant</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {paidOrders.map(o => (
                <tr key={o.order_id}>
                  <td>{o.order_id}</td>
                  <td>{o.restaurant_name_english}</td>
                  <td>QAR {o.total_amount}</td>
                  <td className="text-success">
                    QAR {o.supplier_paid_amount}
                  </td>
                  <td>
                    <span className="badge bg-success">
                      {o.supplier_payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )} */}

      {showHistory && (

  <div className="modal_show">

    <div className="modal_box" style={{ width: 800 }}>

      <h4>Payment History — {selectedSupplier?.supplier_name}</h4>

      <hr />

      <table className="table table-sm">

        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Mode</th>
            <th>Reference</th>
            <th>Order IDs</th>
            <th>Receipt</th>
          </tr>
        </thead>

        <tbody>

          {payments.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center">
                No payments found
              </td>
            </tr>
          )}

          {payments.map(p => (

            <tr key={p.payment_id}>

              <td>
                {new Date(p.created_at).toLocaleDateString()}
              </td>

              <td>QAR {p.amount}</td>

              <td>{p.payment_mode}</td>

              <td>{p.reference_no}</td>
              <td>
                    {Array.isArray(p.order_ids)
                    ? p.order_ids.join(", ")
                    : ""}
                </td>

              <td>

                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => downloadPaymentPDF(p.payment_id)}
                >
                  PDF
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <div className="text-end">

        <button
          className="btn btn-secondary"
          onClick={() => setShowHistory(false)}
        >
          Close
        </button>

      </div>

    </div>

  </div>

)}

{/* ================= ORDER MODAL ================= */}
{viewOrder && (

  <div className="modal_show">

    <div className="modal_box" style={{ width: 750 }}>

      <h4 className="text-center fw-bold mb-3">
        Order Details — {viewOrder.order_id}
      </h4>

      <hr />

      {/* ================= TOP SECTION ================= */}
      <div className="row">

        {/* SUPPLIER */}
        <div className="col-6">
          <div className="info_card_compact">

            <h6 className="section_heading text-center">Supplier</h6>

            <div className="info_row"><span>Company</span><span>{viewOrder.supplier_name}</span></div>
            <div className="info_row"><span>Contact</span><span>{viewOrder.supplier_contact}</span></div>
            <div className="info_row"><span>Phone</span><span>{viewOrder.supplier_mobile}</span></div>
            <div className="info_row"><span>Email</span><span>{viewOrder.supplier_email}</span></div>
            <div className="info_row"><span>City</span><span>{viewOrder.supplier_city}</span></div>
            <div className="info_row"><span>Bank</span><span>{viewOrder.bank_name}</span></div>

          </div>
        </div>

        {/* RESTAURANT */}
        <div className="col-6">
          <div className="info_card_compact">

            <h6 className="section_heading text-center">Restaurant</h6>

            <div className="info_row"><span>Name</span><span>{viewOrder.restaurant_name_english}</span></div>
            <div className="info_row"><span>Contact</span><span>{viewOrder.contact_person_name}</span></div>
            <div className="info_row"><span>Phone</span><span>{viewOrder.contact_person_mobile}</span></div>
            <div className="info_row"><span>City</span><span>{viewOrder.city}</span></div>
            <div className="info_row"><span>Address</span><span>{viewOrder.address}</span></div>

          </div>
        </div>

      </div>

      {/* ================= ORDER INFO ================= */}
      <div className="mt-4">
        <h6 className="text-center fw-semibold mb-3">Order Info</h6>

        <div className="credit_row">

          <div className="credit_small">
            <small>Order Date</small>
            <div>{viewOrder.order_date}</div>
          </div>

          <div className="credit_small">
            <small>Total Value</small>
            <div>QAR {viewOrder.total_amount}</div>
          </div>

        </div>
      </div>

      {/* ================= PAYMENT SECTION ================= */}
      <div className="mt-4">
        <h6 className="text-center fw-semibold mb-3">Payment Status</h6>

        <div className="credit_row">

          <div className="credit_small">
            <small>Restaurant Received</small>
            <div className="text-success">
              QAR {viewOrder.restaurant_paid_amount}
            </div>
            <small className="text-danger">
              Pending: QAR {viewOrder.restaurant_due_amount}
            </small>
          </div>

          <div className="credit_small">
            <small>Supplier Paid</small>
            <div className="text-success">
              QAR {viewOrder.supplier_paid_amount}
            </div>
            <small className="text-danger">
              Pending: QAR {viewOrder.supplier_due_amount}
            </small>
          </div>

          <div className="credit_small">
            <small>Admin Net Position</small>
            <div
              className={
                (viewOrder.restaurant_paid_amount -
                 viewOrder.supplier_paid_amount) >= 0
                ? "text-success"
                : "text-danger"
              }
            >
              QAR {(
                viewOrder.restaurant_paid_amount -
                viewOrder.supplier_paid_amount
              ).toFixed(2)}
            </div>
          </div>

        </div>
      </div>

      {/* ================= ITEMS ================= */}
      <div className="mt-4">

        <h6 className="text-center fw-semibold mb-3">Items</h6>

        <table className="table table-bordered table-sm text-center">
          <thead className="table-light">
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {viewOrder.items?.map((it, i) => (
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

      <div className="text-center mt-4">
        <button
          className="btn btn-secondary px-4"
          onClick={() => setViewOrder(null)}
        >
          Close
        </button>
      </div>

    </div>

  </div>

)}
    </div>
  );
}