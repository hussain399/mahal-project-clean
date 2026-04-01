import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../images/Logo.png";
import introJs from "intro.js";
import { restaurantToolsTourSteps } from "../../tours/restaurantToolsTour";

const RestaurantSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [startToolsTour, setStartToolsTour] = useState(
    localStorage.getItem("startRestaurantToolsTour")
  );
  const tourStartedRef = useRef(false);

useEffect(() => {
  const startTourIfNeeded = () => {
  if (tourStartedRef.current) return; // 🔒 STRICT MODE GUARD

  const shouldStart =
    localStorage.getItem("startRestaurantToolsTour") === "true";
  const hasSeen =
    localStorage.getItem("restaurantToolsTourSeen") === "true";

  if (!shouldStart || hasSeen) return;

  tourStartedRef.current = true; // 🔒 lock immediately

  localStorage.removeItem("startRestaurantToolsTour");

  setTimeout(() => {
    introJs()
      .setOptions({
        steps: restaurantToolsTourSteps,
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        nextLabel: "Next →",
        prevLabel: "← Back",
        doneLabel: "Finish",
        overlayOpacity: 0.65,
      })
      .oncomplete(() => {
        localStorage.setItem("tourSeen_restaurant_tools", "true");


      })
      .onexit(() => {
        localStorage.setItem("tourSeen_restaurant_tools", "true");

      })
      .start();
  }, 500);
};


  // run once on mount (refresh case)
  startTourIfNeeded();

  // 🔥 listen for dashboard completion
  window.addEventListener("restaurantToolsTour", startTourIfNeeded);

  return () => {
    window.removeEventListener("restaurantToolsTour", startTourIfNeeded);
  };
}, []);



  return (
    <aside className={`dashboard_sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* LOGO */}
      <div className="sidebar_logo">
        <Link to="/restaurantdashboard">
          <img
            src={logo}
            alt="Mahal"
            style={{ cursor: "pointer" }}
          />
        </Link>

        <button
          className="collapse_btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* MENU */}
      <ul className="sidebar_menu">

        {/* Dashboard */}
        <NavLink to="/restaurantdashboard" end className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""} id="tour-dashboard">
              <i className="fas fa-home"></i>
              {!collapsed && <span>Dashboard</span>}
            </li>
          )}
        </NavLink>


        {/* Orders */}
        <NavLink to="/restaurantdashboard/orders" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""}id="tour-orders">
              <i className="fas fa-receipt"></i>
              {!collapsed && <span>Orders</span>}
            </li>
          )}
        </NavLink>

         <NavLink to="/restaurantdashboard/RestaurantModificationRequests" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""} id="tour-modified-orders">
              <i className="fas fa-boxes"></i>
              {!collapsed && <span>Modified Orders</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/restaurantdashboard/issues" className="menu_link">
  {({ isActive }) => (
    <li className={isActive ? "active" : ""}id="tour-issues">
      <i className="fas fa-exclamation-triangle"></i>
      {!collapsed && <span>Order Issues</span>}
    </li>
  )}
</NavLink>

           {/* GRN */}
        <NavLink to="/restaurantdashboard/grn" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""} id="tour-grn">
              <i className="fas fa-truck-loading"></i>
              {!collapsed && <span>GRN</span>}
            </li>
          )}
        </NavLink>

        {/* Invoices */}
        <NavLink to="/restaurantdashboard/invoices" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""} id="tour-invoices">
              <i className="fas fa-file-invoice"></i>
              {!collapsed && <span>Invoices</span>}
            </li>
          )}
        </NavLink>

        {/* Reviews & Ratings */}
        <NavLink to="/restaurantdashboard/reviews" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""} id="tour-reviews">
              <i className="fas fa-star"></i>
              {!collapsed && <span>Reviews & Ratings</span>}
            </li>
          )}
        </NavLink>

        {/* Inventory */}
        <NavLink to="/restaurantdashboard/inventory" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""} id="tour-inventory">
              <i className="fas fa-boxes"></i>
              {!collapsed && <span>Inventory</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/restaurantdashboard/issue-to-kitchen" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""} id="tour-payments">
              <i className="fas fa-credit-card"></i>
              {!collapsed && <span>Issue To Kitchen</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/restaurantdashboard/credit-wallet" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""}>
              <i className="fas fa-wallet"></i>
              {!collapsed && <span>Credit Wallet</span>}
            </li>
          )}
        </NavLink>

        {/* Menu Items */}
        <NavLink to="/restaurantdashboard/menu-items" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""}id="tour-menu">
              <i className="fas fa-utensils"></i>
              {!collapsed && <span>Menu Items</span>}
            </li>
          )}
        </NavLink>

        <NavLink to="/restaurantdashboard/receipe-master" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""} id="tour-recipe">
              <i className="fas fa-clipboard-list"></i>
              {!collapsed && <span>Recipe Master</span>}
            </li>
          )}
        </NavLink>


        
                <NavLink to="/restaurantdashboard/support" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""}>
              <i className="fas fa-headset"></i>
              {!collapsed && <span>Support</span>}
            </li>
          )}
        </NavLink>


        {/* Categories */}
    

        {/* Offers & Coupons
        <NavLink to="/restaurantdashboard/offers" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""}>
              <i className="fas fa-tags"></i>
              {!collapsed && <span>Offers & Coupons</span>}
            </li>
          )}
        </NavLink> */}

        {/* Payments */}
        

        

        {/* Customers */}
        {/* <NavLink to="/restaurantdashboard/customers" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""} id="tour-customers">
              <i className="fas fa-users"></i>
              {!collapsed && <span>Customers</span>}
            </li>
          )}
        </NavLink> */}

            {/* Reports */}
        <NavLink to="/restaurantdashboard/reports" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""}id="tour-reports">
              <i className="fas fa-chart-line"></i>
              {!collapsed && <span>Reports</span>}
            </li>
          )}
        </NavLink>
        
        <NavLink to="/restaurantdashboard/help" className="menu_link">
                  {({ isActive }) => (
                    <li id="tour-help" className={isActive ? "active" : ""}>
                      <i className="fas fa-question-circle"></i>
                      {!collapsed && <span>Help</span>}
                    </li>
                  )}
          </NavLink>
        
         <NavLink to="/restaurantdashboard/documentation" className="menu_link">
          {({ isActive }) => (
            <li id="tour-docs" className={isActive ? "active" : ""}>
              <i className="fas fa-book"></i>
              {!collapsed && <span>Documentation</span>}
            </li>
          )}
        </NavLink>

        {/* Settings
        <NavLink to="/restaurantdashboard/settings" className="menu_link">
          {({ isActive }) => (
            <li className={isActive ? "active" : ""}>
              <i className="fas fa-cog"></i>
              {!collapsed && <span>Settings</span>}
            </li>
          )}
        </NavLink> */}

      </ul>
    </aside>
  );
};

export default RestaurantSidebar;
