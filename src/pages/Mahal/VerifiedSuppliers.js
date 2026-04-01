// import React from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay } from "swiper/modules";
// import "swiper/css";
// import { FaStar } from "react-icons/fa";


// /* IMAGES */
// import supplier1 from "../../images/product_img_1.jpg";
// import supplier2 from "../../images/product_img_2.jpg";
// import supplier3 from "../../images/product_img_3.jpg";
// import supplier4 from "../../images/product_img_4.jpg";
// import supplier5 from "../../images/product_img_5.jpg";

// const suppliers = [
//   {
//     img: supplier1,
//     name: "FreshFarm Foods",
//     rating: 4.8,
//     delivery: "24 hrs delivery",
//     minOrder: "Min Order ₹5,000",
//   },
//   {
//     img: supplier2,
//     name: "SpiceHub Traders",
//     rating: 4.6,
//     delivery: "Same day dispatch",
//     minOrder: "Min Order ₹3,000",
//   },
//   {
//     img: supplier3,
//     name: "Metro Meat Supply",
//     rating: 4.9,
//     delivery: "Next day delivery",
//     minOrder: "Min Order ₹8,000",
//   },
//   {
//     img: supplier4,
//     name: "DairyPro Distributors",
//     rating: 4.7,
//     delivery: "48 hrs delivery",
//     minOrder: "Min Order ₹4,000",
//   },
//   {
//     img: supplier5,
//     name: "KitchenEquip India",
//     rating: 4.5,
//     delivery: "3-5 days delivery",
//     minOrder: "Min Order ₹10,000",
//   },
//    {
//     img: supplier1,
//     name: "FreshFarm Foods",
//     rating: 4.8,
//     delivery: "24 hrs delivery",
//     minOrder: "Min Order ₹5,000",
//   },
//   {
//     img: supplier2,
//     name: "SpiceHub Traders",
//     rating: 4.6,
//     delivery: "Same day dispatch",
//     minOrder: "Min Order ₹3,000",
//   },
//   {
//     img: supplier3,
//     name: "Metro Meat Supply",
//     rating: 4.9,
//     delivery: "Next day delivery",
//     minOrder: "Min Order ₹8,000",
//   },
//   {
//     img: supplier4,
//     name: "DairyPro Distributors",
//     rating: 4.7,
//     delivery: "48 hrs delivery",
//     minOrder: "Min Order ₹4,000",
//   },
//   {
//     img: supplier5,
//     name: "KitchenEquip India",
//     rating: 4.5,
//     delivery: "3-5 days delivery",
//     minOrder: "Min Order ₹10,000",
//   },
// ];

// const VerifiedSuppliersCarousel = () => {
//   return (
//     <section className="supplier-section">
//       <div className="container">

//         <div className="supplier-header">
//           <h2>Verified Suppliers</h2>
//           <p>Trusted partners powering restaurant procurement</p>
//         </div>

//         <Swiper
//           slidesPerView={5}
//           spaceBetween={25}
//           autoplay={{ delay: 2500 }}
//           loop={true}
//           modules={[Autoplay]}
//           breakpoints={{
//     320:  { slidesPerView: 1.2 },
//     480:  { slidesPerView: 2 },
//     576:  { slidesPerView: 3 },
//     768:  { slidesPerView: 4 },
//     992:  { slidesPerView: 5 },
//     1400: { slidesPerView: 6 },   // 👈 Large desktop ki 6
//   }}
//         >
//           {suppliers.map((supplier, index) => (
//            <SwiperSlide key={index}>
//   <div className="supplier-card">

//     {/* Verified Ribbon */}
//     <div className="verified-ribbon">
//       ✔ Verified
//     </div>

//     <div className="supplier-logo">
//       <img src={supplier.img} alt={supplier.name} />
//     </div>

//     <h6 className="supplier-name">{supplier.name}</h6>

//   <div className="supplier-rating">
//   <FaStar className="star-icon" />
//   {supplier.rating}
// </div>


//     <div className="supplier-meta">
//       <p>{supplier.delivery}</p>
//       <p>{supplier.minOrder}</p>
//     </div>

//     <button className="view-btn">
//       View Supplier
//     </button>

//   </div>
// </SwiperSlide>

//           ))}
//         </Swiper>

//       </div>
//     </section>
//   );
// };

// export default VerifiedSuppliersCarousel;



import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const VerifiedSuppliersCarousel = () => {
  const [suppliers, setSuppliers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:5000/api/suppliers"
        );

        console.log("🔥 SUPPLIERS:", res.data);

        setSuppliers(res.data.suppliers || []);
      } catch (err) {
        console.error("❌ Supplier fetch error:", err);
      }
    };

    fetchSuppliers();
  }, []);

  return (
    <section className="supplier-section">
      <div className="container">

        {/* HEADER */}
        <div className="supplier-header">
          <h2>Verified Suppliers</h2>
          <p>Trusted partners powering restaurant procurement</p>
        </div>

        <Swiper
          spaceBetween={25}
          autoplay={{ delay: 2500 }}
          loop={suppliers.length > 5}
          modules={[Autoplay]}
          breakpoints={{
            320: { slidesPerView: 1.2 },
            480: { slidesPerView: 2 },
            576: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            992: { slidesPerView: 5 },
            1400: { slidesPerView: 6 },
          }}
        >
          {suppliers.map((supplier, index) => (
            <SwiperSlide key={supplier.id || index}>
              <div className="supplier-card">

                {/* VERIFIED */}
                <div className="verified-ribbon">
                  ✔ Verified
                </div>

                {/* IMAGE */}
                <div className="supplier-logo">
                  <img
                    src={
                      supplier.image
                        ? supplier.image.replace("127.0.0.1", "localhost")
                        : "http://127.0.0.1:5000/static/products/default.png"
                    }
                    alt={supplier.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "http://127.0.0.1:5000/static/products/default.png";
                    }}
                  />
                </div>

                {/* NAME */}
                <h6 className="supplier-name">
                  {supplier.name}
                </h6>

                {/* RATING */}
                <div className="supplier-rating">
                  <FaStar className="star-icon" />
                  {supplier.rating || 4.5}
                </div>

                {/* META */}
                <div className="supplier-meta">
                  <p>{supplier.delivery || "Fast Delivery"}</p>
                  <p>{supplier.minOrder || "Min Order ₹5000"}</p>
                </div>

                {/* ✅ UPDATED LIKE CATEGORY */}
                <button
                  className="view-btn"
                  onClick={() =>
                    navigate(
                      `/categorieList?supplier=${supplier.id}&name=${encodeURIComponent(
                        supplier.name
                      )}`
                    )
                  }
                >
                  View Supplier
                </button>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
};

export default VerifiedSuppliersCarousel;