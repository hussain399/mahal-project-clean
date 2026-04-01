// import React, { useRef } from "react";
// import {
//   FaChevronLeft,
//   FaChevronRight,
//   FaCarrot,
//   FaAppleAlt,
//   FaSeedling,
//   FaDrumstickBite,
//   FaCheese,
//   FaPepperHot,
//   FaOilCan,
//   FaBreadSlice,
// } from "react-icons/fa";

// const CATEGORIES = [
//   { name: "Fresh Vegetables", icon: <FaCarrot /> },
//   { name: "Fruits", icon: <FaAppleAlt /> },
//   { name: "Rice & Grains", icon: <FaSeedling /> },
//   { name: "Meat & Seafood", icon: <FaDrumstickBite /> },
//   { name: "Dairy Products", icon: <FaCheese /> },
//   { name: "Spices & Masalas", icon: <FaPepperHot /> },
//   { name: "Oils & Condiments", icon: <FaOilCan /> },
//   { name: "Bakery Supplies", icon: <FaBreadSlice /> },
// ];

// const MahalCategoriesSection = () => {
//   const scrollRef = useRef(null);

//   const scroll = (dir) => {
//     if (!scrollRef.current) return;

//     const scrollAmount = 300;

//     if (dir === "left") {
//       scrollRef.current.scrollLeft -= scrollAmount;
//     } else {
//       scrollRef.current.scrollLeft += scrollAmount;
//     }
//   };

//   return (
//     <section className="mahal-category-section ">
//       <div className="container">

//         <div className="mahal-category-header">
//           <h2>Shop by Category</h2>

//           {/* RIGHT SIDE ARROWS */}
//           <div className="mahal-nav-arrows">
//             <button onClick={() => scroll("left")}>
//               <FaChevronLeft />
//             </button>
//             <button onClick={() => scroll("right")}>
//               <FaChevronRight />
//             </button>
//           </div>
//         </div>

//         <div className="mahal-category-row" ref={scrollRef}>
//           {CATEGORIES.map((cat, index) => (
//             <div className="mahal-category-card" key={index}>
//               <div className="mahal-category-icon">
//                 {cat.icon}
//               </div>
//               <span>{cat.name}</span>
//             </div>
//           ))}
//         </div>

//       </div>
//     </section>
//   );
// };

// export default MahalCategoriesSection;




import React, { useRef } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCarrot,
  FaAppleAlt,
  FaSeedling,
  FaDrumstickBite,
  FaCheese,
  FaPepperHot,
  FaOilCan,
  FaBreadSlice,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/* STATIC DATA */
const CATEGORIES = [
  { name: "Vegetables", icon: <FaCarrot /> },
  { name: "Fruits", icon: <FaAppleAlt /> },
  { name: "Rice", icon: <FaSeedling /> },
  { name: "Meat", icon: <FaDrumstickBite /> },
  { name: "Dairy Products", icon: <FaCheese /> },
  { name: "Spices", icon: <FaPepperHot /> },
  { name: "Oils", icon: <FaOilCan /> },
  { name: "", icon: <FaBreadSlice /> },
];

const MahalCategoriesSection = () => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (dir) => {
    if (!scrollRef.current) return;

    const scrollAmount = 300;

    if (dir === "left") {
      scrollRef.current.scrollLeft -= scrollAmount;
    } else {
      scrollRef.current.scrollLeft += scrollAmount;
    }
  };

  /* CLICK NAVIGATION */
  const handleClick = (cat) => {
    navigate(`/categorieList?category=${encodeURIComponent(cat.name)}`);
  };

  return (
    <section className="mahal-category-section ">
      <div className="container">

        <div className="mahal-category-header">
          <h2>Shop by Category</h2>

          <div className="mahal-nav-arrows">
            <button onClick={() => scroll("left")}>
              <FaChevronLeft />
            </button>
            <button onClick={() => scroll("right")}>
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="mahal-category-row" ref={scrollRef}>
          {CATEGORIES.map((cat, index) => (
            <div
              className="mahal-category-card"
              key={index}
              onClick={() => handleClick(cat)}
              style={{ cursor: "pointer" }}
            >
              <div className="mahal-category-icon">
                {cat.icon}
              </div>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default MahalCategoriesSection;
