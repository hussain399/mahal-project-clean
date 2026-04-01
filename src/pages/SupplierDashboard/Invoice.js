// // src/pages/Dashboard/Invoice.js
// import React, { useState } from "react";
// import InvoiceDetailsModal from "./InvoiceDetailsModal";

// const Invoice = () => {
//   const [selectedInvoice, setSelectedInvoice] = useState(null);

//   const [invoices, setInvoices] = useState([
//     {
//       id: "INV-20260101113551",
//       orderId: "ORD-2025-025",
//       restaurant: "Royal Spice Restaurant",
//       date: "01/01/2026",
//       total: 190,
//       status: "GENERATED",

//       supplier: {
//         store: "Sandeep Stores",
//         contact: "Suresh",
//         mobile: "08975698452",
//         email: "Sultan@07@gmail.com",
//         address: "LB Nagar, Hyderabad",
//       },

//       restaurantDetails: {
//         name: "Royal Spice Restaurant",
//         contact: "Sara Mohammed",
//         mobile: "50334455",
//         email: "storemain@sunrise.com",
//         address: "Al Waab Street, Zone 55, Building 22",
//       },

//       products: [
//         { name: "Tomatoes", qty: 18, price: 5 },
//         { name: "Onions", qty: 20, price: 5 },
//       ],
//     },
//   ]);

//   return (
//     <div className="orders_page">
//       <h3 className="page_title">Invoice History</h3>

//       <div className="table_wrapper">
//         <table className="orders_table">
//           <thead>
//             <tr>
//               <th>Invoice ID</th>
//               <th>Order ID</th>
//               <th>Restaurant</th>
//               <th>Date</th>
//               <th>Total</th>
//               <th>Status</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {invoices.map((inv) => (
//               <tr key={inv.id}>
//                 <td>{inv.id}</td>
//                 <td>{inv.orderId}</td>
//                 <td>{inv.restaurant}</td>
//                 <td>{inv.date}</td>
//                 <td>${inv.total}</td>
//                 <td>
//                   <span className={`status generated`}>
//                     {inv.status}
//                   </span>
//                 </td>
//                 <td>
//                   <button
//                     className="view_btn"
//                     onClick={() => setSelectedInvoice(inv)}
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {selectedInvoice && (
//         <InvoiceDetailsModal
//           invoice={selectedInvoice}
//           onClose={() => setSelectedInvoice(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default Invoice;




// src/pages/Dashboard/Invoice.js
import React, { useEffect, useState } from "react";
import InvoiceDetailsModal from "./InvoiceDetailsModal";
import "../css/receipt.css";
const API = "http://127.0.0.1:5000/api/v1/invoice";

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchInvoiceId, setSearchInvoiceId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const token = localStorage.getItem("token");

  /* =========================
     LOAD INVOICE LIST
  ========================= */
  useEffect(() => {
    if (!token) return;

    fetch(API, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Invoice list fetch failed:", err);
        setInvoices([]);
      });
  }, [token]);

  /* =========================
     LOAD SINGLE INVOICE
  ========================= */
  const loadInvoice = async (invoiceId) => {
    try {
      const res = await fetch(`${API}/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSelectedInvoice(data);
    } catch (err) {
      alert("Unable to load invoice");
    }
  };

  /* =========================
     FILTER
  ========================= */
  const filteredInvoices = invoices.filter((i) => {
    const search = searchInvoiceId.toLowerCase();

    // ✅ SEARCH (multi-field)
    const searchOk =
      search === "" ||
      String(i.invoice_id).includes(search) ||
      String(i.order_id).includes(search) ||
      (i.restaurant_name_english || "").toLowerCase().includes(search);

    // ✅ DATE FILTER
    const invoiceDate = new Date(i.invoice_date);

    const fromOk = fromDate
      ? invoiceDate >= new Date(fromDate).setHours(0, 0, 0, 0)
      : true;

    const toOk = toDate
      ? invoiceDate <= new Date(toDate).setHours(23, 59, 59, 999)
      : true;

    return searchOk && fromOk && toOk;
  });

  return (
    <div className="orders_page">
      <h3 className="page_title">Invoice History</h3>

      {/* SEARCH */}
      <div className="filter_bar modern">

        <input
          type="text"
          placeholder="Search Invoice / Order / Restaurant..."
          value={searchInvoiceId}
          onChange={(e) => setSearchInvoiceId(e.target.value)}
          className="search-input"
        />
      {/* <div className="date_group"> */}
        <label>From:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="date_input"
        />
      {/* </div> */}
      {/* <div className="date_group"> */}
        <label>To:</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="date_input"
        />
      {/* </div> */}

      </div>

      {/* TABLE */}
      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>#</th>
              <th>Invoice ID</th>
              <th>Order ID</th>
              <th>Restaurant</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: 20 }}>
                  No invoices found
                </td>
              </tr>
            )}

            {filteredInvoices.map((inv, index) => (
              <tr key={inv.invoice_id}>
                <td>{index + 1}</td>
                <td>{inv.invoice_id}</td>
                <td>{inv.order_id}</td>
                <td>{inv.restaurant_name_english}</td>
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

      {/* DETAILS MODAL */}
      {selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default Invoice;
