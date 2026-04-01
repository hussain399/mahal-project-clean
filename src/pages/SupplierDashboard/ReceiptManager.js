// import React from "react";

// const ReceiptManager = () => {
//   return (
//     <div className="dashboard_page">
//       <h2>Receipt Manager</h2>
//       <p>Manage payment receipts.</p>
//     </div>
//   );
// };

// export default ReceiptManager;



// import React, { useEffect, useState } from "react";
// import ReceiptView from "../../components/Dashboard/ReceiptView";   // ⬅ IMPORTANT
// import "../../css/OrdersDashboard.css";

// const API = "http://127.0.0.1:5000/api/v1/orders";

// export default function ReceiptManager() {
//   const [orders, setOrders] = useState([]);
//   const [filter, setFilter] = useState("");
//   const [selectedOrderId, setSelectedOrderId] = useState(null);
//   const token = localStorage.getItem("token");

//   // Load PAID Orders Only
//   useEffect(() => {
//     if (!token) return;

//     fetch(`${API}/`, {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (Array.isArray(data)) {
//           setOrders(data.filter(o => o.payment_status === "PAID"));
//         }
//       })
//       .catch(err => console.error("Receipt fetch error:", err));
//   }, [token]);

//   const filtered = orders.filter(o =>
//     String(o.order_id).includes(filter)
//   );

//   return (
//     <div className="orders-page">
//       <h2 className="page-title">Receipt History</h2>

//       <div className={`orders-layout ${selectedOrderId ? "has-selection" : ""}`}>

//         {/* LEFT — RECEIPT LIST */}
//         <div className="orders-left">

//           <div className="filter-box">
//             <input
//               className="search-input"
//               placeholder="Search Order ID..."
//               value={filter}
//               onChange={e => setFilter(e.target.value)}
//             />
//           </div>

//           <table className="orders-table">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Order ID</th>
//                 <th>Restaurant</th>
//                 <th>Total</th>
//                 <th>Payment</th>
//                 <th>Date</th>
//                 <th>Receipt</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((o, i) => (
//                 <tr key={o.order_id}>
//                   <td>{i + 1}</td>
//                   <td>{o.order_id}</td>
//                   <td>{o.restaurant_name}</td>
//                   <td>${o.total_amount}</td>
//                   <td>
//                     <span className="status PAID">PAID</span>
//                   </td>
//                   <td>{new Date(o.order_date).toLocaleDateString()}</td>
//                   <td>
//                     <button
//                       className="btn packed"
//                       onClick={() => setSelectedOrderId(o.order_id)}
//                     >
//                       View Receipt
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//               {filtered.length === 0 && (
//                 <tr>
//                   <td colSpan="7" style={{ textAlign: "center", padding: 15 }}>
//                     No receipts found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* RIGHT — RECEIPT VIEW */}
//         <div className="orders-right">
//           {!selectedOrderId && (
//             <div className="placeholder-box">
//               Select a receipt to view details
//             </div>
//           )}

//           {selectedOrderId && (
//             <ReceiptView
//               orderId={selectedOrderId}
//               onBack={() => setSelectedOrderId(null)}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }






import React, { useEffect, useState } from "react";
import ReceiptView from "./ReceiptView";
import "../css/receipt.css";

const API = "http://127.0.0.1:5000/api/v1/orders";

export default function ReceiptManager() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    fetch(`${API}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data.filter(o => o.payment_status === "PAID"));
        }
      });
  }, [token]);

  return (
    <div className="orders_page">
      <h3 className="page_title">Receipt History</h3>

      <div className="filter_bar modern">
        <input
          type="text"
          placeholder="Search Receipt / Order / Restaurant..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search_input"
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

      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Order ID</th>
              <th>Restaurant</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders
              .filter((o) => {
                const search = searchText.toLowerCase();

                // ✅ SEARCH
                const searchOk =
                  search === "" ||
                  (`RCP-${o.order_id}`).toLowerCase().includes(search) ||
                  o.order_id.toString().includes(search) ||
                  (o.restaurant_name || "").toLowerCase().includes(search);

                // ✅ DATE FILTER
                const orderDate = new Date(o.order_date);

                const fromOk = fromDate
                  ? orderDate >= new Date(fromDate).setHours(0, 0, 0, 0)
                  : true;

                const toOk = toDate
                  ? orderDate <= new Date(toDate).setHours(23, 59, 59, 999)
                  : true;

                return searchOk && fromOk && toOk;
              })
              .map(o => (
              <tr key={o.order_id}>
                <td>RCP-{o.order_id}</td>
                <td>{o.order_id}</td>
                <td>{o.restaurant_name}</td>
                <td>{new Date(o.order_date).toLocaleDateString()}</td>
                <td>QAR {o.total_amount}</td>
                <td>
                  <span className="status received">PAID</span>
                </td>
                <td>
                  <button
                    className="view_btn"
                    onClick={() => setSelectedOrderId(o.order_id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrderId && (
        <ReceiptView
          orderId={selectedOrderId}
          onBack={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}
