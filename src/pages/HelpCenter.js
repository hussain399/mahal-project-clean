import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HelpCenter = () => {
  return (
    <>
      <Header />

      <section className="mahal-page-section">
        <div className="container">

          {/* TITLE */}
          <div className="text-center mb-5">
            <h1 className="mahal-title">
              Help <span>Center</span>
            </h1>
            <p className="mahal-desc">
              Dedicated support to keep your business running smoothly.
            </p>
          </div>

          {/* SUPPORT CATEGORIES */}
          <div className="row g-4">

            <div className="col-md-6 col-lg-3">
              <div className="mahal-help-card">
                <i className="fas fa-user-cog"></i>
                <h4>Account Setup</h4>
                <p>Registration, verification, and profile management support.</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="mahal-help-card">
                <i className="fas fa-truck"></i>
                <h4>Orders & Delivery</h4>
                <p>Order tracking, delivery status, and issue resolution.</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="mahal-help-card">
                <i className="fas fa-file-invoice-dollar"></i>
                <h4>Payments & Invoices</h4>
                <p>Billing, invoices, and payment-related assistance.</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="mahal-help-card">
                <i className="fas fa-headset"></i>
                <h4>Technical Support</h4>
                <p>Platform issues, bugs, and technical guidance.</p>
              </div>
            </div>

          </div>

          {/* CONTACT SUPPORT */}
          <div className="mahal-support-box mt-5 text-center">
            <h3>Need Direct Assistance?</h3>
            <p>
              Our support team is available to help you.
            </p>

            <div className="support-contacts">
              <p>
                <i className="fas fa-envelope"></i> support@mahal.com
              </p>
              <p>
                <i className="fas fa-phone-alt"></i> +971-XXX-XXXX
              </p>
            </div>

            <a href="/contact" className="mahal-btn-primary mt-3">
              Contact Support
            </a>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
};

export default HelpCenter;
