// import React from "react";
// import { useNavigate } from "react-router-dom";

// const Orders = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="dashboard_page">

//       {/* HEADER */}
//       <div className="page_header">
//         <h2>My Orders</h2>
//         <p className="page_subtitle">
//           View and manage all your restaurant orders
//         </p>
//       </div>

//       {/* FILTER */}
//    <div className="card filter_bar">
//   <div className="filter_left">
//     <input
//       type="text"
//       className="form-control search_input"
//       placeholder="Search Order ID / Supplier"
//     />

//     <select className="form-select status_select">
//       <option>All Status</option>
//       <option>Out For Delivery</option>
//       <option>Delivered</option>
//       <option>Cancelled</option>
//     </select>
//   </div>

//   <div className="filter_right">
//     <span className="orders_found">
//       <i className="fa fa-check me-1"></i> 4 Orders Found
//     </span>
//   </div>
// </div>


//       {/* TABLE */}
//       <div className="card mt-3">

//         <table className="table order_table">
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>Date</th>
//               <th>Supplier</th>
//               <th>Total</th>
//               <th>Status</th>
//               <th className="text-end">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             <tr>
//               <td>ORD12345</td>
//               <td>April 24, 2024</td>
//               <td>Fresh Supplies</td>
//               <td>QAR450</td>
//               <td><span className="status_badge warning">Out For Delivery</span></td>
//               <td className="text-end">
//                 <button
//                   className="btn btn-primary btn-sm"
//                   onClick={() => navigate("/restaurantdashboard/orders/ORD12345")}
//                 >
//                   View Details
//                 </button>
//               </td>
//             </tr>

//             <tr>
//               <td>ORD12344</td>
//               <td>April 23, 2024</td>
//               <td>Veggie Mart</td>
//               <td>QAR180</td>
//               <td><span className="status_badge success">Delivered</span></td>
//              <td className="text-end">
//   <button
//     className="btn btn-primary btn-sm action_btn"
//     onClick={() =>
//       navigate("/restaurantdashboard/orders/ORD12345")
//     }
//   >
//     View Details
//   </button>
// </td>

//             </tr>
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// };

// export default Orders;











// import React, { useEffect, useState } from "react";
// // import "../css/RestaurantOrders.css";
// import OrderTrack from "./TrackOrder";
// import OrderDetails from "./OrderDetails";
// // import CreateGRN from "./CreateGRN";

// const API = "http://127.0.0.1:5000/api/v1/orders/restaurant/orders";

// export default function RestaurantOrders({ goToSubmenu }) {
//   const [orders, setOrders] = useState([]);
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("ALL");
//   const [last30, setLast30] = useState(true);

//   const [trackingOrderId, setTrackingOrderId] = useState(null);
//   const [detailsOrderId, setDetailsOrderId] = useState(null);

//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (trackingOrderId || detailsOrderId) return;

//     const params = new URLSearchParams({
//       search,
//       status,
//       last30: last30 ? "1" : "0",
//     });

//     fetch(`${API}?${params}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then((data) => setOrders(Array.isArray(data) ? data : []))
//       .catch(() => setOrders([]));
//   }, [search, status, last30, trackingOrderId, detailsOrderId]);

//   const statusLabel = (s) => {
//     if (s === "OUT_FOR_DELIVERY") return "Out For Delivery";
//     if (s === "ACCEPTED") return "Confirmed";
//     if (s === "DELIVERED") return "Delivered";
//     if (s === "REJECTED") return "Cancelled";
//     return "Placed";
//   };

//   const statusClass = (s) => {
//     if (s === "DELIVERED") return "success";
//     if (s === "PACKED") return "warning";
//     if (s === "REJECTED") return "danger";
//     return "info";
//   };

//   /* ================= TRACK SCREEN ================= */
//   if (trackingOrderId) {
//     return (
//       <OrderTrack
//         orderId={trackingOrderId}
//         onBack={() => setTrackingOrderId(null)}
//       />
//     );
//   }

//   if (detailsOrderId) {
//     return (
//       <OrderDetails
//         orderId={detailsOrderId}
//         onBack={() => setDetailsOrderId(null)}
//         onTrack={(id) => setTrackingOrderId(id)}
//         goToSubmenu={goToSubmenu}
//       />
//     );
//   }

//   /* ================= ORDER LIST ================= */
//   return (
//     <div className="dashboard_page">

//       {/* HEADER */}
//       <div className="page_header">
//         <h2>My Orders</h2>
//         <p className="page_subtitle">
//           View and manage all your restaurant orders
//         </p>
//       </div>

//       {/* FILTER BAR */}
//       <div className="card filter_bar">
//         <div className="filter_left">
//           <input
//             type="text"
//             className="form-control search_input"
//             placeholder="Search Order ID / Supplier"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />

//           <select
//             className="form-select status_select"
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//           >
//             <option value="ALL">All Status</option>
//             <option value="PLACED">Placed</option>
//             <option value="ACCEPTED">Confirmed</option>
//             <option value="PACKED">Out For Delivery</option>
//             <option value="DELIVERED">Delivered</option>
//             <option value="REJECTED">Cancelled</option>
//           </select>
//         </div>

