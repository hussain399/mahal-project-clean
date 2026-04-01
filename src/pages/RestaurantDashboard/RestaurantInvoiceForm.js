// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../css/OrdersDashboard.css";

// const API = "http://127.0.0.1:5000/api/v1/restaurant/invoices";

// export default function InvoiceForm({ invoiceId, orderId,onBack }) {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");
//   const role = (localStorage.getItem("role") || "").toUpperCase();

//   const [invoices, setInvoices] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [search, setSearch] = useState("");

//   // ===============================
//   // LOAD INVOICE LIST (ROLE BASED)
//   // ===============================
//   useEffect(() => {
//     if (!token) return;

//     fetch(API, {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(data => setInvoices(Array.isArray(data) ? data : []))
//       .catch(() => setInvoices([]));
//   }, [token]);

//   // ===============================
//   // AUTO OPEN INVOICE (FROM ORDER / GENERATE)
//   // ===============================
//   useEffect(() => {
//     if (!invoiceId && !orderId) return;

//     const url = invoiceId
//       ? `${API}/${invoiceId}`
//       : `${API}/by-order/${orderId}`;

//     fetch(url, {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(data => setSelected(data))
//       .catch(() => setSelected(null));
//   }, [invoiceId, orderId, token]);

//   // ===============================
//   // LOAD SINGLE INVOICE
//   // ===============================
//   const loadInvoice = async (id) => {
//     const res = await fetch(`${API}/${id}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     if (!res.ok) {
//       alert("Unable to load invoice");
//       return;
//     }

//     setSelected(await res.json());
//   };

//   // ===============================
//   // DOWNLOAD PDF
//   // ===============================
//   const downloadPdf = async (id) => {
//     const res = await fetch(`${API}/${id}/pdf`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     const blob = await res.blob();
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${id}.pdf`;
//     a.click();
//   };

//   // ===============================
//   // FILTER
//   // ===============================
//   const filtered = invoices.filter(i =>
//     String(i.invoice_number || "")
//       .toLowerCase()
//       .includes(search.toLowerCase())
//   );

//   return (
//     <div className="orders-page">
//       <h2 className="page-title">Invoices</h2>
//       <button className="btn_add_item_v2" onClick={onBack}>
//           <i className="fa fa-arrow-left me-2"></i>Back
//         </button>

//       <div className={`orders-layout ${selected ? "has-selection" : ""}`}>

//         {/* ================= LEFT ================= */}
//         <div className="orders-left">
//           <div className="filter-box">
//             <input
//               placeholder="Search Invoice Number..."
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               className="search-input"
//             />
//           </div>

//           <table className="orders-table">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Invoice</th>
//                 <th>Order</th>
//                 <th>Date</th>
//                 <th>Total</th>
//                 <th>Status</th>
//                 <th />
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((i, idx) => (
//                 <tr key={i.invoice_id}>
//                   <td>{idx + 1}</td>
//                   <td>{i.invoice_number}</td>
//                   <td>{i.order_id}</td>
//                   <td>{new Date(i.invoice_date).toLocaleDateString()}</td>
//                   <td>QAR {i.grand_total}</td>
//                   <td>
//                     <span className={`status ${i.invoice_status}`}>
//                       {i.invoice_status}
//                     </span>
//                   </td>
//                   <td>
//                     <button
//                       className={`view-btn ${
//                         selected?.header?.invoice_id === i.invoice_id ? "close" : ""
//                       }`}
//                       onClick={() => {
//                         if (selected?.header?.invoice_id === i.invoice_id) {
//                           setSelected(null);          // CLOSE
//                         } else {
//                           loadInvoice(i.invoice_id);  // OPEN
//                         }
//                       }}
//                     >
//                       {selected?.header?.invoice_id === i.invoice_id ? "Close" : "View"}
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//               {filtered.length === 0 && (
//                 <tr>
//                   <td colSpan="7" style={{ textAlign: "center" }}>
//                     No invoices found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* ================= RIGHT ================= */}
//         <div className="orders-right">
//           {!selected && (
//             <div className="placeholder-box">
//               Select an invoice to view details
//             </div>
//           )}

//           {selected && (
//             <>
//               {/* ACTIONS */}
//               <div style={{ textAlign: "right", marginBottom: 12 }}>
//                 <button onClick={() => downloadPdf(selected.header.invoice_id)}>
//                   Download PDF
//                 </button>
//               </div>

//               {/* ================= SUMMARY ================= */}
//               <div className="info-box">
//                 <h3>Invoice Summary</h3>

//                 <div className="info-row">
//                   <span>Invoice</span>
//                   <span>{selected.header.invoice_number}</span>
//                 </div>

//                 <div className="info-row">
//                   <span>Order</span>
//                   <span>{selected.header.order_id}</span>
//                 </div>

//                 <div className="info-row">
//                   <span>Status</span>
//                   <span className={`status ${selected.header.invoice_status}`}>
//                     {selected.header.invoice_status}
//                   </span>
//                 </div>

//                 <div className="info-row">
//                   <span>Invoice Date</span>
//                   <span>
//                     {new Date(selected.header.invoice_date).toLocaleString()}
//                   </span>
//                 </div>

//                 {/* ✅ ADDED – FULL AMOUNT BREAKUP */}
//                 <div className="info-row">
//                   <span>Subtotal</span>
//                   <span>QAR {selected.header.subtotal_amount}</span>
//                 </div>

//                 <div className="info-row">
//                   <span>Discount</span>
//                   <span>QAR {selected.header.discount_amount}</span>
//                 </div>

//                 <div className="info-row">
//                   <span>Tax</span>
//                   <span>QAR {selected.header.tax_amount}</span>
//                 </div>

//                 <div className="info-row">
//                   <span><b>Grand Total</b></span>
//                   <span><b>QAR {selected.header.grand_total}</b></span>
//                 </div>

//                 <div className="info-row">
//                   <span>Payment Status</span>
//                   <span>{selected.header.payment_status}</span>
//                 </div>
//               </div>

//               {/* ================= SUPPLIER DETAILS (ADDED) ================= */}
//               <div className="info-box">
//                 <h3>Supplier Details</h3>

//                 <div className="info-row">
//                   <span>Name</span>
//                   <span>{selected.header.supplier_name}</span>
//                 </div>

//                 <div className="info-row">
//                   <span>Contact</span>
//                   <span>{selected.header.supplier_contact_name}</span>
//                 </div>

//                 <div className="info-row">
//                   <span>Mobile</span>
//                   <span>{selected.header.supplier_contact_mobile}</span>
//                 </div>

//                 <div className="info-row">
//                   <span>Email</span>
//                   <span>{selected.header.supplier_email}</span>
//                 </div>
//               </div>

//               {/* ================= ITEMS ================= */}
//               <div className="info-box">
//                 <h3>Items</h3>

//                 <table className="details-table">
//                   <thead>
//                     <tr>
//                       <th>Product</th>
//                       <th>Qty</th>
//                       <th>Price</th>
//                       <th>Discount</th>
//                       <th>Total</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {selected.items.map((i, idx) => (
//                       <tr key={idx}>
//                         <td>{i.product_name_english}</td>
//                         <td>{i.quantity}</td>
//                         <td>{i.price_per_unit}</td>
//                         <td>{i.discount}</td>
//                         <td>{i.total_amount}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

















import React, { useEffect, useState } from "react";
// import "../css/OrdersDashboard.css";
import RestaurantInvoiceDetailsModal from "./RestaurantInvoiceDetails";

const API = "http://127.0.0.1:5000/api/v1/restaurant/invoices";

export default function InvoiceForm({ invoiceId, orderId, onBack }) {
  const token = localStorage.getItem("token");

  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  /* ================= LOAD LIST ================= */
  useEffect(() => {
    if (!token) return;

    fetch(API, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setInvoices([]));
  }, [token]);

  /* ================= AUTO OPEN ================= */
  useEffect(() => {
    if (!invoiceId && !orderId) return;

    const url = invoiceId
      ? `${API}/${invoiceId}`
      : `${API}/by-order/${orderId}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSelected(data))
      .catch(() => setSelected(null));
  }, [invoiceId, orderId, token]);

  /* ================= LOAD SINGLE ================= */
  const loadInvoice = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      setSelected(await res.json());
    } catch {
      alert("Unable to load invoice");
    }
  };

  /* ================= FILTER ================= */
  const filteredInvoices = invoices.filter((i) =>
    String(i.invoice_number || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="orders_page">
      <h3 className="page_title">Invoice History</h3>

      {/* <button className="btn_add_item_v2" onClick={onBack}>
        ← Back
      </button> */}

      {/* SEARCH */}
      <div className="filter-box">
        <input
          placeholder="Search Invoice Number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* TABLE */}
      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>#</th>
              <th>Invoice</th>
              <th>Order</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                  No invoices found
                </td>
              </tr>
            )}

            {filteredInvoices.map((inv, idx) => (
              <tr key={inv.invoice_id}>
                <td>{idx + 1}</td>
                <td>{inv.invoice_number}</td>
                <td>{inv.order_id}</td>
                <td>
                  {inv.invoice_date
                    ? new Date(inv.invoice_date).toLocaleDateString()
                    : "-"}
                </td>
                <td>QAR {inv.grand_total}</td>
                <td>
                  <span className={`status ${inv.invoice_status}`}>
                    {inv.invoice_status}
                  </span>
                </td>
                <td>
                  <button
                    className="view_btn"
                    onClick={() => loadInvoice(inv.invoice_id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selected && (
        <RestaurantInvoiceDetailsModal
          invoice={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

