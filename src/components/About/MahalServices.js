import React from "react";
import serviceImg from "../../images/11.jpg";

const AboutService = () => {
  return ( 
    <section className="mahal-service-section mb-5 pb-80">
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT IMAGE */}
          <div className="col-lg-5 mb-4 mb-lg-0">
            <div className="mahal-service-image">
              <img src={serviceImg} alt="MAHAL Services" />
              
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-lg-7">
            <div className="mahal-service-content">

              <h6 className="mahal-subtitle">OUR SERVICES</h6>

              <h2 className="mahal-title">
                Qualified &amp; Professional <br />
                <span>B2B Food Services</span>
              </h2>

              <p className="mahal-desc">
                MAHAL delivers reliable, scalable, and transparent food
                procurement services tailored for restaurants and businesses.
              </p>

              <p className="mahal-text">
                We work closely with verified suppliers and logistics partners
                to ensure consistent quality, timely delivery, and operational
                efficiency for every order.
              </p>

<div className="mahal-highlights">
                <div>✔ 24/7 Scheduled Delivery</div>
                <div>✔ Expert Supplier Network</div>
                <div>✔ Quality Assured Products</div>
                <div>✔ Wide Product Availability</div>
              </div>

              <div className="mahal-btn-group mt-5  ">
  <a href="/Registration" className="mahal-btn-primary">
    View Services
  </a>
  <a href="/contact" className="mahal-btn-secondary">
    Contact Us
  </a>
</div>

               

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutService;
