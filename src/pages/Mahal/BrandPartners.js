import React from "react";

import brand1 from "../../images/brand_item_1.png";
import brand2 from "../../images/brand_item_2.png";
import brand3 from "../../images/brand_item_3.png";
import brand4 from "../../images/brand_item_4.png";
import brand5 from "../../images/brand_item_5.png";
import brand6 from "../../images/brand_item_6.png";

const brands = [
  brand1,
  brand2,
  brand3,
  brand4,
  brand5,
  brand6,
];

const BrandPartners = () => {
  return (
    <section className="mahal-brand-section mb-5">
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-lg-6 m-auto text-center">
            <span className="mahal-pill">OUR PARTNERS</span>
            <h2 className="mahal-title">
              Trusted by <span>Leading Food Brands</span>
            </h2>
            <p className="mahal-desc">
              We collaborate with trusted suppliers and brands to ensure
              consistent quality and reliable sourcing.
            </p>
          </div>
        </div>

        {/* BRAND MARQUEE */}
        <div className="mahal-brand-marquee">
          <ul className="brand-track">
            {brands.concat(brands).map((img, index) => (
              <li key={index} className="brand-item">
                <img src={img} alt="Partner Brand" />
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center  ">
          <a href="/Registration" className="mahal-btn-primary">
            Become a Partner
          </a>
        </div>

      </div>
    </section>
  );
};

export default BrandPartners;
