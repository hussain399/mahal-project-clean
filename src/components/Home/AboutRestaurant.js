import React from "react";
import aboutImg from "../../images/about.png";

const RestaurantAbout = () => {
  return (
    <section className="mahal-about-section">
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT CONTENT */}
          <div className="col-lg-5 mt-4 mt-lg-0">
            <div className="mahal-about-image">
              <img src={aboutImg } alt="Restaurants" />
            </div>
          </div>
          

          {/* RIGHT IMAGE */}
            <div className="col-lg-7">
            <div className="mahal-about-content">

              <h6 className="mahal-subtitle"> <span> FOR </span> RESTAURANTS</h6>

              <h2 className="mahal-title">
                Source Fresh Ingredients <br />
                from <span>Trusted Suppliers</span>
              </h2>

              <p className="mahal-desc">
                MAHAL helps restaurants simplify food procurement by connecting
                them with verified suppliers for daily and bulk sourcing.
              </p>

              <p class="mahal-text">From independent kitchens to multi-branch restaurant chains, MAHAL empowers restaurants with verified suppliers, transparent pricing, and streamlined bulk ordering — all in one unified platform.</p>

              <div className="mahal-highlights">
                <div>✔ Verified & Reliable Suppliers</div>
                <div>✔ Transparent Pricing</div>
                <div>✔ Daily & Bulk Ordering</div>
                <div>✔ On-Time Delivery</div>
              </div>

              <div className="mahal-btn-group mt-4">
                <a href="/Registration" className="mahal-btn-primary">
                  Order for Your Restaurant
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default RestaurantAbout;
