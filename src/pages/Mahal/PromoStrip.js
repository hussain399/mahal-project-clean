import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* images */
import riceImg from "../../images/rice.png";
import meatImg from "../../images/meal.png";
import dailyImg from "../../images/Daily_Essentials.png";

const PromoStrip = () => {
  const navigate = useNavigate();

  /* ✅ ALL BANNERS */
  const banners = [
    {
      title: "Bulk Rice Offers",
      desc: "Up to 20% off",
      cta: "View Products",
      category: "Rice",
      theme: "rice",
      image: riceImg,
    },
    {
      title: "Meat Deals",
      desc: "Fresh & Frozen",
      cta: "View Products",
      category: "Meat",
      theme: "meat",
      image: meatImg,
    },
    {
      title: "Daily Essentials",
      desc: "Best Prices",
      cta: "View Products",
      category: "Daily",
      theme: "daily",
      image: dailyImg,
    },
  ];

  const [visibleBanners, setVisibleBanners] = useState([]);

  /* 🔀 RANDOM PICK FUNCTION */
  const getRandomBanners = () => {
    const shuffled = [...banners].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    setVisibleBanners(getRandomBanners());
  }, []);

  /* ================= AUTO CHANGE EVERY 6 HOURS ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleBanners(getRandomBanners());
    }, 6 * 60 * 60 * 1000); // ✅ 6 hours

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mt-5">
      <section className="mm-promo-strip">

        {visibleBanners.map((c, i) => (
          <div
            className={`mm-promo-card mm-theme-${c.theme}`}
            key={i}
          >
            {/* glow */}
            <span className="mm-promo-glow" />

            {/* LEFT CONTENT */}
            <div className="mm-promo-content">
              <h4>{c.title}</h4>
              <p>{c.desc}</p>

              {/* ✅ CATEGORY FILTER */}
              <button
                onClick={() =>
                  navigate(
                    `/categorieList?category=${encodeURIComponent(
                      c.category
                    )}`
                  )
                }
              >
                {c.cta}
              </button>
            </div>

            {/* RIGHT IMAGE */}
            <div className="mm-promo-media">
              <img src={c.image} alt={c.title} />
            </div>
          </div>
        ))}

      </section>
    </div>
  );
};

export default PromoStrip;