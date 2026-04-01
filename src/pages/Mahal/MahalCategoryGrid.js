import React from "react";
 

/* ICON / IMAGE IMPORTS */
import veg from "../../images/product_img_1.jpg";
import rice from "../../images/product_img_2.jpg";
import spices from "../../images/product_img_3.jpg";
import meat from "../../images/product_img_4.jpg";
import dairy from "../../images/product_img_5.jpg";
import oil from "../../images/product_img_6.jpg";
import packaging from "../../images/product_img_7.jpg";
import kitchen from "../../images/product_img_8.jpg";
import bulk from "../../images/product_img_1.jpg";
import supplier from "../../images/product_img_2.jpg";
import offers from "../../images/product_img_3.jpg";
import trending from "../../images/product_img_4.jpg";

const categories = [
  { name: "Vegetables", img: veg, category: "Vegetables", badge: "NEW" },
  { name: "Rice & Grains", img: rice, category: "Rice" },
  { name: "Spices", img: spices, category: "Spices", badge: "OFFER" },
  { name: "Meat & Seafood", img: meat, category: "Meat" },
  { name: "Dairy", img: dairy, category: "Dairy" },
  { name: "Oil & Ghee", img: oil, category: "Oil" },
  { name: "Packaging", img: packaging, category: "Packaging" },
  { name: "Kitchen Needs", img: kitchen, category: "Kitchen" },
  { name: "Bulk Orders", img: bulk, category: "Bulk", badge: "HOT" },
  { name: "Suppliers", img: supplier, category: "Suppliers" },
  { name: "Offers", img: offers, category: "Offers", badge: "OFFER" },
  { name: "Trending", img: trending, category: "Trending" },
];

const MahalCategoryGrid = ({ activeCategory, onCategorySelect }) => {
  return (
    <div className="container mt-5">

         {/* HEADING */}
        <div className="row">
          <div className="col-xl-6 m-auto text-center">
            <div className="section_heading text-center heading_left mb_25 m-auto mb-3">
              <h4 className="premium_badge text-white">
Shop by Category
              </h4>
              <h2 className="premium_title">All restaurant essentials in one place</h2>
            </div>
          </div>
        </div>

      

      {/* CATEGORY GRID */}
      <div className="mm-cat-scroll mt-5">
        <div className="mm-cat-grid">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`mm-cat-item ${
                activeCategory === cat.category ? "active" : ""
              }`}
              onClick={() => onCategorySelect?.(cat.category)}
            >
              <div className="mm-cat-tile">
                {cat.badge && (
                  <span className={`mm-cat-badge ${cat.badge.toLowerCase()}`}>
                    {cat.badge}
                  </span>
                )}
                <img src={cat.img} alt={cat.name} />
              </div>
              <span className="mm-cat-label">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MahalCategoryGrid;
