import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Pricing = () => {
  return (
    <>
      <Header />

      <section className="mahal-page-section">
        <div className="container">

          {/* TITLE */}
          <div className="text-center mb-5">
            <h1 className="mahal-title">
              Simple & <span>Transparent Pricing</span>
            </h1>
            <p className="mahal-desc">
              No hidden charges. Pay only for what you use.
            </p>
          </div>

          {/* PRICING CARDS */}
          <div className="row justify-content-center g-4">

            {/* RESTAURANTS */}
            <div className="col-md-6 col-lg-5">
              <div className="mahal-pricing-card">
                <div className="pricing-icon">
                  <i className="fas fa-utensils"></i>
                </div>

                <h3>For Restaurants</h3>
                <p className="pricing-sub">
                  Start sourcing with zero upfront cost
                </p>

                <ul className="pricing-list">
                  <li>
                    <i className="fas fa-check-circle"></i>
                    Free registration
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    No monthly or yearly subscription
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    Pay only for what you order
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    Access verified suppliers
                  </li>
                </ul>

                <a href="/Registration" className="mahal-btn-primary w-100">
                  Get Started
                </a>
              </div>
            </div>

            {/* SUPPLIERS */}
            <div className="col-md-6 col-lg-5">
              <div className="mahal-pricing-card highlighted">
                <div className="pricing-icon">
                  <i className="fas fa-truck-loading"></i>
                </div>

                <h3>For Suppliers</h3>
                <p className="pricing-sub">
                  Grow your business with MAHAL
                </p>

                <ul className="pricing-list">
                  <li>
                    <i className="fas fa-check-circle"></i>
                    Free onboarding
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    Small service fee per transaction
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    No long-term contracts
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    Direct access to restaurants
                  </li>
                </ul>

                <a href="/Registration" className="mahal-btn-secondary w-100">
                  Become a Supplier
                </a>
              </div>
            </div>

          </div>

          {/* FOOT NOTE */}
          <div className="text-center mt-5">
            <p>
              Need custom pricing or enterprise support?
            </p>
            <a href="/contact" className="mahal-link">
              Contact our team →
            </a>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
};

export default Pricing;
