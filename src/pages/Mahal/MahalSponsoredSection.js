// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const API_BASE = "http://127.0.0.1:5000";

// const MahalSponsoredCarousel = () => {
//   const navigate = useNavigate();
//   const scrollRef = useRef(null);
//   const [pause, setPause] = useState(false);
//   const [products, setProducts] = useState([]);
//   const [timers, setTimers] = useState({});

//   /* ================= FETCH FROM BACKEND ================= */
//   useEffect(() => {
//     fetch(`${API_BASE}/api/sponsored`)
//       .then((res) => res.json())
//       .then((data) => {
//         const mapped = (data.products || []).map((item) => ({
//           id: item.id,
//           img:
//             item.image ||
//             `${API_BASE}/static/products/default.png`,
//           price: `₹${item.price}`,
//           tag: item.tag || "Special Offer",
//           offerEndsIn: item.offer_ends_in || 3600,
//         }));

//         setProducts(mapped);
//       })
//       .catch((err) => {
//         console.error("SPONSORED ERROR:", err);
//       });
//   }, []);

//   /* ================= AUTO SCROLL ================= */
//   useEffect(() => {
//     const el = scrollRef.current;
//     if (!el) return;

//     let pos = 0;
//     const interval = setInterval(() => {
//       if (pause) return;

//       pos += 1;
//       el.scrollLeft = pos;

//       if (pos >= el.scrollWidth - el.clientWidth) {
//         pos = 0;
//         el.scrollLeft = 0;
//       }
//     }, 25);

//     return () => clearInterval(interval);
//   }, [pause, products]);

//   /* ================= COUNTDOWN ================= */
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimers((prev) => {
//         const updated = {};
//         products.forEach((item) => {
//           const current = prev[item.id] ?? item.offerEndsIn;
//           updated[item.id] = current > 0 ? current - 1 : 0;
//         });
//         return updated;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [products]);

//   const formatTime = (s) => {
//     const m = Math.floor(s / 60);
//     const sec = s % 60;
//     return `${m}m ${sec}s`;
//   };

//   return (
//     <div className="container mt-5">

//       <h3 className="mm-sponsored-heading">
//         Supplier Spotlight
//       </h3>

//       <p className="mm-sponsored-sub">
//         Trusted suppliers • Limited-time offers
//       </p>

//       <div
//         className="mm-sponsored-row"
//         ref={scrollRef}
//         onMouseEnter={() => setPause(true)}
//         onMouseLeave={() => setPause(false)}
//       >
//         {products.map((item) => (
//           <div
//             className="mm-sponsored-card"
//             key={item.id}
//             onClick={() =>
//               navigate(`/shopdetails/${item.id}`)
//             }
//           >
//             {/* RIBBON */}
//             <span className="mm-ribbon">OFFER</span>

//             {/* COUNTDOWN */}
//             <span className="mm-countdown">
//               ENDS SOON · {formatTime(
//                 timers[item.id] ?? item.offerEndsIn
//               )}
//             </span>

//             {/* IMAGE */}
//             <div className="mm-sponsored-img">
//               <img
//                 src={item.img}
//                 alt="Sponsored product"
//                 onError={(e) => {
//                   e.target.src =
//                     `${API_BASE}/static/products/default.png`;
//                 }}
//               />
//             </div>

//             {/* CONTENT */}
//             <div className="mm-sponsored-content">
//               <strong>{item.price}</strong>
//               <p>{item.tag}</p>

//               <button
//                 onClick={(e) => {
//                   e.stopPropagation(); // 🔥 prevent double click issue
//                   navigate(`/shopdetails/${item.id}`);
//                 }}
//               >
//                 View Product
//               </button>
//             </div>

//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MahalSponsoredCarousel;




import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

const MahalSponsoredCarousel = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [pause, setPause] = useState(false);
  const [products, setProducts] = useState([]);
  const [timers, setTimers] = useState({});

  /* ================= FETCH FROM GRIDLIST ================= */
  useEffect(() => {
    fetch(`${API_BASE}/api/gridlist`)
      .then((res) => res.json())
      .then((data) => {

        // 👉 take first 10 products as sponsored
        const mapped = (data.products || []).slice(0, 10).map((item) => ({
          id: item.id,
          img: item.img1,
          price: `₹${item.price_numeric}`,
          tag: item.offer_text || item.label || "Special Offer",
          offerEndsIn: 3600, // default timer
        }));

        setProducts(mapped);
      })
      .catch((err) => {
        console.error("ERROR:", err);
      });
  }, []);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let pos = 0;
    const interval = setInterval(() => {
      if (pause) return;

      pos += 1;
      el.scrollLeft = pos;

      if (pos >= el.scrollWidth - el.clientWidth) {
        pos = 0;
        el.scrollLeft = 0;
      }
    }, 25);

    return () => clearInterval(interval);
  }, [pause, products]);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = {};
        products.forEach((item) => {
          const current = prev[item.id] ?? item.offerEndsIn;
          updated[item.id] = current > 0 ? current - 1 : 0;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [products]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <div className="container mt-5">

      <h3 className="mm-sponsored-heading">
        Supplier Spotlight
      </h3>

      <p className="mm-sponsored-sub">
        Trusted suppliers • Limited-time offers
      </p>

      <div
        className="mm-sponsored-row"
        ref={scrollRef}
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
      >
        {products.map((item) => (
          <div
            className="mm-sponsored-card"
            key={item.id}
            onClick={() =>
              navigate(`/shopdetails/${item.id}`)
            }
          >
            <span className="mm-ribbon">OFFER</span>

            <span className="mm-countdown">
              ENDS SOON · {formatTime(
                timers[item.id] ?? item.offerEndsIn
              )}
            </span>

            <div className="mm-sponsored-img">
              <img
                src={item.img}
                alt="Sponsored"
              />
            </div>

            <div className="mm-sponsored-content">
              <strong>{item.price}</strong>
              <p>{item.tag}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/shopdetails/${item.id}`);
                }}
              >
                View Product
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MahalSponsoredCarousel;