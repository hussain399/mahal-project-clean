import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HowItWorks = () => {
  return (
    <>
      <Header />

      (
    <section className="mahal-how-section">
      <div className="container">

        {/* HEADER */}
        <div className="row mb-5">
          <div className="col-lg-8 m-auto text-center">
            <h2 className="mahal-title">
              How <span>MAHAL</span> Works
            </h2>
            <p className="mahal-desc">
              A modern B2B food marketplace built for speed, transparency,
              and long-term partnerships.
            </p>
          </div>
        </div>

        <div className="row">

          {/* FOR RESTAURANTS */}
          <div className="col-lg-6 mb-4">
            <div className="mahal-how-card">
              <h3 className="mb-4">For Restaurants</h3>

              <ul className="mahal-steps">
                <li>
                  <span>01</span>
                  Register & verify your restaurant
                </li>
                <li>
                  <span>02</span>
                  Browse verified suppliers
                </li>
                <li>
                  <span>03</span>
                  Compare prices & availability
                </li>
                <li>
                  <span>04</span>
                  Place daily or bulk orders
                </li>
                <li>
                  <span>05</span>
                  Track deliveries & invoices
                </li>
              </ul>

              <a href="/restaurant" className="mahal-btn-primary mt-3">
                Start Ordering
              </a>
            </div>
          </div>

          {/* FOR SUPPLIERS */}
          <div className="col-lg-6 mb-4">
            <div className="mahal-how-card dark">
              <h3 className="mb-4">For Suppliers</h3>

              <ul className="mahal-steps">
                <li>
                  <span>01</span>
                  Register & list your products
                </li>
                <li>
                  <span>02</span>
                  Connect with verified restaurants
                </li>
                <li>
                  <span>03</span>
                  Receive & manage orders
                </li>
                <li>
                  <span>04</span>
                  Transparent pricing & payments
                </li>
                <li>
                  <span>05</span>
                  Build long-term B2B partnerships
                </li>
              </ul>

              <a href="/supplier" className="mahal-btn-secondary mt-3">
                Become a Supplier
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>

      <Footer />
    </>
  );
};

export default HowItWorks;
