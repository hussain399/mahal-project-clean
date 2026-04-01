// import React, { useEffect, useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay } from "swiper/modules";
// import "swiper/css";

// /* IMAGES */
// import rice from "../../images/product_img_1.jpg";
// import spices from "../../images/product_img_2.jpg";
// import meat from "../../images/product_img_3.jpg";
// import dairy from "../../images/product_img_3.jpg";
// import kitchen from "../../images/product_img_4.jpg";
// import packaging from "../../images/product_img_5.jpg";
// import bulk from "../../images/product_img_6.jpg";
// import supplier from "../../images/product_img_7.jpg";

// const deals = [
//   { img: rice, name: "Basmati Rice 25kg", old: 2400, price: 1950, off: 18 },
//   { img: spices, name: "Garam Masala 5kg", old: 1200, price: 950, off: 20 },
//   { img: meat, name: "Frozen Chicken 10kg", old: 2800, price: 2250, off: 19 },
//   { img: dairy, name: "Bulk Butter 5kg", old: 1500, price: 1200, off: 15 },
//   { img: kitchen, name: "Chef Knife Set", old: 2200, price: 1800, off: 18 },
//   { img: packaging, name: "Food Containers 500pcs", old: 900, price: 720, off: 20 },
//   { img: bulk, name: "Storage Drums", old: 1800, price: 1500, off: 17 },
//   { img: supplier, name: "Cleaning Kit Combo", old: 1100, price: 850, off: 22 },
// ];

// const HotDealsCarousel = () => {
//   const [timeLeft, setTimeLeft] = useState(3600);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const formatTime = (sec) => {
//     const h = Math.floor(sec / 3600);
//     const m = Math.floor((sec % 3600) / 60);
//     const s = sec % 60;
//     return `${h}h ${m}m ${s}s`;
//   };

//   return (
//     <section className="flash-sale-section">
//       <div className="container">

//         <div className="flash-header">
//           <div>
//             <span className="flash-badge">🔥 Bulk Flash Sale</span>
//             <h2>Limited Time Procurement Deals</h2>
//           </div>
//           <div className="flash-timer">
//             ⏳ Ends in: {formatTime(timeLeft)}
//           </div>
//         </div>

//         <Swiper
//   spaceBetween={25}
//   autoplay={{ delay: 2500 }}
//   loop={true}
//   modules={[Autoplay]}
//   breakpoints={{
//     320:  { slidesPerView: 1.2 },
//     480:  { slidesPerView: 2 },
//     576:  { slidesPerView: 3 },
//     768:  { slidesPerView: 4 },
//     992:  { slidesPerView: 5 },
//     1400: { slidesPerView: 6 },   // 👈 Large desktop ki 6
//   }}
// >

//           {deals.map((item, i) => (
//           <SwiperSlide key={i}>
//   <div className="offer-card">

//     {/* SVG Discount Ribbon */}
//     <div className="discount-ribbon">
//      <svg width="39" height="38" viewBox="0 0 29 28" xmlns="http://www.w3.org/2000/svg">
//   <defs>
//     <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="1">
//       <stop offset="0%" stopColor="#FF8C00" />
//       <stop offset="100%" stopColor="#FF3D00" />
//     </linearGradient>
//   </defs>
//   <path
//     d="M28.9499 0C28.3999 0 27.9361 1.44696 27.9361 2.60412V27.9718L24.5708 25.9718L21.2055 27.9718L17.8402 25.9718L14.4749 27.9718L11.1096 25.9718L7.74436 27.9718L4.37907 25.9718L1.01378 27.9718V2.6037C1.01378 1.44655 0.549931 0 0 0H28.9499Z"
//     fill="url(#orangeGradient)"
//   />
// </svg>

//       <span>{item.off}%</span>
//     </div>

//     <div className="offer-image-wrapper">
//       <img src={item.img} alt={item.name} />
//     </div>

//     <h6 className="offer-title">{item.name}</h6>

//     <div className="price-section">
//       <div>
//         <span className="new-price">₹{item.price}</span>
//         <span className="old-price">₹{item.old}</span>
//       </div>

//       <button className="add-btn">ADD</button>
//     </div>

//   </div>
// </SwiperSlide>


//           ))}
//         </Swiper>

//       </div>
//     </section>
//   );
// };

// export default HotDealsCarousel;



import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const HotDealsCarousel = () => {
  const [timeLeft, setTimeLeft] = useState(3600);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 TIMER
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // 🔥 FETCH DEALS FROM BACKEND
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/deals");

        const formatted = res.data.map((d) => ({
          id: d.id,
          name: d.name,
          price: d.price,
          old: d.old_price,
          off: d.off,
          img: d.image?.startsWith("http")
            ? d.image
            : `http://127.0.0.1:5000${d.image}`, // 🔥 important fix
        }));

        setDeals(formatted);
      } catch (err) {
        console.error("❌ Deals fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) {
    return (
      <section className="flash-sale-section">
        <div className="container">
          <h3>Loading deals...</h3>
        </div>
      </section>
    );
  }

  return (
    <section className="flash-sale-section">
      <div className="container">

        {/* 🔥 HEADER */}
        <div className="flash-header">
          <div>
            <span className="flash-badge">🔥 Bulk Flash Sale</span>
            <h2>Limited Time Procurement Deals</h2>
          </div>
          <div className="flash-timer">
            ⏳ Ends in: {formatTime(timeLeft)}
          </div>
        </div>

        {/* 🔥 SWIPER */}
        <Swiper
          spaceBetween={25}
          autoplay={{ delay: 2500 }}
          loop={true}
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
          {deals.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="offer-card">

                {/* 🔥 DISCOUNT BADGE */}
                <div className="discount-ribbon">
                  <svg width="39" height="38" viewBox="0 0 29 28">
                    <defs>
                      <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FF8C00" />
                        <stop offset="100%" stopColor="#FF3D00" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M28.9499 0C28.3999 0 27.9361 1.44696 27.9361 2.60412V27.9718L24.5708 25.9718L21.2055 27.9718L17.8402 25.9718L14.4749 27.9718L11.1096 25.9718L7.74436 27.9718L4.37907 25.9718L1.01378 27.9718V2.6037C1.01378 1.44655 0.549931 0 0 0H28.9499Z"
                      fill="url(#orangeGradient)"
                    />
                  </svg>

                  <span>{item.off}%</span>
                </div>

                {/* 🔥 IMAGE */}
                <div className="offer-image-wrapper">
                  <img
                    src={item.img}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = "/fallback.png"; // optional fallback
                    }}
                  />
                </div>

                {/* 🔥 TITLE */}
                <h6 className="offer-title">{item.name}</h6>

                {/* 🔥 PRICE */}
                <div className="price-section">
                  <div>
                    <span className="new-price">₹{item.price}</span>
                    <span className="old-price">₹{item.old}</span>
                  </div>

                  <button className="add-btn">ADD</button>
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
};

export default HotDealsCarousel;