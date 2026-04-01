import React from "react";

const Documentation = () => {
  return (
    <div className="help_page">
      {/* HEADER */}
      <div className="help_header">
        <h2>
            Dashboard Documentation
        </h2>
        <p>
          Everything you need to manage your business like a modern
          e-commerce platform.
        </p>
      </div>

      {/* GRID */}
      <div className="help_grid">

        {/* PROFILE SETUP */}
        <div className="help_card">
          <h4><i className="fas fa-user-cog"></i> Profile Setup</h4>
          <ul>
            <li>Basic information (name, email, contact)</li>
            <li>Supplier / Restaurant details</li>
            <li>Address & location</li>
            <li>Bank & payment details</li>
            <li>Required document uploads</li>
          </ul>
        </div>

        {/* DASHBOARD OVERVIEW */}
        <div className="help_card">
          <h4><i className="fas fa-chart-line"></i> Dashboard Overview</h4>
          <ul>
            <li>Revenue – Monthly earnings</li>
            <li>Pending Orders – Orders waiting for action</li>
            <li>Low Stock – Products to restock</li>
            <li>Fulfillment Rate – Order success rate</li>
            <li>Sales Trends – Graphical insights</li>
            <li>Inventory Health</li>
          </ul>
        </div>

        {/* PRODUCTS */}
        <div className="help_card">
          <h4><i className="fas fa-box-open"></i> Products Management</h4>
          <ul>
            <li>Add products with images & pricing</li>
            <li>Edit or disable products anytime</li>
            <li>Control stock availability</li>
            <li>Assign categories for visibility</li>
          </ul>
        </div>

        {/* ORDERS */}
        <div className="help_card">
          <h4><i className="fas fa-truck"></i> Orders & Delivery</h4>
          <ul>
            <li>Accept or reject incoming orders</li>
            <li>View complete order details</li>
            <li>Track delivery progress</li>
            <li>Update order status</li>
          </ul>
        </div>

        {/* OFFERS */}
        <div className="help_card">
          <h4><i className="fas fa-tags"></i> Offers & Promotions</h4>
          <ul>
            <li>Create discounts to attract customers</li>
            <li>Use promo codes for campaigns</li>
            <li>Run combo offers to increase order value</li>
          </ul>
        </div>

        {/* INVENTORY */}
        <div className="help_card">
          <h4><i className="fas fa-warehouse"></i> Inventory</h4>
          <ul>
            <li>Monitor stock in real time</li>
            <li>Avoid out-of-stock situations</li>
            <li>Improve fulfillment rate</li>
          </ul>
        </div>

        {/* GUIDED TOUR */}
        <div className="help_card">
          <h4><i className="fas fa-route"></i> Guided Tours</h4>
          <ul>
            <li>Visual walkthroughs for beginners</li>
            <li>Highlights important actions</li>
            <li>Step-by-step usage help</li>
          </ul>
        </div>

      </div>

      {/* FOOTER */}
      <div className="help_footer">
        <i className="fas fa-heart"></i> Designed to help you grow faster and sell smarter
      </div>
    </div>
  );
};

export default Documentation;
