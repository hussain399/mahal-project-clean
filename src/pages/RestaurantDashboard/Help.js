
import React from "react";
import { useNavigate } from "react-router-dom";
import introJs from "intro.js";

/* 👉 restaurant-specific tour */
import { restaurantDashboardTourSteps } from "../../tours/restaurantDashboardTour";
import { restaurantToolsTourSteps } from "../../tours/restaurantToolsTour";
const RestaurantHelp = () => {
  const navigate = useNavigate();

  /* =========================
     ACTION HANDLERS
  ========================= */

   const goToProfile = () => {
    window.dispatchEvent(new Event("openProfile"));
    };

  const startDashboardTour = () => {
    localStorage.setItem("startRestaurantDashboardTour", "true");
    navigate("/restaurantdashboard");
  };

  const startToolsTour = () => {
    introJs()
      .setOptions({
        steps: restaurantToolsTourSteps,
        showProgress: true,
        showBullets: false,
        nextLabel: "Next →",
        prevLabel: "← Back",
        doneLabel: "Finish",
        overlayOpacity: 0.6,
      })
      .start();
  };

  const openDocumentation = () => {
    navigate("/restaurantdashboard/documentation");
  };

  const contactSupport = () => {
    navigate("/restaurant/dashboard/support");
  };

  return (
    <div className="help_page_pro">

      {/* HEADER */}
      <div className="help_header">
        <h2>Restaurant Help & Support</h2>
        <p>
          Manage your restaurant operations smoothly with guided help.
        </p>
      </div>

      {/* HELP CARDS */}
      <div className="help_grid">

        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-store"></i>
          </div>
          <h4>Complete Restaurant Profile</h4>
          <p>
            Update your restaurant details to receive and manage orders.
          </p>
          <button className="help_btn" onClick={goToProfile}>
            Go to Profile
          </button>
        </div>

        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-route"></i>
          </div>
          <h4>Restaurant Dashboard Tour</h4>
          <p>
            Learn how to manage orders, invoices, and payouts.
          </p>
          <button className="help_btn" onClick={startDashboardTour}>
            Start Tour
          </button>
        </div>

        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-utensils"></i>
          </div>
          <h4>Restaurant Tools</h4>
          <p>
            Understand menu, offers, reports, and order tools.
          </p>
          <button className="help_btn" onClick={startToolsTour}>
            Explore Tools
          </button>
        </div>

        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-book-open"></i>
          </div>
          <h4>Documentation</h4>
          <p>
            Step-by-step restaurant documentation and best practices.
          </p>
          <button className="help_btn" onClick={openDocumentation}>
            View Docs
          </button>
        </div>

      </div>

      {/* SUPPORT BOX */}
      <div className="help_support">
        <div className="support_icon">
          <i className="fas fa-headset"></i>
        </div>
        <h3>Need Restaurant Support?</h3>
        <p>
          Our team is ready to help you with restaurant operations.
        </p>
        <button className="support_btn" onClick={contactSupport}>
          Contact Support
        </button>
      </div>

    </div>
  );
};

export default RestaurantHelp;
