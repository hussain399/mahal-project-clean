import React, { useEffect, useRef } from "react";

import { Link } from "react-router-dom";
/* IMAGES */
import cat1 from "../../images/product_img_1.jpg";
import cat2 from "../../images/product_img_2.jpg";
import cat3 from "../../images/product_img_3.jpg";
import cat4 from "../../images/product_img_4.jpg";
import cat5 from "../../images/product_img_5.jpg";
import cat6 from "../../images/product_img_6.jpg";

const CATEGORIES = [
  { id: 1, name: "Fruits", image: cat1, items: 24 },
  { id: 2, name: "Meat", image: cat2, items: 18 },
  { id: 3, name: "Dairy", image: cat3, items: 12 },
  { id: 4, name: "Vegetables", image: cat4, items: 30 },
  { id: 5, name: "Bakery", image: cat5, items: 10 },
  { id: 6, name: "Sea Food", image: cat6, items: 15 },
];

const Categories = () => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    let scrollAmount = 0;

    const interval = setInterval(() => {
      if (!slider) return;

      slider.scrollLeft += 1;
      scrollAmount += 1;

      if (scrollAmount >= slider.scrollWidth / 2) {
        slider.scrollLeft = 0;
        scrollAmount = 0;
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="category_section pt_100 pb_80 mb-5 ">
      <div className="container">

        {/* HEADING */}
        <div className="row mb-5">
          <div className="col-xl-6 m-auto text-center">
            <div className="section_heading mb_40">
              <h4>Shop By Category</h4>
              <h2>Popular Categories</h2>
            </div>
          </div>
        </div>

        {/* SLIDER */}
        <div className="category_slider" ref={sliderRef}>
          {[...CATEGORIES, ...CATEGORIES].map((cat, index) => (
            <div className="category_card" key={index}>
              <div className="category_icon">
               
                
             <Link to="/restaurantdashboard/categorielist">
                <img src={cat.image} alt={cat.name} />
              </Link>
              {/* <Link to={`/categories/${cat.name}`}>
                <img src={cat.image} alt={cat.name} />
              </Link> */}
              </div>
              <h4>{cat.name}</h4>
              <p>{cat.items} Items</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Categories;








