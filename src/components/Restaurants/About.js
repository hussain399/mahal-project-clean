import React from "react";
import aboutImg from "../../images/11.jpg"

const RestaurantAbout = () => {
  return (
    <section className="mahal-about-section">
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT CONTENT */}
           <div className="col-lg-5 mt-4 mt-lg-0">
            <div className="mahal-about-image">
              <img src={aboutImg} alt="Restaurant Procurement" />
            </div>
          </div>

          

          {/* RIGHT IMAGE */}
          <div className="col-lg-7">
            <div className="mahal-about-content">

              <h6 className="mahal-subtitle">FOR RESTAURANTS</h6>

              <h2 className="mahal-title">
                Order Smarter 
                <span> Spend Less.</span>
              </h2>

              <p className="mahal-desc">
                MAHAL helps restaurants simplify procurement by connecting them
                directly with verified suppliers for daily and bulk sourcing.
              </p>

              <p className="mahal-text">
  MAHAL works with a wide network of suppliers — from local farms to large-scale
  distributors — ensuring restaurants always get quality ingredients, fair
  pricing, and reliable long-term sourcing through a single trusted platform.
</p>


              <div className="mahal-highlights">
                <div>✔ Direct access to verified suppliers</div>
                <div>✔ Transparent & competitive pricing</div>
                <div>✔ Daily & bulk ordering in one place</div>
                <div>✔ Track orders & manage deliveries</div>
              </div>

              {/* BUTTONS */}
              <div className="mahal-btn-group mt-4">
                <a href="/RestaurantLogIn" className="mahal-btn-primary">
                  Go to Restaurant Portal
                </a>

                <a
                  href="/Registration"
                  className="  mahal-btn-secondary"
                >
                  View Ongoing Deals
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
