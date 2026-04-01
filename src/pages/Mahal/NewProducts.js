// import React from "react";
// import { Link } from "react-router-dom";
// import { FaStar, FaShoppingCart, FaEye, FaHeart } from "react-icons/fa";


// /* IMAGES */
// import p1 from "../../images/product_img_1.jpg";
// import p2 from "../../images/product_img_2.jpg";
// import p3 from "../../images/product_img_3.jpg";
// import p4 from "../../images/product_img_4.jpg";
// import p5 from "../../images/product_img_5.jpg";
// import p6 from "../../images/product_img_6.jpg";
// import p7 from "../../images/product_img_7.jpg";
// import p8 from "../../images/product_img_8.jpg";

// /* DATA */
// const TRENDING_PRODUCTS = [
//   {
//     id: 1,
//     title: "Lemon Meat Bone",
//     price: 20,
//     old: 25,
//     rating: 4,
//     tag: "hot",
//     img: p1,
//   },
//   {
//     id: 2,
//     title: "Fresh Red Seedless",
//     price: 12,
//     old: 10,
//     rating: 4.5,
//     tag: "new",
//     img: p2,
//   },
//   {
//     id: 3,
//     title: "Carrot Vegetables",
//     price: 33,
//     old: 28,
//     rating: 5,
//     tag: "hot",
//     img: p3,
//   },
//   {
//     id: 4,
//     title: "Bengal Beef Bone",
//     price: 12,
//     old: 10,
//     rating: 3,
//     tag: "sale",
//     img: p4,
//   },
//   {
//     id: 5,
//     title: "Carrot Vegetables",
//     price: 45,
//     old: 50,
//     rating: 4,
//     tag: "hot",
//     img: p5,
//   },
//   {
//     id: 6,
//     title: "Orange Slice Mix",
//     price: 29,
//     old: 35,
//     rating: 4.5,
//     tag: "sale",
//     img: p6,
//   },
//   {
//     id: 7,
//     title: "Beef Butter Cake",
//     price: 30,
//     old: 34,
//     rating: 4,
//     tag: "new",
//     img: p7,
//   },
//   {
//     id: 8,
//     title: "Fresh Mango Fruits",
//     price: 22,
//     old: 26,
//     rating: 5,
//     tag: "sale",
//     img: p8,
//   },
//   {
//     id: 9,
//     title: "Carrot Vegetables",
//     price: 45,
//     old: 50,
//     rating: 4,
//     tag: "hot",
//     img: p5,
//   },
//   {
//     id: 10,
//     title: "Orange Slice Mix",
//     price: 29,
//     old: 35,
//     rating: 4.5,
//     tag: "sale",
//     img: p6,
//   },
//   {
//     id: 11,
//     title: "Beef Butter Cake",
//     price: 30,
//     old: 34,
//     rating: 4,
//     tag: "new",
//     img: p7,
//   },
//   {
//     id: 12,
//     title: "Fresh Mango Fruits",
//     price: 22,
//     old: 26,
//     rating: 5,
//     tag: "sale",
//     img: p8,
//   },
// ];

// const NewProducts = () => {
//   return (
//     <section className="trending_products bg1  ">
//       <div className="container">
//         {/* HEADING */}
//         <div className="row">
//           <div className="col-xl-6 m-auto text-center">
//             <div className="section_heading text-center heading_left mb_25 m-auto mb-3">
//               <h4 className="premium_badge text-white">
//                   Trending Now
//               </h4>
//               <h2 className="premium_title">Discover what people are loving today</h2>
//             </div>
//           </div>
//         </div>

//         {/* GRID */}
//         <div className="row mt-4">
//           {TRENDING_PRODUCTS.map((item) => (
//             <div key={item.id} className="col-xl-2 col-lg-3 col-sm-6 mb-4">

//               <div className="mm-trending-card">

//   {/* TAG */}
//   <span className={`mm-trend-tag ${item.tag}`}>
//     {item.tag === "hot"
//       ? "Hot"
//       : item.tag === "new"
//       ? "New"
//       : "Sale"}
//   </span>

//   {/* IMAGE */}
//   <div className="mm-trending-img">
//     <img src={item.img} alt={item.title} />
//   </div>

