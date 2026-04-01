import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Marketplace = () => {
  return (
    <>
      <Header />

      <section className="mahal-page-section">
        <div className="container">

          {/* TITLE */}
          <div className="text-center mb-5">
            <h1 className="mahal-title">
              MAHAL <span>Marketplace</span>
            </h1>
            <p className="mahal-desc">
              Everything your kitchen needs — sourced from verified suppliers.
            </p>
          </div>

          {/* CATEGORIES */}
          <div className="row g-4">

            <div className="col-md-6 col-lg-4">
              <div className="mahal-market-card">
                <i className="fas fa-apple-alt"></i>
                <h4>Fruits & Vegetables</h4>
                <p>Fresh, seasonal produce sourced directly from trusted farms.</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="mahal-market-card">
                <i className="fas fa-drumstick-bite"></i>
                <h4>Meat & Poultry</h4>
                <p>Quality-controlled meat supplies for daily and bulk needs.</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="mahal-market-card">
                <i className="fas fa-fish"></i>
                <h4>Seafood</h4>
                <p>Fresh and frozen seafood with consistent quality standards.</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="mahal-market-card">
                <i className="fas fa-seedling"></i>
                <h4>Rice, Pulses & Grains</h4>
                <p>Staple ingredients from verified mills and distributors.</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="mahal-market-card">
                <i className="fas fa-oil-can"></i>
                <h4>Cooking Oils</h4>
                <p>Multiple brands and bulk packaging at transparent prices.</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="mahal-market-card">
                <i className="fas fa-pepper-hot"></i>
                <h4>Spices & Condiments</h4>
                <p>Authentic spices and seasonings for every cuisine.</p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="mahal-market-card">
                <i className="fas fa-snowflake"></i>
                <h4>Frozen & Packaged Foods</h4>
                <p>Reliable frozen and ready-to-use food products.</p>
              </div>
            </div>

          </div>

          {/* CTA */}
          <div className="text-center mt-5">
            <p className="mb-3">
              All products are sourced from verified suppliers with transparent pricing
              and reliable delivery.
            </p>

            <a href="/Registration" className="mahal-btn-primary">
              Explore Marketplace
            </a>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
};

export default Marketplace;
