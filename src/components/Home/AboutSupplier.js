import React from "react";
import aboutImg from "../../images/supplier_about.png";

const AboutSupplier = () => {
  return (
    <section className="mahal-about-section orange-bg">
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT IMAGE */}
          <div className="col-lg-5 mb-4 mb-lg-0">
            <div className="mahal-about-image">
              <img src={aboutImg} alt="MAHAL Suppliers" />
            </div>
          </div>

          {/* RIGHT CONTENT – SUPPLIER FOCUSED */}
          <div className="col-lg-7">
            <div className="mahal-about-content">

              <h6 className="mahal-subtitle"><span> FOR </span> SUPPLIERS</h6>

              <h2 className="mahal-title">
                Grow Your Supply Business <br />
                with <span>MAHAL</span>
              </h2>

              <p className="mahal-desc">
                MAHAL is a B2B marketplace built to help suppliers connect
                directly with restaurants, receive consistent orders, and
                scale their business with confidence.
              </p>

              <p className="mahal-text">
                From local producers to large distributors, MAHAL empowers
                suppliers with access to verified restaurants, transparent
                pricing, and long-term business partnerships — all in one
                platform.
              </p>

              <div className="mahal-highlights">
                <div>✔ Direct Access to Restaurants</div>
                <div>✔ Bulk & Recurring Orders</div>
                <div>✔ Timely & Secure Payments</div>
                <div>✔ Business Growth Support</div>
              </div>

            </div>

            {/* SUPPLIER CTA */}
            <div className="mahal-btn-group mt-4">
              <a href="/Registration" className="mahal-btn-primary">
                Become a Supplier
              </a>
              <a href="/contact" className="mahal-btn-secondary  mahal-btn-secondary ">
                Talk to Our Team
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSupplier;
