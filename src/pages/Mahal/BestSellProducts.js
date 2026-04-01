import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // ✅ IMPORTANT
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { FaStar, FaShoppingCart, FaEye } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";

import bannerImg from "../../images/side_img1.jpg";

const API_BASE = "http://127.0.0.1:5000"; // ✅ SAME AS SECOND FILE

/* PRICE FIX */
const parsePrice = (val) => {
  if (!val) return 0;
  return Number(String(val).replace(/[^\d.]/g, "")) || 0;
};

const BestSellProducts = () => {
  const [products, setProducts] = useState([]);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${API_BASE}/api/deals-of-the-day`)
      .then((res) => res.json())
      .then((data) => {
        let items = data.data || data.products || [];

        if (!items.length) {
          return fetch(`${API_BASE}/api/gridlist`)
            .then((res) => res.json())
            .then((data2) => {
              setProducts(data2.products || []);
            });
        }

        setProducts(items);
      })
      .catch((err) => {
        console.error("FETCH ERROR:", err);
      });
  }, []);

  /* ================= ADD TO CART (LIKE SECOND FILE) ================= */
  const addToCart = (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login");
      return;
    }

    axios.post(
      `${API_BASE}/api/cart/add`,
      {
        product_id: item.id,
        quantity: 1,
        price: item.price_numeric || parsePrice(item.price),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(() => {
      alert("Added to cart 🛒");
    })
    .catch((err) => {
      console.error("CART ERROR", err);
      alert("Backend error");
    });
  };

  return (
    <section className="best_sell popular_products mt_100 xs_mt_80">
      <div className="container">

        {/* HEADING */}
        <div className="row">
          <div className="col-xl-5 m-auto">
            <div className="section_heading text-center heading_left mb_25 m-auto">
              <h4 className="premium_badge text-white">
                🔥 Best Selling Offers
              </h4>
              <h2 className="premium_title">Top Deals For You</h2>
            </div>
          </div>
        </div>

        <div className="row mt-5">

          {/* LEFT BANNER */}
          <div className="col-xl-3 col-md-6 col-lg-4">
            <div className="special_product_banner">
              <img src={bannerImg} alt="special" className="img-fluid w-100" />
              <div className="text">
                <h5>Hot Deals</h5>
                <h3>Save Big on Today’s Offers</h3>
                <Link to="/ShopDetails" className="common_btn">
                  shop now <i className="fas fa-long-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* PRODUCT SLIDER */}
          <div className="col-xl-9 col-md-6 col-lg-8">
            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={4}
              spaceBetween={10}
              navigation
              autoplay={{ delay: 3500 }}
              loop
              breakpoints={{
                0: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
              }}
              className="best_sell_slider"
            >
              {products.map((p) => {

                const price =
                  p.price_numeric ??
                  p.selling_price ??
                  parsePrice(p.price);

                const old =
                  p.old_price_numeric ??
                  p.mrp ??
                  parsePrice(p.old_price);

                const discount =
                  old > price
                    ? Math.round(((old - price) / old) * 100)
                    : 0;

                return (
                  <SwiperSlide key={p.id}>
                    <div className="mm-product-card">

                      {/* DISCOUNT */}
                      {discount > 0 && (
                        <span className="mm-discount-badge">
                          {discount}% OFF
                        </span>
                      )}

                      {/* IMAGE */}
                      <div className="mm-product-img">
                        <img
                          src={
                            p.img1 ||
                            `${API_BASE}/static/products/default.png`
                          }
                          alt={p.name}
                        />
                      </div>

                      {/* CONTENT */}
                      <div className="mm-product-content">

                        {/* RATING */}
                        <div className="mm-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < Math.floor(p.rating || 4) ? "active" : ""
                              }
                            />
                          ))}
                        </div>

                        {/* TITLE */}
                        <Link
                          to={`/shopdetails/${p.id}`}
                          className="mm-product-title"
                        >
                          {p.name}
                        </Link>

                        {/* PRICE */}
                        <div className="mm-price">
                          <span className="mm-new">
                            ₹{price}
                          </span>

                          {old > price && (
                            <span className="mm-old">
                              ₹{old}
                            </span>
                          )}
                        </div>

                        {/* ACTIONS */}
                        <div className="mm-actions">

                          {/* ADD TO CART */}
                          <button
                            onClick={() => addToCart(p)}
                          
                          >
                            <FaShoppingCart />
                          </button>

                          {/* VIEW */}
                          <Link to={`/shopdetails/${p.id}`}>
                            <FaEye />
                          </Link>

                        </div>

                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BestSellProducts;