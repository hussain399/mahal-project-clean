import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { FaSearch, FaMobileAlt } from "react-icons/fa";

import "swiper/css";
import "swiper/css/pagination";

/* -------- IMAGES -------- */
import slider1 from "../../images/small_poster1.jpg";
import slider2 from "../../images/small_poster2.jpg";
import slider3 from "../../images/small_poster3.jpg";

import bannerAdd1 from "../../images/small_poster4.jpg";
import bannerAdd2 from "../../images/small_poster5.jpg";

const slides = [
  {
    image: slider1,
    badge: "Fresh Deals",
    title: "Fresh Essentials Delivered to Your Doorstep",
    desc: "Shop vegetables, fruits & daily groceries at unbeatable prices.",
  },
  {
    image: slider2,
    badge: "Digital Ordering",
    title: "Order Smarter with the Mahal Mobile App",
    desc: "Browse, compare suppliers & manage bulk orders in one place.",
  },
  {
    image: slider3,
    badge: "Fast Delivery",
    title: "Fast & Reliable Bulk Deliveries",
    desc: "From warehouse to kitchen — on time, every time.",
  },
];

const BannerSection = () => {
  return (
    <section className="mm-hero-section mt-4 container  px-4">
      <div className="row g-4">

        {/* ================= LEFT HERO ================= */}
        <div className="col-xl-8">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4000 }}
            pagination={{ clickable: true }}
            loop
            slidesPerView={1}
            className="mm-hero-swiper"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <div
                  className="mm-hero-slide"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="mm-hero-overlay"></div>

                  <div className="mm-hero-content">

                    <motion.span
                      className="mm-hero-badge"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      {slide.badge}
                    </motion.span>

                    <motion.h1
                      key={slide.title}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      {slide.title}
                    </motion.h1>

                    <motion.p
                      key={slide.desc}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {slide.desc}
                    </motion.p>

                    {/* SEARCH BAR */}
                    <div className="mm-hero-search">
                      <FaSearch />
                      <input
                        type="text"
                        placeholder="Search products, suppliers..."
                      />
                      <button>Search</button>
                    </div>

                    {/* CTA BUTTONS */}
                    <div className="mm-hero-cta">
                      <Link to="/ShopDetails" className="mm-hero-btn">
                        Explore Now →
                      </Link>

                      <Link to="#" className="mm-download-btn">
                        <FaMobileAlt /> Download App
                      </Link>
                    </div>

                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* ================= RIGHT SIDE BANNERS ================= */}
        <div className="col-xl-4">
          <div
            className="mm-side-banner"
            style={{ backgroundImage: `url(${bannerAdd1})` }}
          >
            <div className="mm-side-overlay"></div>
            <div className="mm-side-content">
              <h4>Summer Offer</h4>
              <h3>Healthy Organic Food</h3>
              <Link to="/ShopDetails">Shop Now →</Link>
            </div>
          </div>

          <div
            className="mm-side-banner"
            style={{ backgroundImage: `url(${bannerAdd2})` }}
          >
            <div className="mm-side-overlay"></div>
            <div className="mm-side-content">
              <h4>Special Offer</h4>
              <h3>Fresh Organic Food</h3>
              <Link to="/ShopDetails">Shop Now →</Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default BannerSection;
