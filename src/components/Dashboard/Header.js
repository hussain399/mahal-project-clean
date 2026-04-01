// // import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import React, { useState, useEffect } from "react";


// const Header = () => {
//   const navigate = useNavigate();
  
//   const handleLogout = () => {
//     // auth data clear (if any)
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     // redirect to index / home
//     navigate("/");
//   };
// const [userName, setUserName] = useState("User");

// useEffect(() => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   if (user?.name) {
//     setUserName(user.name);
//   }
// }, []);
//   return (
//     <div className="dashboard_header">

//       {/* ROW 1 – SEARCH + USER */}
//       <div className="header_top">

//         {/* LEFT */}
//         <div className="header_left">
//           <h4 className="welcome_text">
//             Welcome, <span>{userName}</span>!
//           </h4>

//           <div className="search_wrapper">
//             <input
//               className="search_bar"
//               placeholder="Search for ingredients or products..."
//             />
//             <button className="search_btn">
//               <i className="fas fa-search"></i>
//             </button>
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div className="header_right">

//           {/* NOTIFICATION */}
//           <Link to="/notifications" className="icon_box">
//             <i className="fas fa-bell"></i>
//             <span className="badge">3</span>
//           </Link>

//           {/* CART */}
//           <Link to="/cart" className="icon_box">
//             <i className="fas fa-shopping-cart"></i>
//             <span className="badge">5</span>
//           </Link>

//           {/* LOGOUT */}
//           <div
//             className="icon_box logout_icon"
//             title="Logout"
//             onClick={handleLogout}
//             style={{ cursor: "pointer" }}
//           >
//             <i className="fas fa-sign-out-alt"></i>
//           </div>

//         </div>
//       </div>

//     </div>
//   );
// };

// export default Header;



import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dashboardSearchMap } from "../../utils/dashboardSearchMap";
import { resolveIdentity } from "../../utils/identity"; // adjust path
import "../../pages/css/status.css";
import "../../pages/css/halfscreen.css";

const API = "http://127.0.0.1:5000/api/v1/orders";

const Header = ({ onProfileClick }) => {

  const navigate = useNavigate();
  const identity = resolveIdentity();

  const role = identity?.role;
  const linkedId = identity?.linkedId;
  const [userName, setUserName] = useState("User");
 
  const [query, setQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  
  const totalNotifications = notificationCount;


const fetchCount = async () => {
  const token = localStorage.getItem("token");
  const identity = resolveIdentity();

  if (!token || identity?.role?.toUpperCase() !== "SUPPLIER") return;


  try {
    const res = await fetch(
      "http://127.0.0.1:5000/api/v1/orders/supplier/notifications/count",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    console.log("🔔 COUNT API:", data);
    setNotificationCount(Number(data.count) || 0);
  } catch (e) {
    console.error("Count fetch failed", e);
    setNotificationCount(0);
  }
};


useEffect(() => {
  const handler = () => fetchCount();
  window.addEventListener("refreshNotifications", handler);
  return () =>
    window.removeEventListener("refreshNotifications", handler);
}, []);
useEffect(() => {
  if (!identity || !role) return;

  fetchCount();
  const interval = setInterval(fetchCount, 20000);
  return () => clearInterval(interval);
}, [identity, role]);


  const decrementNotificationCount = () => {
    setNotificationCount((c) => Math.max(0, c - 1));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.username) {
          setUserName(decoded.username.split("@")[0]);
        }
      } catch {
        console.error("Invalid token");
      }
    }
  }, []);
useEffect(() => {
  const handleOpenProfile = () => {
    if (onProfileClick) {
      onProfileClick();
    }
  };

  window.addEventListener("openProfile", handleOpenProfile);

  return () => {
    window.removeEventListener("openProfile", handleOpenProfile);
  };
}, [onProfileClick]);

  // const handleLogout = () => {
  //   localStorage.clear();
  //   navigate("/");
  // };
 const handleLogout = () => {
  // 🔐 auth/session only
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("linked_id");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");

    // ❌ DO NOT remove tour flags
    navigate("/");
  };

  const goToProfile = () => {
    if (!role) return;

    // admin → no linkedId
    if (role === "admin") {
      navigate(`/admin/profile/admin/0`);
    } else {
      navigate(`/admin/profile/${role}/${linkedId}`);
    }
  };

  const handleSearch = () => {
    const text = query.toLowerCase().trim();
    if (!text) return;

    const match = dashboardSearchMap.find((item) =>
      item.keywords.some((k) => text.includes(k))
    );

    if (match) {
      navigate(match.route);
      setQuery("");
    } else {
      alert("No matching section found");
    }
  };


  return (
    <div className="dashboard_header">
      <div className="header_top">
        <div className="header_left">
          <h4 className="welcome_text">
            Welcome, <span>{userName}</span>!
          </h4>

          <div className="search_wrapper">
            <input
              className="search_bar"
              placeholder="Search products, orders, invoices..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search_btn" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        <div className="header_right">
          <div
            className="icon_box logout_icon"
            style={{ cursor: "pointer" }}
            // onClick={goToProfile}
            onClick={onProfileClick}
            title="My Profile"
          >
            <i className="fas fa-user-circle"></i>
          </div>

          <Link
            to="/dashboard/notifications"
            className="icon_box notification_icon"
          >
            <i className="fas fa-bell"></i>

             {totalNotifications > 0 && (
                <span className="notification_badge">
                  {totalNotifications > 9 ? "9+" : totalNotifications}
                </span>
              )}
          </Link>



          
          <div
            className="icon_box logout_icon"
            onClick={handleLogout}
            style={{ cursor: "pointer" }}
          >
            <i className="fas fa-sign-out-alt"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
