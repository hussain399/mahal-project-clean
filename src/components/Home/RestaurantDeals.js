import React, { useEffect, useState } from "react";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_BASE = "http://127.0.0.1:5000";

const RestaurantDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH CATEGORIES
  ========================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("🚀 Fetching categories...");

        // 🔥 Try both URLs (auto fix)
        let res = await fetch(`${API_BASE}/api/categories`);

        if (!res.ok) {
          console.warn("⚠️ /api/categories failed, trying /categories...");
          res = await fetch(`${API_BASE}/categories`);
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("🔥 API RESPONSE:", data);

        let categoriesArray = [];

        // ✅ Handle all formats
        if (Array.isArray(data)) {
          categoriesArray = data;
        } else if (data.categories) {
          categoriesArray = data.categories;
        } else {
          console.warn("⚠️ Unexpected API format:", data);
          categoriesArray = [];
        }

        const formatted = categoriesArray.map((item) => ({
          id: item.id,
          name: item.name || "Unnamed",
          img: item.image || null,
        }));

        console.log("✅ FORMATTED DATA:", formatted);

        setDeals(formatted);
      } catch (err) {
        console.error("❌ Category fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /* =========================
     SLIDER SETTINGS
  ========================= */
  const settings = {
    dots: false,
    arrows: true,
    infinite: deals.length > 5,
    speed: 600,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: deals.length > 0,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 992, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="mahal-deals-section">
      <div className="container">

        {/* HEADING */}
        <div className="row mb-4">
          <div className="col-lg-6">
            <h2 className="mahal-title">
              Shop By <span>Category</span>
            </h2>
            <p className="mahal-desc">Popular Categories</p>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="text-center">Loading categories...</div>
        ) : deals.length === 0 ? (
          <div className="text-center text-danger">
            ❌ No categories found (Check API / DB)
          </div>
        ) : (
          <Slider {...settings}>
            {deals.map((deal) => (
              <div key={deal.id} className="px-2">
                <div className="mahal-deal-card">

                  {/* IMAGE */}
                  <img
                    src={
                      deal.img
                        ? deal.img
                        : "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={deal.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=Image+Error";
                    }}
                  />

                  {/* NAME */}
                  <h4
                    style={{
                      textAlign: "center",
                      marginTop: "10px",
                      fontSize: "16px",
                    }}
                  >
                    {deal.name}
                  </h4>

                </div>
              </div>
            ))}
          </Slider>
        )}

      </div>
    </section>
  );
};

export default RestaurantDeals;