//   {/* ACTIONS */}
//   <div className="mm-trend-actions">
//     <button><FaShoppingCart /></button>
//     <Link to="/ShopDetails"><FaEye /></Link>
//     <button><FaHeart /></button>
//   </div>

//   {/* INFO */}
//   <div className="mm-trending-info">
//     <h4>{item.title}</h4>

//     <div className="mm-trend-rating">
//       {Array.from({ length: 5 }).map((_, i) => (
//         <FaStar
//           key={i}
//           className={i < Math.floor(item.rating) ? "active" : ""}
//         />
//       ))}
//     </div>

//     <div className="mm-price">
//       <span className="mm-new">${item.price.toFixed(2)}</span>
//       <span className="mm-old">${item.old.toFixed(2)}</span>
//     </div>
//   </div>

// </div>


//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default NewProducts;
































// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { FaStar, FaShoppingCart, FaEye, FaHeart } from "react-icons/fa";

// const API_BASE = "http://127.0.0.1:5000";

// const ITEMS_PER_PAGE = 12; // ✅ SHOW 12 PRODUCTS

// const NewProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [startIndex, setStartIndex] = useState(0);

//   /* ================= FETCH ================= */
//   useEffect(() => {
//     fetch(`${API_BASE}/api/trending`)
//       .then((res) => res.json())
//       .then((data) => {
//         const items = data.products || [];

//         console.log("TOTAL PRODUCTS:", items.length); // 🔥 DEBUG

//         const mapped = items.map((item) => ({
//           id: item.id,
//           title: item.name,
//           price: item.price_numeric || 0,
//           rating: item.rating || 4,
//           img:
//             item.img1 ||
//             `${API_BASE}/static/products/default.png`,
//         }));

//         setProducts(mapped);
//       })
//       .catch((err) => {
//         console.error("❌ Trending API error:", err);
//       });
//   }, []);

//   /* ================= AUTO CHANGE ================= */
//   useEffect(() => {
//     if (products.length <= ITEMS_PER_PAGE) return;

//     const interval = setInterval(() => {
//       setStartIndex((prev) => {
//         const next = prev + ITEMS_PER_PAGE;
//         return next >= products.length ? 0 : next;
//       });
//     }, 10800000); // ⏱️ 3 HOURS

//     return () => clearInterval(interval);
//   }, [products]);

//   /* ================= VISIBLE PRODUCTS ================= */
//   const visibleProducts = products.slice(
//     startIndex,
//     startIndex + ITEMS_PER_PAGE
//   );

//   return (
//     <section className="trending_products bg1">
//       <div className="container">

//         <div className="row">
//           <div className="col-xl-6 m-auto text-center">
//             <div className="section_heading mb-3">
//               <h4 className="premium_badge text-white">
//                 Trending Now
//               </h4>
//               <h2 className="premium_title">
//                 Discover what people are loving today
//               </h2>
//             </div>
//           </div>
//         </div>

//         <div className="row mt-4">
//           {visibleProducts.length === 0 ? (
//             <p className="text-center">Loading products...</p>
//           ) : (
//             visibleProducts.map((item) => (
//               <div
//                 key={item.id}
//                 className="col-xl-2 col-lg-3 col-sm-6 mb-4"
//               >
//                 {/* ✅ col-xl-2 → 6 per row → 12 = 2 rows */}

//                 <div className="mm-trending-card">

//                   <span className="mm-trend-tag new">New</span>

//                   <div className="mm-trending-img">
//                     <img
//                       src={item.img}
//                       alt={item.title}
//                       onError={(e) => {
//                         e.target.src =
//                           `${API_BASE}/static/products/default.png`;
//                       }}
//                     />
//                   </div>

//                   <div className="mm-trend-actions">
//                     <button><FaShoppingCart /></button>
//                     <Link to={`/product/${item.id}`}>
//                       <FaEye />
//                     </Link>
//                     <button><FaHeart /></button>
//                   </div>

//                   <div className="mm-trending-info">
//                     <h4>{item.title}</h4>

//                     <div className="mm-trend-rating">
//                       {Array.from({ length: 5 }).map((_, i) => (
//                         <FaStar
//                           key={i}
//                           className={
//                             i < Math.floor(item.rating)
//                               ? "active"
//                               : ""
//                           }
//                         />
//                       ))}
//                     </div>

//                     <div className="mm-price">
//                       ₹{item.price.toFixed(2)}
//                     </div>

//                   </div>

//                 </div>

//               </div>
//             ))
//           )}
//         </div>

//       </div>
//     </section>
//   );
// };

// export default NewProducts;




import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaShoppingCart, FaEye, FaHeart } from "react-icons/fa";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";
const ITEMS_PER_PAGE = 12;

const NewProducts = () => {
  const [products, setProducts] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${API_BASE}/api/trending`)
      .then((res) => res.json())
      .then((data) => {
        const items = data.products || [];

        const mapped = items.map((item) => ({
          id: item.id,
          title: item.name,
          price: item.price_numeric || 0,
          rating: item.rating || 4,
          img:
            item.img1 ||
            `${API_BASE}/static/products/default.png`,
        }));

        setProducts(mapped);
      })
      .catch((err) => {
        console.error("❌ Trending API error:", err);
      });
  }, []);

  /* ================= AUTO CHANGE ================= */
  useEffect(() => {
    if (products.length <= ITEMS_PER_PAGE) return;

    const interval = setInterval(() => {
      setStartIndex((prev) => {
        const next = prev + ITEMS_PER_PAGE;
        return next >= products.length ? 0 : next;
      });
    }, 10800000);

    return () => clearInterval(interval);
  }, [products]);

  /* ================= ADD TO CART ================= */
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
        price: item.price,
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
      console.error("ADD TO CART ERROR", err);
      alert("Backend error");
    });
  };

  /* ================= ADD TO WISHLIST ================= */
  const addToWishlist = (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login");
      return;
    }

    axios.post(
      `${API_BASE}/api/wishlist/add`,
      {
        product_id: item.id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(() => {
      alert("Added to wishlist ❤️");
    })
    .catch((err) => {
      if (err.response?.status === 409) {
        alert("Already in wishlist");
      } else {
        console.error("WISHLIST ERROR", err);
        alert("Wishlist backend error");
      }
    });
  };

  /* ================= VISIBLE PRODUCTS ================= */
  const visibleProducts = products.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <section className="trending_products bg1">
      <div className="container">

        <div className="row">
          <div className="col-xl-6 m-auto text-center">
            <div className="section_heading mb-3">
              <h4 className="premium_badge text-white">
                Trending Now
              </h4>
              <h2 className="premium_title">
                Discover what people are loving today
              </h2>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          {visibleProducts.length === 0 ? (
            <p className="text-center">Loading products...</p>
          ) : (
            visibleProducts.map((item) => (
              <div
                key={item.id}
                className="col-xl-2 col-lg-3 col-sm-6 mb-4"
              >

                <div className="mm-trending-card">

                  <span className="mm-trend-tag new">New</span>

                  <div className="mm-trending-img">
                    <img
                      src={item.img}
                      alt={item.title}
                      onError={(e) => {
                        e.target.src =
                          `${API_BASE}/static/products/default.png`;
                      }}
                    />
                  </div>

                  <div className="mm-trend-actions">

                    {/* ADD TO CART */}
                    <button onClick={() => addToCart(item)}>
                      <FaShoppingCart />
                    </button>

                    {/* 👁️ EYE ICON → shopdetails */}
                    <Link to={`/shopdetails/${item.id}`}>
                      <FaEye />
                    </Link>

                    {/* WISHLIST */}
                    <button onClick={() => addToWishlist(item)}>
                      <FaHeart />
                    </button>

                  </div>

                  <div className="mm-trending-info">
                    <h4>{item.title}</h4>

                    <div className="mm-trend-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < Math.floor(item.rating)
                              ? "active"
                              : ""
                          }
                        />
                      ))}
                    </div>

                    <div className="mm-price">
                      ₹{item.price.toFixed(2)}
                    </div>

                    {/* ✅ YOUR REQUIRED BUTTON */}
                    <Link
                      to={`/shopdetails/${item.id}`}   // ✅ FIXED
                      className="add_cart_btn"
                    >
                      View Product
                    </Link>

                  </div>

                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
};

export default NewProducts;