//         <div className="filter_right">
//           <span className="orders_found">
//             <i className="fa fa-check me-1"></i>
//             {orders.length} Orders Found
//           </span>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="card mt-3">
//         <table className="table order_table">
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>Date</th>
//               <th>Supplier</th>
//               <th>Total</th>
//               <th>Status</th>
//               <th className="text-end">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {orders.length === 0 && (
//               <tr>
//                 <td colSpan="6" className="text-center py-4">
//                   No orders found
//                 </td>
//               </tr>
//             )}

//             {orders.map((o) => (
//               <tr key={o.order_id}>
//                 <td>{o.order_id}</td>

//                 <td>
//                   {new Date(o.order_date).toLocaleDateString()}
//                   <br />
//                   <small>
//                     {new Date(o.order_date).toLocaleTimeString()}
//                   </small>
//                 </td>

//                 <td>{o.supplier_name}</td>

//                 <td>QAR {o.total_amount}</td>

//                 <td>
//                   <span className={`status_badge ${statusClass(o.status)}`}>
//                     {statusLabel(o.status)}
//                   </span>
//                 </td>

//                 <td className="text-end">
//   <button
//     className="btn btn-primary btn-sm"
//     onClick={() => setDetailsOrderId(o.order_id)}
//   >
//     View Details
//   </button>
// </td>

//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import OrderTrack from "./TrackOrder";
import OrderDetails from "./OrderDetails";

const API = "http://127.0.0.1:5000/api/v1/orders/restaurant/orders";

export default function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [last30, setLast30] = useState(true);
  const [showRecurring, setShowRecurring] = useState(false);
  const navigate = useNavigate();
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [detailsOrderId, setDetailsOrderId] = useState(null);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [weekdays, setWeekdays] = useState([]);

const [selectedOrder, setSelectedOrder] = useState(null);
const [frequency, setFrequency] = useState("DAILY");
const [startDate, setStartDate] = useState(
  new Date().toISOString().split("T")[0]
);
const [endDate, setEndDate] = useState("");
const token = localStorage.getItem("token");

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = () => {
    const params = new URLSearchParams({
      search,
      status,
      last30: last30 ? "1" : "0",
    });

    fetch(`${API}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    if (trackingOrderId || detailsOrderId) return;
    fetchOrders();
  }, [search, status, last30, trackingOrderId, detailsOrderId]);

  /* ================= STATUS HELPERS ================= */
 const statusLabel = (s) => {
  if (s === "PACKED") return "PACKED";
  if (s === "OUT_FOR_DELIVERY") return "OUT FOR DELIVERY";
  if (s === "ACCEPTED") return "ACCEPTED";
  if (s === "DELIVERED") return "DELIVERED";
  if (s === "REJECTED") return "REJECTED";
  return "PLACED";
};


const statusClass = (s) => {
  if (s === "DELIVERED") return "success";
  if (s === "PACKED") return "warning";
  if (s === "OUT_FOR_DELIVERY") return "primary";
  if (s === "REJECTED") return "danger";
  return "info";
};
  
  /* ================= CANCEL ORDER ================= */
 const handleCancel = async (orderId) => {
  const confirm = window.confirm(
    "Are you sure you want to cancel this order?"
  );

  if (!confirm) return;

  try {
    const res = await fetch(
      `http://127.0.0.1:5000/api/v1/orders/restaurant/${orderId}/cancel`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Cancel failed");
      return;
    }

    alert("Order cancelled successfully");
    fetchOrders();

  } catch (err) {
    alert("Something went wrong");
  }
};


  /* ================= TRACK SCREEN ================= */
  if (trackingOrderId) {
    return (
      <OrderTrack
        orderId={trackingOrderId}
        onBack={() => setTrackingOrderId(null)}
      />
    );
  }

  if (detailsOrderId) {
    return (
      <OrderDetails
        orderId={detailsOrderId}
        onBack={() => setDetailsOrderId(null)}
        onTrack={(id) => setTrackingOrderId(id)}
      />
    );
  }


