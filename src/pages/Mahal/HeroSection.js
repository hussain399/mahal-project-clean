import React from "react";

/* IMAGES */
import rice from "../../images/product_img_1.jpg";
import spices from "../../images/product_img_2.jpg";
import meat from "../../images/product_img_3.jpg";
import dairy from "../../images/product_img_3.jpg";
import kitchen from "../../images/product_img_4.jpg";
import packaging from "../../images/product_img_5.jpg";
import bulk from "../../images/product_img_6.jpg";
 

const categories = [
  { img: rice, label: "Staples & Grains", key: "staples" },
  { img: spices, label: "Spices & Condiments", key: "spices" },
  { img: meat, label: "Fresh Meat & Poultry", key: "meat" },
  { img: dairy, label: "Dairy & Frozen", key: "dairy" },
  { img: kitchen, label: "Kitchen Equipment", key: "equipment" },
  { img: packaging, label: "Packaging Materials", key: "packaging" },
  { img: bulk, label: "Bulk Storage", key: "storage" },
   
];

const CategoryGrid = ({ onSelect }) => {
  return (
    <section className="mahal-category-section">
      <div className="container">
        <div className="section-header text-center mb-4">
          <h2>Shop by Category</h2>
          <p>Everything your restaurant needs in one place</p>
        </div>

        <div className="mahal-category-grid">
          {categories.map((cat, index) => (
            <div
              className="mahal-category-card"
              key={index}
              onClick={() => onSelect?.(cat.key)}
            >
              <div className="category-img">
                <img src={cat.img} alt={cat.label} />
              </div>
              <h6>{cat.label}</h6>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
