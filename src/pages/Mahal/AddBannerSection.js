import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";


/* ================= IMAGES ================= */
import banner1 from "../../images/banner_bg_7.jpg";
import banner2 from "../../images/banner_bg_8.jpg";
import banner3 from "../../images/banner_bg_9.jpg";

/* ================= DATA ================= */
const ADD_BANNERS = [
  {
    id: 1,
    title: "Up to 50% off on Special Item",
    desc: "Shop our selection of organic fresh vegetables in a discounted price. 50% off",
    image: banner1,
  },
  {
    id: 2,
    title: "Get 10% off on Fruits Item",
    desc: "Shop our selection of organic fresh vegetables in a discounted price. 10% off",
    image: banner2,
  },
  {
    id: 3,
    title: "Get 75% Organic Vegetable",
    desc: "Shop our selection of organic fresh vegetables in a discounted price. 75% off",
    image: banner3,
  },
];



/* ================= COMPONENT ================= */
const OffersBanner = () => {
  return (

    <section className="add_banner_3   xs_pt_55">
      <div className="container">
        <div className="row">

          {ADD_BANNERS.map((item) => (
            <div className="col-xl-4 col-md-6 mb-4" key={item.id}>

             <div
  className="mm-add-banner"
  style={{ backgroundImage: `url(${item.image})` }}
>
  <div className="mm-banner-overlay"></div>

  <div className="mm-banner-content">
    <span className="mm-badge">Limited Offer</span>

    <h3>{item.title}</h3>
    <p>{item.desc}</p>

    <Link to="/CategorieList" className="mm-banner-btn">
      Explore Now →
    </Link>
  </div>
</div>


            </div>
          ))}

        </div>
      </div>
    </section>

  );
};

export default OffersBanner;
