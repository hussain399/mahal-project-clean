import React, { useEffect, useState } from "react";
import "../css/suppliercredit.css";
import { useLocation } from "react-router-dom";
const API = "http://192.168.1.193:5000/api/supplier/credit";

export default function SupplierCreditWallet() {

  const token = localStorage.getItem("token");
  const location = useLocation();
  const [summary, setSummary] = useState({});
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState(
    location.state?.openTab || "orders"
  );
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [highlightOrders, setHighlightOrders] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const toggleExpand = (id) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };
  useEffect(() => {
    if (!token) return;
    loadSummary();
    loadOrders();
    loadPayments();
  }, [token]);
useEffect(() => {
  if (location.state?.paymentId) {
    setExpandedRow(Number(location.state.paymentId));
  }
}, [payments]);





  const loadSummary = async () => {
    try {

      const res = await fetch(`${API}/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      setSummary(data);

    } catch (err) {
      console.error("Summary error", err);
    }
  };



  const loadOrders = async () => {
    try {

      const res = await fetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      setOrders(data);

    } catch (err) {
      console.error("Orders error", err);
    }
  };



  const loadPayments = async () => {
    try {

      const res = await fetch(`${API}/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      setPayments(data);

    } catch (err) {
      console.error("Payments error", err);
    }
  };



  const formatCurrency = (val) => {
    return `QAR ${Number(val || 0).toFixed(2)}`;
  };



  return (
    <div className="supplier_wallet">

      <h2>Supplier Credit Wallet</h2>

      {/* SUMMARY CARDS */}

      <div className="wallet_cards">

        <div className="wallet_card">
          <h4>Total Orders</h4>
          <p>{summary.total_orders || 0}</p>
        </div>

        <div className="wallet_card">
          <h4>Total Value</h4>
          <p>{formatCurrency(summary.total_amount)}</p>
        </div>

        <div className="wallet_card paid">
          <h4>Admin Paid</h4>
          <p>{formatCurrency(summary.paid_amount)}</p>
        </div>

        <div className="wallet_card due">
          <h4>Outstanding</h4>
          <p>{formatCurrency(summary.due_amount)}</p>
        </div>

      </div>



      {/* NAVIGATION */}

      <div className="wallet_nav">

        <button
          className={tab === "orders" ? "active" : ""}
          onClick={() => setTab("orders")}
        >
          Credit Orders
        </button>

        <button
          className={tab === "payments" ? "active" : ""}
          onClick={() => setTab("payments")}
        >
          Payment History
        </button>

      </div>

      <div className="wallet_filters">

        <input
          type="text"
          placeholder={
            tab === "orders"
              ? "Search Order ID / Restaurant..."
              : "Search Payment ID / Reference..."
          }
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

      </div>



      {/* CREDIT ORDERS */}

      {tab === "orders" && (

        <div className="wallet_table">
        <table>

          <thead>
            <tr>
              <th>Order</th>
              <th>Restaurant</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No credit orders found
                </td>
              </tr>
            )}

            {orders
                .filter((o) => {
                  const search = searchText.toLowerCase();

                  const searchOk =
                    search === "" ||
                    o.order_id.toString().includes(search) ||
                    (o.restaurant_name_english || "").toLowerCase().includes(search);

                  const orderDate = new Date(o.created_at || o.order_date);

                  const fromOk = fromDate
                    ? orderDate >= new Date(fromDate).setHours(0,0,0,0)
                    : true;

                  const toOk = toDate
                    ? orderDate <= new Date(toDate).setHours(23,59,59,999)
                    : true;

                  return searchOk && fromOk && toOk;
                })
                .map(o => (

              <tr key={o.order_id}>
                <td>{o.order_id}</td>
                <td>{o.restaurant_name_english}</td>
                <td>{formatCurrency(o.total_amount)}</td>
                <td>{formatCurrency(o.supplier_paid_amount)}</td>
                <td className="text-danger">{formatCurrency(o.supplier_due_amount)}</td>
                <td className={o.supplier_due_amount > 0 ? "status_due" : "status_paid"}>
                {o.supplier_payment_status}
                </td>
              </tr>

            ))}

          </tbody>

        </table>
        </div>

      )}



      {/* PAYMENT HISTORY */}

      {tab === "payments" && (

        <div className="wallet_table">
        <table>

          <thead>
            <tr>
              <th>Date</th>
              <th>Payment ID</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Reference</th>
              <th>Orders</th>
              <th>Paid By</th>
              <th>Receipt</th>
            </tr>
          </thead>

          <tbody>

            {payments.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center">
                  No payments yet
                </td>
              </tr>
            )}

            {payments
                .filter((p) => {
                  const search = searchText.toLowerCase();

                  const searchOk =
                    search === "" ||
                    p.payment_id.toString().includes(search) ||
                    (p.reference_no || "").toLowerCase().includes(search);

                  const paymentDate = new Date(p.created_at);

                  const fromOk = fromDate
                    ? paymentDate >= new Date(fromDate).setHours(0,0,0,0)
                    : true;

                  const toOk = toDate
                    ? paymentDate <= new Date(toDate).setHours(23,59,59,999)
                    : true;

                  return searchOk && fromOk && toOk;
                })
              .map(p => {

                const orderIds = Array.isArray(p.order_ids)
                  ? p.order_ids
                  : JSON.parse(p.order_ids || "[]");

                return (

                      <tr
                    key={p.payment_id}
                    className={
                      highlightOrders.some(id => orderIds.includes(id))
                        ? "highlight_row"
                        : ""
                    }
                  >

                    <td>
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>

                    <td>
                      PAY-{p.payment_id}
                    </td>

                    <td className="text-success">
                      {formatCurrency(p.amount)}
                    </td>

                    <td>{p.payment_mode}</td>

                    <td>{p.reference_no || "-"}</td>

                    <td>
  <div className="order_ids_container">

    {orderIds.slice(0, 3).map(id => (
      <span
        key={id}
        className={`order_chip ${
          highlightOrders.includes(id) ? "highlight" : ""
        }`}
      >
        #{id}
      </span>
    ))}

    {/* SHOW +MORE ONLY IF NOT AUTO EXPANDED */}
    {orderIds.length > 3 && expandedRow !== p.payment_id && (
      <span
        className="expand_chip"
        onClick={() => setExpandedRow(p.payment_id)}
      >
        +{orderIds.length - 3}
      </span>
    )}
  </div>

  {/* AUTO EXPAND */}
  {expandedRow === p.payment_id && (
    <div className="expanded_orders">
      {orderIds.map(id => (
        <div key={id} className="expanded_order_item">
          Order #{id}
        </div>
      ))}
    </div>
  )}
</td>

                    <td>{p.paid_by || "-"}</td>

                    <td>
                      <div className="payment_actions">

                        {p.receipt_filename && (
                          <button
                            className="btn_download"
                            onClick={() =>
                              window.open(`${API}/receipt/${p.payment_id}?token=${token}`, "_blank")
                            }
                          >
                            Receipt
                          </button>
                        )}

                        <button
                          className="btn_pdf"
                          onClick={() =>
                            window.open(`${API}/payment-pdf/${p.payment_id}?token=${token}`, "_blank")
                          }
                        >
                          PDF
                        </button>

                      </div>
                    </td>

                  </tr>

                );

              })}

          </tbody>

        </table>
        </div>

      )}

    </div>
  );
}