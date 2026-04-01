// import React from "react";

// const Help = () => {
//   return (
//     <div className="help_page_pro">

//       {/* HEADER */}
//       <div className="help_header">
//         <h2>Help & Support</h2>
//         <p>
//           Manage your business smoothly with guided help and documentation.
//         </p>
//       </div>

//       {/* HELP CARDS */}
//       <div className="help_grid">

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-user-check"></i>
//           </div>
//           <h4>Complete Profile</h4>
//           <p>
//             Complete your business and store profile to unlock all features.
//           </p>
//           <button className="help_btn">Go to Profile</button>
//         </div>

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-route"></i>
//           </div>
//           <h4>Guided Dashboard Tour</h4>
//           <p>
//             Step-by-step walkthrough to understand orders, invoices and tools.
//           </p>
//           <button className="help_btn">Start Tour</button>
//         </div>

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-tools"></i>
//           </div>
//           <h4>Tools & Features</h4>
//           <p>
//             Learn how to use inventory, offers, invoices and reports efficiently.
//           </p>
//           <button className="help_btn">Explore Tools</button>
//         </div>

//         <div className="help_card_pro">
//           <div className="help_icon">
//             <i className="fas fa-book-open"></i>
//           </div>
//           <h4>Documentation</h4>
//           <p>
//             Access detailed documentation with examples and best practices.
//           </p>
//           <button className="help_btn">View Docs</button>
//         </div>

//       </div>

//       {/* SUPPORT BOX */}
//       <div className="help_support">
//         <div className="support_icon">
//           <i className="fas fa-headset"></i>
//         </div>
//         <h3>Still Need Help?</h3>
//         <p>
//           Reach out to our support team for quick assistance.
//         </p>
//         <button className="support_btn">Contact Support</button>
//       </div>

//     </div>
//   );
// };

// export default Help;



import React from "react";
import { useNavigate } from "react-router-dom";
import introJs from "intro.js";
import { toolsTourSteps } from "../../tours/toolsTour";

const Help = () => {
  const navigate = useNavigate();

  /* =========================
     ACTION HANDLERS
  ========================= */

  const goToProfile = () => {
  window.dispatchEvent(new Event("openProfile"));
};


 const startDashboardTour = () => {
    localStorage.setItem("startDashboardTour", "true");
    navigate("/dashboard");
  };

  const startToolsTour = () => {
    introJs()
      .setOptions({
        steps: toolsTourSteps,
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
    navigate("/dashboard/documentation");
  };

  const contactSupport = () => {
    navigate("/dashboard/support");
  };

  return (
    <div className="help_page_pro">

      {/* HEADER */}
      <div className="help_header">
        <h2>Help & Support</h2>
        <p>
          Manage your business smoothly with guided help and documentation.
        </p>
      </div>

      {/* HELP CARDS */}
      <div className="help_grid">

        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-user-check"></i>
          </div>
          <h4>Complete Profile</h4>
          <p>
            Complete your business and store profile to unlock all features.
          </p>
          <button className="help_btn" onClick={goToProfile}>
            Go to Profile
          </button>
        </div>

        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-route"></i>
          </div>
          <h4>Guided Dashboard Tour</h4>
          <p>
            Step-by-step walkthrough to understand orders, invoices and tools.
          </p>
          <button className="help_btn" onClick={startDashboardTour}>
            Start Tour
          </button>
        </div>

        <div className="help_card_pro">
          <div className="help_icon">
            <i className="fas fa-tools"></i>
          </div>
          <h4>Tools & Features</h4>
          <p>
            Learn how to use inventory, offers, invoices and reports efficiently.
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
            Access detailed documentation with examples and best practices.
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
        <h3>Still Need Help?</h3>
        <p>
          Reach out to our support team for quick assistance.
        </p>
        <button className="support_btn" onClick={contactSupport}>
          Contact Support
        </button>
      </div>

    </div>
  );
};

export default Help;
