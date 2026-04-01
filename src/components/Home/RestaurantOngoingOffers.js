import React from "react";

const RestaurantOffers = () => {
  return (
    <section className="mahal-restaurant-offers">
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-6 m-auto text-center">
            <h6 className="mahal-subtitle">RESTAURANT OFFERS</h6>
            <h2 className="mahal-title">
              Ongoing <span>Restaurant Deals</span>
            </h2>
            <p className="mahal-desc">
              Take advantage of exclusive supplier offers and special pricing
              available for restaurants on MAHAL.
            </p>
          </div>
        </div>

        {/* OFFERS */}
        <div className="row">

          {/* OFFER 1 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-offer-card">
              <span className="offer-badge">Limited Time</span>
              <h4>Fresh Vegetables Combo</h4>
              <p>
                Get special pricing on daily fresh vegetables from verified
                local suppliers.
              </p>
              <ul>
                <li>✔ Bulk order discounts</li>
                <li>✔ Same-day delivery</li>
                <li>✔ Transparent pricing</li>
              </ul>
              <a href="/restaurantoffers" className="mahal-btn-secondary">
                View Offer
              </a>
            </div>
          </div>

          {/* OFFER 2 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-offer-card featured">
              <span className="offer-badge">Popular</span>
              <h4>Monthly Essentials Deal</h4>
              <p>
                Save more with bulk monthly orders on rice, oil, and kitchen
                essentials.
              </p>
              <ul>
                <li>✔ Better bulk rates</li>
                <li>✔ Scheduled delivery</li>
                <li>✔ Priority support</li>
              </ul>
              <a href="/Registration" className="mahal-btn-primary">
                Grab This Deal
              </a>
            </div>
          </div>

          {/* OFFER 3 */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mahal-offer-card">
              <span className="offer-badge">New</span>
              <h4>New Restaurant Offer</h4>
              <p>
                Newly onboarded restaurants get exclusive introductory pricing
                on first orders.
              </p>
              <ul>
                <li>✔ Special onboarding price</li>
                <li>✔ Verified suppliers</li>
                <li>✔ Easy ordering</li>
              </ul>
              <a href="/RestaurantLogIn" className="mahal-btn-secondary">
                Get Started
              </a>
            </div>
          </div>

        </div>

        
<br></br>
        <hr></hr>

      </div>
    </section>
  );
};

export default RestaurantOffers;
