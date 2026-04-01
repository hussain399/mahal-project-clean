// import React from "react";
// import { FaBox, FaBook, FaCartPlus, FaFileInvoice } from "react-icons/fa";

// const ReportsHome = ({ setActiveSubmenu, setActiveTab }) => {
//   const go = (submenu) => {
//     setActiveTab("supplier");
//     setActiveSubmenu(submenu);
//   };

//   return (
    
//     <div style={{ padding: 30, background: "linear-gradient(135deg,rgba(228, 154, 58, 0.68) 0%,hsla(19, 88%, 49%, 0.93) 100% )", borderRadius:15 }}>
//       <h2 style={{ marginBottom: 6 }}>📊 Reports</h2>
//       <p style={{ marginBottom: 30, color: "#000" }}>
//         Select a report module
//       </p>

//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
//           gap: 20,
//         }}
//       >
//         <div className="orange-card" onClick={() => go("inventory-report")}>
//           <FaBox size={34} />
//           <h3>Inventory Report</h3>
//           <p>Stock, expiry & availability</p>
//         </div>

//         <div className="orange-card" onClick={() => go("product-report")}>
//           <FaBook size={34} />
//           <h3>Product Report</h3>
//           <p>Product master & status</p>
//         </div>

//         <div className="orange-card" onClick={() => go("order-report")}>
//           <FaCartPlus size={34} />
//           <h3>Order Report</h3>
//           <p>Received orders</p>
//         </div>

//         <div className="orange-card" onClick={() => go("invoice-report")}>
//           <FaFileInvoice size={34} />
//           <h3>Invoice Report</h3>
//           <p>Generated invoices</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReportsHome;