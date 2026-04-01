// import React from "react";
//           import DashboardCharts from "./DashboardCharts";


// const RestaurantDashboardHome = () => {
//   return (
//     <div className="dashboard_page">

//       {/* HEADER */}
//       <div className="page_header">
//         <h2>Dashboard</h2>
//         <p>Welcome back! Here’s today’s restaurant summary  </p>
//       </div>

//       {/* STATS */}
//       <div className="row mt-4">

//         <div className="col-lg-3 col-md-6">
//           <div className="stat_card">
//             <i className="fas fa-receipt"></i>
//             <div>
//               <h3>42</h3>
//             <p>Today Orders</p> 
//             </div>
            
//           </div>
//         </div>

//         <div className="col-lg-3 col-md-6">
//           <div className="stat_card">
//             <i className="fas fa-rupee-sign"></i>
//             <div>
//               <h3>QAR12,340</h3>
//               <p>Total Revenue</p>  
//             </div>
            
//           </div>
//         </div>

//         <div className="col-lg-3 col-md-6">
//           <div className="stat_card">
//             <i className="fas fa-users"></i>
//             <div> 
//               <h3>128</h3>
//               <p>Total Customers</p>
//             </div>
//           </div>
//         </div>

//         <div className="col-lg-3 col-md-6">
//           <div className="stat_card">
//             <i className="fas fa-star"></i>
//             <div> 
//             <h3>4.5</h3>
//             <p>Avg Rating</p>
//             </div>
//           </div>
//         </div>

//       </div>

//       {/* CHARTS */}
// <DashboardCharts />

//       {/* RECENT ORDERS */}
//       <div className="card mt-4">
//         <div className="card-header">
//           <h5>Recent Orders</h5>
//         </div>

//         <div className="table-responsive">
//           <table className="table table-hover mb-0">
//             <thead>
//               <tr>
//                 <th>Order ID</th>
//                 <th>Customer</th>
//                 <th>Amount</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>#ORD201</td>
//                 <td>Ramesh</td>
//                 <td>QAR540</td>
//                 <td><span className="badge bg-success">Delivered</span></td>
//               </tr>
//               <tr>
//                 <td>#ORD202</td>
//                 <td>Sneha</td>
//                 <td>QAR320</td>
//                 <td><span className="badge bg-warning">Preparing</span></td>
//               </tr>
//               <tr>
//                 <td>#ORD203</td>
//                 <td>Kiran</td>
//                 <td>QAR760</td>
//                 <td><span className="badge bg-danger">Cancelled</span></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* TOP SELLING ITEMS */}
//       <div className="card mt-4">
//         <div className="card-header">
//           <h5>Top Selling Items</h5>
//         </div>

//         <ul className="list-group list-group-flush">
//           <li className="list-group-item d-flex justify-content-between">
//             <span>Chicken Biryani</span>
//             <strong>56 Orders</strong>
//           </li>
//           <li className="list-group-item d-flex justify-content-between">
//             <span>Paneer Butter Masala</span>
//             <strong>42 Orders</strong>
//           </li>
//           <li className="list-group-item d-flex justify-content-between">
//             <span>Fried Rice</span>
//             <strong>38 Orders</strong>
//           </li>
//         </ul>
//       </div>

//     </div>
//   );
// };

// export default RestaurantDashboardHome;








import React, { useEffect, useState } from "react";
import DashboardCharts from "./DashboardCharts";
import { restaurantDashboardTourSteps } from "../../tours/restaurantDashboardTour";
import introJs from "intro.js";
const RestaurantDashboardHome = () => {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem("token");
  const [credit, setCredit] = useState(null);

  /* =========================
     LOAD DASHBOARD DATA
  ========================= */
  useEffect(() => {
    if (!token) return;

    fetch("http://127.0.0.1:5000/api/v1/orders/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard");
        return res.json();
      })
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
      });
      fetch("http://127.0.0.1:5000/api/restaurant/credit-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setCredit(data))
        .catch(() => setCredit(null));
  }, [token]);