const activateRecurring = async () => {
  if (!selectedOrder) return;

  try {
    const res = await fetch(
      "http://127.0.0.1:5000/api/v1/orders/restaurant/recurring/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
       body: JSON.stringify({
          order_id: selectedOrder.order_id,
          frequency,
          start_date: startDate,
          end_date: endDate || null,
          weekdays: frequency === "WEEKLY" ? weekdays : []
        }),

      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Recurring activated 🔥");

    setShowRecurringModal(false);
    setSelectedOrder(null);
    fetchOrders();

  } catch (err) {
    alert("Something went wrong");
  }
};



const handlePauseRecurring = async (orderId) => {
  const confirm = window.confirm(
    "Pause this recurring order?"
  );

  if (!confirm) return;

  try {
    const res = await fetch(
      `http://127.0.0.1:5000/api/v1/orders/restaurant/recurring/pause/${orderId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to pause recurring order");
      return;
    }

    alert("Recurring order paused");

    fetchOrders();

  } catch (err) {
    alert("Something went wrong");
  }
};



  /* ================= ORDER LIST ================= */
  return (
    <div className="dashboard_page">
      {/* HEADER */}
      <div className="page_header">
        <h2>My Orders</h2>
        <p className="page_subtitle">
          View and manage all your restaurant orders
        </p>
      </div>
       
       <div className="filter_right">
            <button
              className={`btn btn-sm ${showRecurring ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setShowRecurring(!showRecurring)}
            >
              {showRecurring ? "Show Normal Orders" : "Show Recurring Orders"}
            </button>

            
          </div>


      {/* FILTER BAR */}
      <div className="card filter_bar">
        <div className="filter_left">
          <input
            type="text"
            className="form-control search_input"
            placeholder="Search Order ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="form-select status_select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PLACED">Placed</option>
            <option value="ACCEPTED">Confirmed</option>
            <option value="PACKED">Out For Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="filter_right">
          <span className="orders_found">
            {orders.length} Orders Found
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="card mt-3">
        <table className="table order_table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Products</th>
              <th>Total</th>
              <th>Status</th>
              <th className="text-end">Daily</th>
             <th className="text-end">Action</th>

            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No orders found
                </td>
              </tr>
            )}

            {orders
              .filter((o) => {
                  if (showRecurring) return o.is_recurring;
                  return true;   // show all when not filtering
                })
              .map((o) => (

              <tr key={o.order_id}>
                <td>{o.order_id}</td>

                <td>
                  {new Date(o.order_date).toLocaleDateString()}
                  <br />
                  <small>
                    {new Date(o.order_date).toLocaleTimeString()}
                  </small>
                </td>

                <td>
                  {o.items?.slice(0, 2).map((item, i) => (
                    <div key={i}>
                      {item.product_name} (x{item.quantity})
                    </div>
                  ))}
                  {o.items?.length > 2 && (
                    <small>+{o.items.length - 2} more</small>
                  )}
                </td>

                <td>QAR {o.total_amount}</td>

                <td>
                  <span className={`status_badge ${statusClass(o.status)}`}>
                    {statusLabel(o.status)}
                  </span>

                  {o.is_recurring && (
                    <span className="badge bg-dark ms-2">
                      Daily
                    </span>
                  )}
                </td>

               <td className="text-end">
                  {o.status === "PLACED" && o.is_recurring !== true && (
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => {
                              console.log("CLICKED MAKE DAILY");
                              setSelectedOrder(o);
                              setShowRecurringModal(true);
                            }}
                          >
                            Make Daily
                          </button>
                        )}

                        {o.is_recurring === true&& (
                              <button
                                className="btn btn-secondary btn-sm me-2"
                                onClick={() => handlePauseRecurring(o.order_id)}
                              >
                                Pause
                              </button>
                            )}
                </td>

                <td className="text-end">
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => setDetailsOrderId(o.order_id)}
                  >
                    View
                  </button>

                  {o.status === "PLACED" && (
                    <>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() =>
                          navigate(
                            `/restaurantdashboard/edit-order/${o.order_id}`
                          )
                        }
                      >
                        Modify
                      </button>
                      
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(o.order_id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showRecurringModal && (
  <div className="modal_overlay">
    <div className="modal_box">

      <h4>Setup Recurring Order</h4>

      <div className="mb-3">
        <label>Frequency</label>
        <select
          className="form-select"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
        </select>
      </div>
        
        {frequency === "WEEKLY" && (
          <div className="mb-3">
            <label>Select Days</label>

            <div className="weekday_grid">
              {["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]
                .map((day) => (
                  <label key={day} className="weekday_option">
                    <input
                      type="checkbox"
                      checked={weekdays.includes(day)}
                      onChange={() => {
                        if (weekdays.includes(day)) {
                          setWeekdays(weekdays.filter(d => d !== day));
                        } else {
                          setWeekdays([...weekdays, day]);
                        }
                      }}
                    />
                    {day.slice(0,3)}
                  </label>
                ))
              }
            </div>
          </div>
        )}

      <div className="mb-3">
        <label>Start Date</label>
        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>End Date (Optional)</label>
        <input
          type="date"
          className="form-control"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

     <div className="preview_box">
        <small>
          {frequency === "DAILY" &&
            `This order will repeat daily starting ${startDate}.`
          }

          {frequency === "WEEKLY" &&
            `This order will repeat on ${weekdays.join(", ")} starting ${startDate}.`
          }
        </small>
      </div>

      <div className="text-end mt-3">
        <button
          className="btn btn-secondary me-2"
          onClick={() => setShowRecurringModal(false)}
        >
          Cancel
        </button>

        <button
          className="btn btn-success"
          onClick={activateRecurring}
        >
          Activate
        </button>
      </div>

    </div>
  </div>
)}

      </div>
    </div>
  );
}