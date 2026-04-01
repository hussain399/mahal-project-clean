import React from "react";
import aboutImg from "../../images/about1.png";

const About = () => {
  return (
    <section className="mahal-about-main">
      <div className="container">
        <div className="row align-items-center justify-content-between">

         {/* LEFT IMAGE */}
          <div className="col-xl-5 col-lg-5 mb-4 mb-lg-0">
            <div className="mahal-about-image">
              <img src={aboutImg} alt="About MAHAL" />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-xl-7 col-lg-7">
            <div className="mahal-about-content mahal-service-content">

              
              <h6 class="mahal-subtitle">About Us</h6>

              <h2 className="mahal-title">
                Welcome to  
                <span> MAHAL Food Marketplace</span>
              </h2>

              <p className="mahal-desc">
                MAHAL is a trusted B2B food sourcing platform connecting
                restaurants with verified suppliers through transparency,
                quality, and reliability.
              </p>

              <p class="mahal-text">
At MAHAL, we are redefining food supply chain management by enabling seamless ordering, transparent pricing, and long-term partnerships — all within one smart and scalable platform.
</p>


              <div className="mahal-feature-list mahal-highlights"  >
                <div><span>01</span> Verified Organic Products</div>
                <div><span>02</span> Healthy & Fresh Supply</div>
                <div><span>03</span> Locally Sourced Produce</div>
                <div><span>04</span> Quality You Can Trust</div>
              </div>

              {/* BUTTONS */}
              <div className="mahal-btn-group mt-4">
                <a href="/Registration" className="mahal-btn-primary">
                  Learn More
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

export default About;