useEffect(() => {
  const shouldStartTour =
    localStorage.getItem("startRestaurantDashboardTour") === "true";

  if (!shouldStartTour) return;

  // 🔑 REMOVE IMMEDIATELY (prevents double run)
  localStorage.removeItem("startRestaurantDashboardTour");

  setTimeout(() => {
    const intro = introJs();

    intro.setOptions({
      steps: restaurantDashboardTourSteps,
      showProgress: true,
      showBullets: false,
      nextLabel: "Next →",
      prevLabel: "← Back",
      doneLabel: "Finish",
      overlayOpacity: 0.65,
      disableInteraction: true,
      exitOnOverlayClick: false,
    });

    intro.onbeforechange((targetElement) => {
      const scrollContainer = document.querySelector(".dashboard_page");
      if (scrollContainer && targetElement) {
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const elementTop = targetElement.getBoundingClientRect().top;

        scrollContainer.scrollTo({
          top:
            scrollContainer.scrollTop +
            (elementTop - containerTop) -
            90,
          behavior: "smooth",
        });
      }
    });

    intro.onafterchange(() => {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 120);
    });

    intro.oncomplete(() => {
     localStorage.setItem("tourSeen_restaurant_dashboard", "true");
      localStorage.setItem("startRestaurantToolsTour", "true");

      // 🔥 ADD THIS LINE
      window.dispatchEvent(new Event("restaurantToolsTour"));
    });

    intro.onexit(() => {
      localStorage.setItem("tourSeen_restaurant_dashboard", "true");
      localStorage.setItem("startRestaurantToolsTour", "true");

      // 🔥 ADD THIS LINE
      window.dispatchEvent(new Event("restaurantToolsTour"));
    });

    intro.start();
  }, 700);
}, []);


  return (
    <div className="dashboard_page">

      {/* HEADER */}
      <div className="page_header">
        <h2>Dashboard</h2>
        <p>Welcome back! Here’s today’s restaurant summary</p>
      </div>

      {/* CREDIT SUMMARY */}
      {credit && (
        <div className="row mt-3">

          <div className="col-lg-3 col-md-6">
            <div className="stat_card credit_card">
              <i className="fas fa-wallet"></i>
              <div>
                <h3>QAR {Number(credit.credit_limit || 0).toFixed(2)}</h3>
                <p>Credit Limit</p>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="stat_card credit_card_used">
              <i className="fas fa-chart-line"></i>
              <div>
                <h3>QAR {Number(credit.credit_used || 0).toFixed(2)}</h3>
                <p>Used Credit</p>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="stat_card credit_card_available">
              <i className="fas fa-coins"></i>
              <div>
                <h3>QAR {Number(credit.credit_available || 0).toFixed(2)}</h3>
                <p>Available</p>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="stat_card credit_card_due">
              <i className="fas fa-calendar-alt"></i>
              <div>
                <h3>
                  {credit.next_due_date
                    ? new Date(credit.next_due_date).toLocaleDateString()
                    : "—"}
                </h3>
                <p>Next Due Date</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STATS */}
      <div className="row mt-4" >

        <div className="col-lg-3 col-md-6" >
          <div className="stat_card" id="tour-today-orders">
            <i className="fas fa-receipt"></i>
            <div>
              <h3>{stats?.today_orders ?? 0}</h3>
              <p>Today Orders</p>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6" >
          <div className="stat_card" id="tour-revenue">
            <i className="fas fa-rupee-sign"></i>
            <div>
              <h3>QAR{stats?.revenue ?? 0}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6" >
          <div className="stat_card" id="tour-dashboard-customers">
            <i className="fas fa-users"></i>
            <div>
              <h3>{stats?.customers ?? 0}</h3>
              <p>Total Customers</p>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6" >
          <div className="stat_card" id="tour-rating">
            <i className="fas fa-star"></i>
            <div>
              <h3>4.5</h3>
              <p>Avg Rating</p>
            </div>
          </div>
        </div>

      </div>

      {/* CHARTS */}
      <DashboardCharts salesTourId="tour-sales-chart" ordersTourId="tour-orders-chart" />


      {/* RECENT ORDERS */}
      <div className="card mt-4" >
        <div className="card-header" >
          <h5>Recent Orders</h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover mb-0" id="tour-recent-orders">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {stats?.recent_orders?.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: 20 }}>
                    No recent orders
                  </td>
                </tr>
              )}

              {stats?.recent_orders?.map((o) => (
                <tr key={o.order_id}>
                  <td>{o.order_id}</td>
                  <td>—</td>
                  <td>QAR{o.total_amount}</td>
                  <td>
                    <span
                      className={`badge ${
                        o.status === "DELIVERED"
                          ? "bg-success"
                          : o.status === "CANCELLED"
                          ? "bg-danger"
                          : "bg-warning"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOP SELLING ITEMS (STATIC FOR NOW) */}
      <div className="card mt-4" id="tour-top-selling">
        <div className="card-header">
          <h5>Top Selling Items</h5>
        </div>

        <ul className="list-group list-group-flush">
          <li className="list-group-item d-flex justify-content-between">
            <span>Chicken Biryani</span>
            <strong>56 Orders</strong>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Paneer Butter Masala</span>
            <strong>42 Orders</strong>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Fried Rice</span>
            <strong>38 Orders</strong>
          </li>
        </ul>
      </div>

    </div>
  );
};

export default RestaurantDashboardHome;
