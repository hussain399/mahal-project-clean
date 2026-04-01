

// // // ==============================================================================================================================================
// // // backend connection
// // // ==============================================================================================================================================


// // import React, { useState, useEffect } from "react";
// // import { Link } from "react-router-dom";
// // import axios from "axios";

// // /* STATIC UI IMAGES (fallback only) */
// // import img1 from "../images/product_img_1.jpg";
// // import img2 from "../images/product_img_2.jpg";
// // import img3 from "../images/product_img_3.jpg";
// // import img4 from "../images/product_img_4.jpg";
// // import img5 from "../images/product_img_5.jpg";
// // import img6 from "../images/product_img_6.jpg";
// // import img7 from "../images/product_img_7.jpg";
// // import bannerImg from "../images/details_banner_img.png";

// // import review1 from "../images/testimonial_img_1.jpg";
// // import review2 from "../images/testimonial_img_2.jpg";
// // import review3 from "../images/testimonial_img_3.jpg";

// // /* ================= API CONSTANTS ================= */
// // const API_BASE_URL = "http://localhost:5000/api";
// // const RESTAURANT_ID = 1;

// // /* STATIC FALLBACK (page blank avvakunda) */
// // const STATIC_PRODUCT = {
// //   name: "Nestle Nescafe classic Instant",
// //   price_numeric: 10.5,
// //   old_price: 12,
// //   description:
// //     "Pellentesque habitant morbi tristique senectus et netus malesuada fames.",
// //   category: "Coffee",
// //   supplier_name: "woo-hoodie-with-logo",
// //   supplier_qty: 0,
// //   unit_of_measure: "Kg",
// // };

// // const STATIC_IMAGES = [img1, img2, img3, img4, img5, img6, img7];

// // const ProductDetails = ({ productId }) => {
// //   const [product, setProduct] = useState(STATIC_PRODUCT);
// //   const [images, setImages] = useState(STATIC_IMAGES);
// //   const [activeImg, setActiveImg] = useState(STATIC_IMAGES[0]);
// //   const [buyQty, setBuyQty] = useState(1);

// //   /* ================= FETCH PRODUCT ================= */
// //   useEffect(() => {
// //     if (!productId) return;

// //     axios
// //       .get(`${API_BASE_URL}/product/${productId}`)
// //       .then((res) => {
// //         const p = res.data.product || {};

// //         setProduct({
// //           name: p.name || STATIC_PRODUCT.name,
// //           price_numeric: Number(
// //             p.price_numeric ?? STATIC_PRODUCT.price_numeric
// //           ),
// //           old_price: STATIC_PRODUCT.old_price,
// //           description: p.description || STATIC_PRODUCT.description,
// //           category: p.category || STATIC_PRODUCT.category,
// //           supplier_name: p.supplier_name || STATIC_PRODUCT.supplier_name,
// //           supplier_qty: Number(p.stock ?? 0),
// //           unit_of_measure:
// //             p.unit_of_measure || STATIC_PRODUCT.unit_of_measure,
// //         });

// //         if (Array.isArray(p.images) && p.images.length > 0) {
// //           setImages(p.images);
// //           setActiveImg(p.images[0]);
// //         } else {
// //           setImages(STATIC_IMAGES);
// //           setActiveImg(STATIC_IMAGES[0]);
// //         }
// //       })
// //       .catch(() => {
// //         setProduct(STATIC_PRODUCT);
// //         setImages(STATIC_IMAGES);
// //         setActiveImg(STATIC_IMAGES[0]);
// //       });
// //   }, [productId]);

// //   /* ================= ADD TO CART (FINAL FIX) ================= */
// //   const addToCart = () => {
// //     axios
// //       .post(`${API_BASE_URL}/cart/add`, {
// //         restaurant_id: RESTAURANT_ID,
// //         product_id: Number(productId),
// //         quantity: buyQty,
// //         price: product.price_numeric,
// //       })
// //       .then(() => {
// //         window.location.href = "/CartView";
// //       })
// //       .catch((err) => {
// //         console.error("ADD TO CART ERROR", err);
// //         alert("Backend error");
// //       });
// //   };

// //   const STOCK = Number.isFinite(Number(product.supplier_qty))
// //     ? Number(product.supplier_qty)
// //     : 0;

// //   const PRICE = Number(product.price_numeric);

// //   return (
// //     <section className="shop_details pt_100 xs_pt_80 pb-80">
// //       <div className="container">
// //         <div className="row">

// //           {/* IMAGE + ZOOM */}
// //           <div className="col-xl-4 col-md-8 col-lg-6">
// //             <div className="product_zoom">
// //               <div className="zoom_container">
// //                 <img
// //                   src={activeImg}
// //                   alt="product"
// //                   className="zoom_image img-fluid w-100"
// //                 />
// //               </div>

// //               <div className="exzoom_nav">
// //                 {images.slice(0, 5).map((img, i) => (
// //                   <span
// //                     key={i}
// //                     className={activeImg === img ? "current" : ""}
// //                     onClick={() => setActiveImg(img)}
// //                   >
// //                     <img src={img} alt="thumb" />
// //                   </span>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>

// //           {/* PRODUCT DETAILS */}
// //           <div className="col-xl-4 col-md-10 col-lg-6">
// //             <div className="product_det_text">

// //               <h2 className="details_title">{product.name}</h2>

// //               <p className="rating">
// //                 <i className="fas fa-star"></i>
// //                 <i className="fas fa-star"></i>
// //                 <i className="fas fa-star"></i>
// //                 <i className="fas fa-star-half-alt"></i>
// //                 <i className="far fa-star"></i>
// //                 <span> Review (20)</span>
// //               </p>

// //               <p className="price">
// //                 ${PRICE.toFixed(2)} <del>${product.old_price}</del>
// //               </p>

// //               <div className="details_short_description">
// //                 <h3>Description</h3>
// //                 <p>{product.description}</p>
// //               </div>

// //               <div className="details_quentity_area">
// //                 <p>
// //                   <span>Qty Weight</span> (in {product.unit_of_measure}) :
// //                 </p>

// //                 <div className="button_area">
// //                   <button
// //                     onClick={() =>
// //                       STOCK > 0 && buyQty > 1 && setBuyQty(buyQty - 1)
// //                     }
// //                   >
// //                     –
// //                   </button>

// //                   <input
// //                     type="number"
// //                     value={buyQty}
// //                     min="1"
// //                     max={STOCK}
// //                     onChange={(e) =>
// //                       setBuyQty(Number(e.target.value))
// //                     }
// //                   />

// //                   <button
// //                     onClick={() =>
// //                       STOCK > 0 &&
// //                       buyQty < STOCK &&
// //                       setBuyQty(buyQty + 1)
// //                     }
// //                   >
// //                     +
// //                   </button>
// //                 </div>

// //                 <h3>= ${(PRICE * buyQty).toFixed(2)}</h3>
// //               </div>

// //               <div className="details_cart_btn">
// //                 <button
// //                   type="button"
// //                   className="common_btn"
// //                   disabled={STOCK === 0}
// //                   onClick={addToCart}
// //                 >
// //                   <i className="fa fa-shopping-basket"></i>
// //                   Add To Cart
// //                   <span></span>
// //                 </button>

// //                 <button className="love">
// //                   <i className="far fa-heart"></i>
// //                 </button>
// //               </div>

// //               <p className="sku">
// //                 <span>Qty:</span>{" "}
// //                 {STOCK > 0 ? `${STOCK} available` : "Out of Stock"}
// //               </p>

// //               <p className="category">
// //                 <span>Category:</span> {product.category}
// //               </p>

// //               <p className="sku">
// //                 <span>Supplier:</span> {product.supplier_name}
// //               </p>

// //               <ul className="share">
// //                 <li>Share with friends:</li>
// //                 <li>
// //                   <a href="#"><i className="fab fa-facebook-f"></i></a>
// //                 </li>
// //                 <li>
// //                   <a href="#"><i className="fab fa-twitter"></i></a>
// //                 </li>
// //                 <li>
// //                   <a href="#"><i className="fab fa-linkedin-in"></i></a>
// //                 </li>
// //                 <li>
// //                   <a href="#"><i className="fab fa-behance"></i></a>
// //                 </li>
// //               </ul>

// //             </div>
// //           </div>

// //           {/* RIGHT BANNER */}
// //           <div className="col-xl-4 d-none d-xl-block">
// //             <div className="shop_details_banner">
// //               <img
// //                 src={bannerImg}
// //                 alt="banner"
// //                 className="img-fluid w-100"
// //               />
// //               <div className="text">
// //                 <h4>Daily Offer</h4>
// //                 <h3>Fresh Organic Food Up To 65% Off</h3>
// //                 <a className="common_btn" href="#">
// //                   shop now <i className="fas fa-long-arrow-right"></i>
// //                   <span></span>
// //                 </a>
// //               </div>
// //             </div>
// //           </div>

// //         </div>

// //         {/* ================= TABS SECTION ================= */}
// //         <div className="row mt_120 xs_mt_80">
// //           <div className="col-12">
// //             <div className="shop_det_content_area">

// //               <nav>
// //                 <div className="nav nav-tabs">
// //                   <button
// //                     className="nav-link active"
// //                     data-bs-toggle="tab"
// //                     data-bs-target="#desc"
// //                   >
// //                     Description
// //                   </button>
// //                   <button
// //                     className="nav-link"
// //                     data-bs-toggle="tab"
// //                     data-bs-target="#info"
// //                   >
// //                     Information
// //                   </button>
// //                   <button
// //                     className="nav-link"
// //                     data-bs-toggle="tab"
// //                     data-bs-target="#review"
// //                   >
// //                     Reviews
// //                   </button>
// //                 </div>
// //               </nav>

// //               <div className="tab-content">

// //                 <div className="tab-pane fade show active" id="desc">
// //                   <div className="shop_det_description">
// //                     <p>{product.description}</p>
// //                     <ul>
// //                       <li>Lorem Ipsum is not simply random.</li>
// //                       <li>Contrary to popular belief.</li>
// //                     </ul>
// //                   </div>
// //                 </div>

// //                 <div className="tab-pane fade" id="info">
// //                   <div className="shop_det_additional_info">
// //                     <table>
// //                       <tbody>
// //                         <tr>
// //                           <td>Unit</td>
// //                           <td>{product.unit_of_measure}</td>
// //                         </tr>
// //                         <tr>
// //                           <td>Stock</td>
// //                           <td>{STOCK}</td>
// //                         </tr>
// //                       </tbody>
// //                     </table>
// //                   </div>
// //                 </div>

// //                 <div className="tab-pane fade" id="review">
// //                   <div className="shop_det_review_area">
// //                     {[review1, review2, review3].map((img, i) => (
// //                       <div className="single_review" key={i}>
// //                         <div className="img">
// //                           <img src={img} alt="" />
// //                         </div>
// //                         <div className="text">
// //                           <h4>
// //                             Customer <span>May 8, 2023</span>
// //                           </h4>
// //                           <p>Very good product 👍</p>
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 </div>

// //               </div>

// //             </div>
// //           </div>
// //         </div>

// //       </div>
// //     </section>
// //   );
// // };

// // export default ProductDetails;















// import React, { useState, useEffect } from "react";
// import axios from "axios";

// /* STATIC UI IMAGES (fallback only) */
// import img1 from "../images/product_img_1.jpg";
// import img2 from "../images/product_img_2.jpg";
// import img3 from "../images/product_img_3.jpg";
// import img4 from "../images/product_img_4.jpg";
// import img5 from "../images/product_img_5.jpg";
// import img6 from "../images/product_img_6.jpg";
// import img7 from "../images/product_img_7.jpg";
// import bannerImg from "../images/details_banner_img.png";

// import review1 from "../images/testimonial_img_1.jpg";
// import review2 from "../images/testimonial_img_2.jpg";
// import review3 from "../images/testimonial_img_3.jpg";

// /* ================= API CONSTANTS ================= */
// const API_BASE_URL = "http://localhost:5000/api";

// /* STATIC FALLBACK */
// const STATIC_PRODUCT = {
//   name: "Nestle Nescafe classic Instant",
//   price_numeric: 10.5,
//   old_price: 12,
//   description:
//     "Pellentesque habitant morbi tristique senectus et netus malesuada fames.",
//   category: "Coffee",
//   supplier_name: "woo-hoodie-with-logo",
//   supplier_qty: 0,
//   unit_of_measure: "Kg",
// };

// const STATIC_IMAGES = [img1, img2, img3, img4, img5, img6, img7];

// const ProductDetails = ({ productId }) => {
//   const [product, setProduct] = useState(STATIC_PRODUCT);
//   const [images, setImages] = useState(STATIC_IMAGES);
//   const [activeImg, setActiveImg] = useState(STATIC_IMAGES[0]);
//   const [buyQty, setBuyQty] = useState(1);

//   /* ================= FETCH PRODUCT ================= */
//   useEffect(() => {
//     if (!productId) return;

//     axios
//       .get(`${API_BASE_URL}/product/${productId}`)
//       .then((res) => {
//         const p = res.data.product || {};

//         setProduct({
//           name: p.name || STATIC_PRODUCT.name,
//           price_numeric: Number(p.price_numeric ?? 0),
//           old_price: STATIC_PRODUCT.old_price,
//           description: p.description || "",
//           category: p.category || "",
//           supplier_name: p.supplier_name || "",
//           supplier_qty: Number(p.stock ?? 0),
//           unit_of_measure: p.unit_of_measure || "",
//         });

//         if (Array.isArray(p.images) && p.images.length > 0) {
//           setImages(p.images);
//           setActiveImg(p.images[0]);
//         }
//       })
//       .catch(() => {
//         setProduct(STATIC_PRODUCT);
//       });
//   }, [productId]);

//   /* RESET QTY */
//   useEffect(() => {
//     setBuyQty(1);
//   }, [productId]);

//   /* SCROLL TOP */
//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }, [productId]);

//   /* ================= DERIVED VALUES ================= */
//   const STOCK = Number.isFinite(Number(product.supplier_qty))
//     ? Number(product.supplier_qty)
//     : 0;

//   const PRICE = Number(product.price_numeric);

//   /* ================= ADD TO CART ================= */
//   const addToCart = () => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       alert("Session expired. Please login again.");
//       return;
//     }

//     axios
//       .post(
//         `${API_BASE_URL}/cart/add`,
//         {
//           product_id: Number(productId),
//           quantity: buyQty,
//           price: PRICE,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       )
//       .then(() => {
//         window.location.href = "/CartView";
//       })
//       .catch((err) => {
//         console.error("ADD TO CART ERROR", err);

//         if (!err.response) {
//           alert("Server not reachable (CORS / Network issue)");
//         } else if (err.response.status === 401) {
//           alert("Session expired. Please login again.");
//         } else {
//           alert(err.response.data?.error || "Backend error");
//         }
//       });
//   };

//   /* ================= ADD TO WISHLIST ================= */
//   const addToWishlist = () => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       alert("Session expired. Please login again.");
//       return;
//     }

//     axios
//       .post(
//         `${API_BASE_URL}/wishlist/add`,
//         {
//           product_id: Number(productId),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       )
//       .then(() => {
//         alert("Added to wishlist ❤️");
//         window.location.href = "/wishlist";
//       })
//       .catch((err) => {
//         if (err.response?.status === 409) {
//           alert("Already in wishlist");
//         } else {
//           console.error("WISHLIST ERROR", err);
//           alert("Wishlist backend error");
//         }
//       });
//   };

//   return (
//     <section className="shop_details pt_100 xs_pt_80 pb-80">
//       <div className="container">
//         <div className="row">

//           {/* IMAGE + ZOOM */}
//           <div className="col-xl-4 col-md-8 col-lg-6">
//             <div className="product_zoom">
//               <div className="zoom_container">
//                 <img
//                   src={activeImg}
//                   alt="product"
//                   className="zoom_image img-fluid w-100"
//                 />
//               </div>

//               <div className="exzoom_nav">
//                 {images.slice(0, 5).map((img, i) => (
//                   <span
//                     key={i}
//                     className={activeImg === img ? "current" : ""}
//                     onClick={() => setActiveImg(img)}
//                   >
//                     <img src={img} alt="thumb" />
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* PRODUCT DETAILS */}
//           <div className="col-xl-4 col-md-10 col-lg-6">
//             <div className="product_det_text">

//               <h2 className="details_title">{product.name}</h2>

//               <p className="rating">
//                 <i className="fas fa-star"></i>
//                 <i className="fas fa-star"></i>
//                 <i className="fas fa-star"></i>
//                 <i className="fas fa-star-half-alt"></i>
//                 <i className="far fa-star"></i>
//                 <span> Review (20)</span>
//               </p>

//               <p className="price">
//                 ${PRICE.toFixed(2)} <del>${product.old_price}</del>
//               </p>

//               <div className="details_short_description">
//                 <h3>Description</h3>
//                 <p>{product.description}</p>
//               </div>

//               <div className="details_quentity_area">
//                 <p>
//                   <span>Qty Weight</span> (in {product.unit_of_measure}) :
//                 </p>

//                 <div className="button_area">
//                   <button
//                     onClick={() =>
//                       STOCK > 0 && buyQty > 1 && setBuyQty(buyQty - 1)
//                     }
//                   >
//                     –
//                   </button>

//                   <input
//                     type="number"
//                     value={buyQty}
//                     min="1"
//                     max={STOCK}
//                     onChange={(e) => setBuyQty(Number(e.target.value))}
//                   />

//                   <button
//                     onClick={() =>
//                       STOCK > 0 && buyQty < STOCK && setBuyQty(buyQty + 1)
//                     }
//                   >
//                     +
//                   </button>
//                 </div>

//                 <h3>= ${(PRICE * buyQty).toFixed(2)}</h3>
//               </div>

//               <div className="details_cart_btn">
//                 <button
//                   type="button"
//                   className="common_btn"
//                   disabled={STOCK === 0}
//                   onClick={addToCart}
//                 >
//                   <i className="fa fa-shopping-basket"></i>
//                   Add To Cart
//                   <span></span>
//                 </button>

//                 <button className="love" onClick={addToWishlist}>
//                   <i className="far fa-heart"></i>
//                 </button>
//               </div>

//               <p className="sku">
//                 <span>Qty:</span>{" "}
//                 {STOCK > 0 ? `${STOCK} available` : "Out of Stock"}
//               </p>

//               <p className="category">
//                 <span>Category:</span> {product.category}
//               </p>

//               <p className="sku">
//                 <span>Supplier:</span> {product.supplier_name}
//               </p>

//               <ul className="share">
//                 <li>Share with friends:</li>
//                 <li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
//                 <li><a href="#"><i className="fab fa-twitter"></i></a></li>
//                 <li><a href="#"><i className="fab fa-linkedin-in"></i></a></li>
//                 <li><a href="#"><i className="fab fa-behance"></i></a></li>
//               </ul>

//             </div>
//           </div>

//           {/* RIGHT BANNER */}
//           <div className="col-xl-4 d-none d-xl-block">
//             <div className="shop_details_banner">
//               <img src={bannerImg} alt="banner" className="img-fluid w-100" />
//               <div className="text">
//                 <h4>Daily Offer</h4>
//                 <h3>Fresh Organic Food Up To 65% Off</h3>
//                 <a className="common_btn" href="#">
//                   shop now <i className="fas fa-long-arrow-right"></i>
//                   <span></span>
//                 </a>
//               </div>
//             </div>
//           </div>
//            {/* ================= TABS SECTION ================= */}
//         <div className="row mt_120 xs_mt_80">
//           <div className="col-12">
//             <div className="shop_det_content_area">

//               <nav>
//                 <div className="nav nav-tabs">
//                   <button
//                     className="nav-link active"
//                     data-bs-toggle="tab"
//                     data-bs-target="#desc"
//                   >
//                     Description
//                   </button>
//                   <button
//                     className="nav-link"
//                     data-bs-toggle="tab"
//                     data-bs-target="#info"
//                   >
//                     Information
//                   </button>
//                   <button
//                     className="nav-link"
//                     data-bs-toggle="tab"
//                     data-bs-target="#review"
//                   >
//                     Reviews
//                   </button>
//                 </div>
//               </nav>

//               <div className="tab-content">

//                 <div className="tab-pane fade show active" id="desc">
//                   <div className="shop_det_description">
//                     <p>{product.description}</p>
//                     <ul>
//                       <li>Lorem Ipsum is not simply random.</li>
//                       <li>Contrary to popular belief.</li>
//                     </ul>
//                   </div>
//                 </div>

//                 <div className="tab-pane fade" id="info">
//                   <div className="shop_det_additional_info">
//                     <table>
//                       <tbody>
//                         <tr>
//                           <td>Unit</td>
//                           <td>{product.unit_of_measure}</td>
//                         </tr>
//                         <tr>
//                           <td>Stock</td>
//                           <td>{STOCK}</td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 <div className="tab-pane fade" id="review">
//                   <div className="shop_det_review_area">
//                     {[review1, review2, review3].map((img, i) => (
//                       <div className="single_review" key={i}>
//                         <div className="img">
//                           <img src={img} alt="" />
//                         </div>
//                         <div className="text">
//                           <h4>
//                             Customer <span>May 8, 2023</span>
//                           </h4>
//                           <p>Very good product 👍</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//               </div>

//             </div>
//           </div>
//         </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default ProductDetails;





// import React, { useState, useEffect } from "react";
// // import { Link } from "react-router-dom";
// import axios from "axios";

// /* STATIC UI IMAGES (fallback only) */
// import img1 from "../images/product_img_1.jpg";
// import img2 from "../images/product_img_2.jpg";
// import img3 from "../images/product_img_3.jpg";
// import img4 from "../images/product_img_4.jpg";
// import img5 from "../images/product_img_5.jpg";
// import img6 from "../images/product_img_6.jpg";
// import img7 from "../images/product_img_7.jpg";
// import bannerImg from "../images/details_banner_img.png";

// import review1 from "../images/testimonial_img_1.jpg";
// import review2 from "../images/testimonial_img_2.jpg";
// import review3 from "../images/testimonial_img_3.jpg";
// import { Link } from "react-router-dom";

// /* ================= API CONSTANTS ================= */
// const API_BASE_URL = "http://localhost:5000/api";
// const RESTAURANT_ID = 1;

// /* STATIC FALLBACK (page blank avvakunda) */
// const STATIC_PRODUCT = {
//   name: "Nestle Nescafe classic Instant",
//   price_numeric: 10.5,
//   old_price: 12,
//   description:
//     "Pellentesque habitant morbi tristique senectus et netus malesuada fames.",
//   category: "Coffee",
//   supplier_name: "woo-hoodie-with-logo",
//   supplier_qty: 0,
//   unit_of_measure: "Kg",
// };

// const STATIC_IMAGES = [img1, img2, img3, img4, img5, img6, img7];

// const ProductDetails = ({ productId }) => {
//   const [product, setProduct] = useState(STATIC_PRODUCT);
//   const [images, setImages] = useState(STATIC_IMAGES);
//   const [activeImg, setActiveImg] = useState(STATIC_IMAGES[0]);
//   const [buyQty, setBuyQty] = useState(1);

//   /* ================= FETCH PRODUCT ================= */
// /* ================= FETCH PRODUCT ================= */
// useEffect(() => {
//   if (!productId) return;

//   axios
//     .get(`${API_BASE_URL}/product/${productId}`)
//     .then((res) => {
//       const p = res.data.product || {};

//       setProduct({
//         name: p.name || STATIC_PRODUCT.name,
//         price_numeric: Number(p.price_numeric ?? 0),
//         old_price: STATIC_PRODUCT.old_price,
//         description: p.description || "",
//         category: p.category || "",
//         supplier_name: p.supplier_name || "",
//         supplier_qty: Number(p.stock ?? 0),
//         unit_of_measure: p.unit_of_measure || "",
//       });

//       if (Array.isArray(p.images) && p.images.length > 0) {
//         setImages(p.images);
//         setActiveImg(p.images[0]);
//       }
//     })
//     .catch(() => {
//       setProduct(STATIC_PRODUCT);
//     });
// }, [productId]);

// /* ✅ RESET QTY */
// useEffect(() => {
//   setBuyQty(1);
// }, [productId]);

// /* ✅ SCROLL TOP */
// useEffect(() => {
//   window.scrollTo({ top: 0, behavior: "smooth" });
// }, [productId]);


//   /* ================= ADD TO CART (FINAL FIX) ================= */
// const addToCart = () => {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     alert("Please login");
//     return;
//   }

//   axios.post(
//     `${API_BASE_URL}/cart/add`,
//     {
//       product_id: Number(productId),
//       quantity: buyQty,
//       price: product.price_numeric,
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   )
//   .then(() => {
//     window.location.href = "/cartview";
//   })
//   .catch((err) => {
//     console.error("ADD TO CART ERROR", err);
//     alert("Backend error");
//   });
// };

//   /* =================wishlist TO CART (FINAL FIX) ================= */
// const addToWishlist = () => {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     alert("Please login");
//     return;
//   }

//   axios.post(
//     `${API_BASE_URL}/wishlist/add`,
//     {
//       product_id: Number(productId),
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   )
//   .then(() => {
//     alert("Added to wishlist ❤️");
//     window.location.href = "/wishlist";
//   })
//   .catch((err) => {
//     if (err.response?.status === 409) {
//       alert("Already in wishlist");
//     } else {
//       console.error("WISHLIST ERROR", err);
//       alert("Wishlist backend error");
//     }
//   });
// };


//   const STOCK = Number.isFinite(Number(product.supplier_qty))
//     ? Number(product.supplier_qty)
//     : 0;

//   const PRICE = Number(product.price_numeric);

//   return (
//     <section className="shop_details pt_100 xs_pt_80 pb-80">
//       <div className="container">
//         <div className="row">

//           {/* IMAGE + ZOOM */}
//           <div className="col-xl-4 col-md-8 col-lg-6">
//             <div className="product_zoom">
//               <div className="zoom_container">
//                 <img
//                   src={activeImg}
//                   alt="product"
//                   className="zoom_image img-fluid w-100"
//                 />
//               </div>

//               <div className="exzoom_nav">
//                 {images.slice(0, 5).map((img, i) => (
//                   <span
//                     key={i}
//                     className={activeImg === img ? "current" : ""}
//                     onClick={() => setActiveImg(img)}
//                   >
//                     <img src={img} alt="thumb" />
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* PRODUCT DETAILS */}
//           <div className="col-xl-4 col-md-10 col-lg-6">
//             <div className="product_det_text">

//               <h2 className="details_title">{product.name}</h2>

//               <p className="rating">
//                 <i className="fas fa-star"></i>
//                 <i className="fas fa-star"></i>
//                 <i className="fas fa-star"></i>
//                 <i className="fas fa-star-half-alt"></i>
//                 <i className="far fa-star"></i>
//                 <span> Review (20)</span>
//               </p>

//               <p className="price">
//                 ${PRICE.toFixed(2)} <del>${product.old_price}</del>
//               </p>

//               <div className="details_short_description">
//                 <h3>Description</h3>
//                 <p>{product.description}</p>
//               </div>

//               <div className="details_quentity_area">
//                 <p>
//                   <span>Qty Weight</span> (in {product.unit_of_measure}) :
//                 </p>

//                 <div className="button_area">
//                   <button
//                     onClick={() =>
//                       STOCK > 0 && buyQty > 1 && setBuyQty(buyQty - 1)
//                     }
//                   >
//                     –
//                   </button>

//                   <input
//                     type="number"
//                     value={buyQty}
//                     min="1"
//                     max={STOCK}
//                     onChange={(e) =>
//                       setBuyQty(Number(e.target.value))
//                     }
//                   />

//                   <button
//                     onClick={() =>
//                       STOCK > 0 &&
//                       buyQty < STOCK &&
//                       setBuyQty(buyQty + 1)
//                     }
//                   >
//                     +
//                   </button>
//                 </div>

//                 <h3>= ${(PRICE * buyQty).toFixed(2)}</h3>
//               </div>

//               <div className="details_cart_btn">
//                 <button
//                   type="button"
//                   className="common_btn"
//                   disabled={STOCK === 0}
//                   onClick={addToCart}
//                 >
//                   <i className="fa fa-shopping-basket"></i>
//                   Add To Cart
//                   <span></span>
//                 </button>

//                 <button className="love" onClick={addToWishlist}>
//                   <i className="far fa-heart"></i>
//                 </button>

//               </div>

//               <p className="sku">
//                 <span>Qty:</span>{" "}
//                 {STOCK > 0 ? `${STOCK} available` : "Out of Stock"}
//               </p>

//               <p className="category">
//                 <span>Category:</span> {product.category}
//               </p>

//               <p className="sku">
//                 <span>Supplier:</span> {product.supplier_name}
//               </p>

//               <ul className="share">
//                 <li>Share with friends:</li>
//                 <li>
//                   <a href="#"><i className="fab fa-facebook-f"></i></a>
//                 </li>
//                 <li>
//                   <a href="#"><i className="fab fa-twitter"></i></a>
//                 </li>
//                 <li>
//                   <a href="#"><i className="fab fa-linkedin-in"></i></a>
//                 </li>
//                 <li>
//                   <a href="#"><i className="fab fa-behance"></i></a>
//                 </li>
//               </ul>

//             </div>
//           </div>

//           {/* RIGHT BANNER */}
//           <div className="col-xl-4 d-none d-xl-block">
//             <div className="shop_details_banner">
//               <img
//                 src={bannerImg}
//                 alt="banner"
//                 className="img-fluid w-100"
//               />
//               <div className="text">
//                 <h4>Daily Offer</h4>
//                 <h3>Fresh Organic Food Up To 65% Off</h3>
//                 <Link className="common_btn" to="/CategorieList">
//                   shop now <i className="fas fa-long-arrow-right"></i>
//                   <span></span>
//                 </Link>
//               </div>
//             </div>
//           </div>

//         </div>

//         {/* ================= TABS SECTION ================= */}
//         <div className="row mt_120 xs_mt_80">
//           <div className="col-12">
//             <div className="shop_det_content_area">

//               <nav>
//                 <div className="nav nav-tabs">
//                   <button
//                     className="nav-link active"
//                     data-bs-toggle="tab"
//                     data-bs-target="#desc"
//                   >
//                     Description
//                   </button>
//                   <button
//                     className="nav-link"
//                     data-bs-toggle="tab"
//                     data-bs-target="#info"
//                   >
//                     Information
//                   </button>
//                   <button
//                     className="nav-link"
//                     data-bs-toggle="tab"
//                     data-bs-target="#review"
//                   >
//                     Reviews
//                   </button>
//                 </div>
//               </nav>

//               <div className="tab-content">

//                 <div className="tab-pane fade show active" id="desc">
//                   <div className="shop_det_description">
//                     <p>{product.description}</p>
//                     <ul>
//                       <li>Lorem Ipsum is not simply random.</li>
//                       <li>Contrary to popular belief.</li>
//                     </ul>
//                   </div>
//                 </div>

//                 <div className="tab-pane fade" id="info">
//                   <div className="shop_det_additional_info">
//                     <table>
//                       <tbody>
//                         <tr>
//                           <td>Unit</td>
//                           <td>{product.unit_of_measure}</td>
//                         </tr>
//                         <tr>
//                           <td>Stock</td>
//                           <td>{STOCK}</td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 <div className="tab-pane fade" id="review">
//                   <div className="shop_det_review_area">
//                     {[review1, review2, review3].map((img, i) => (
//                       <div className="single_review" key={i}>
//                         <div className="img">
//                           <img src={img} alt="" />
//                         </div>
//                         <div className="text">
//                           <h4>
//                             Customer <span>May 8, 2023</span>
//                           </h4>
//                           <p>Very good product 👍</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//               </div>

//             </div>
//           </div>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default ProductDetails;


import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import axios from "axios";

/* STATIC UI IMAGES (fallback only) */
import img1 from "../images/product_img_1.jpg";
import img2 from "../images/product_img_2.jpg";
import img3 from "../images/product_img_3.jpg";
import img4 from "../images/product_img_4.jpg";
import img5 from "../images/product_img_5.jpg";
import img6 from "../images/product_img_6.jpg";
import img7 from "../images/product_img_7.jpg";
import bannerImg from "../images/details_banner_img.png";

import review1 from "../images/testimonial_img_1.jpg";
import review2 from "../images/testimonial_img_2.jpg";
import review3 from "../images/testimonial_img_3.jpg";
import { Link } from "react-router-dom";

/* ================= API CONSTANTS ================= */
const API_BASE_URL = "http://localhost:5000/api";
const RESTAURANT_ID = 1;

/* STATIC FALLBACK (page blank avvakunda) */
const STATIC_PRODUCT = {
  name: "Nestle Nescafe classic Instant",
  price_numeric: 10.5,
  old_price: 12,
  description:
    "Pellentesque habitant morbi tristique senectus et netus malesuada fames.",
  category: "Coffee",
  supplier_name: "woo-hoodie-with-logo",
  supplier_qty: 0,
  unit_of_measure: "Kg",
};

const STATIC_IMAGES = [img1, img2, img3, img4, img5, img6, img7];

const ProductDetails = ({ productId }) => {
  const [product, setProduct] = useState(STATIC_PRODUCT);
  const [images, setImages] = useState(STATIC_IMAGES);
  const [activeImg, setActiveImg] = useState(STATIC_IMAGES[0]);
  const [buyQty, setBuyQty] = useState(1);
  const [productReviews, setProductReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);


  /* ================= FETCH PRODUCT REVIEWS ================= */
  useEffect(() => {
    if (!productId) return;

    axios
      .get(`${API_BASE_URL}/reviews/product/${productId}`)
      .then((res) => {
        const reviews = res.data || [];
        setProductReviews(reviews);

        // ⭐ Calculate average rating
        if (reviews.length > 0) {
          const total = reviews.reduce((sum, r) => sum + r.rating, 0);
          setAvgRating((total / reviews.length).toFixed(1));
        } else {
          setAvgRating(0);
        }
      })
      .catch(() => {
        setProductReviews([]);
        setAvgRating(0);
      });
  }, [productId]);

  /* ⭐ STAR RENDER FUNCTION */
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating); // filled
    const emptyStars = 5 - fullStars;     // remaining empty

    return (
      <>
        {/* Filled Stars */}
        {"⭐".repeat(fullStars)}

        {/* Empty Stars */}
        {"☆".repeat(emptyStars)}
      </>
    );
  };


  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    if (!productId) return;

    axios
      .get(`${API_BASE_URL}/product/${productId}`)
      .then((res) => {
        const p = res.data.product || {};

        setProduct({
          name: p.name || STATIC_PRODUCT.name,
          price_numeric: Number(p.price_numeric ?? 0),
          discounted_price: Number(p.discounted_price ?? 0),

          has_offer: p.has_offer ?? false,
          offer_label: p.offer_label ?? null,
          original_price: p.original_price ?? null,
          offer: p.offer || null,
          old_price: STATIC_PRODUCT.old_price,
          description: p.description || "",
          category: p.category || "",
          supplier_name: p.supplier_name || "",
          supplier_qty: Number(p.stock ?? 0),
          unit_of_measure: p.unit_of_measure || "",
          country_of_origin: p.country_of_origin || "",
        });

        if (Array.isArray(p.images) && p.images.length > 0) {
          setImages(p.images);
          setActiveImg(p.images[0]);
        }
      })
      .catch(() => {
        setProduct(STATIC_PRODUCT);
      });
  }, [productId]);

  /* ✅ RESET QTY */
  useEffect(() => {
    setBuyQty(1);
  }, [productId]);

  /* ✅ SCROLL TOP */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);


  /* ================= ADD TO CART (FINAL FIX) ================= */
  const addToCart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login");
      return;
    }

    axios.post(
      `${API_BASE_URL}/cart/add`,
      {
        product_id: Number(productId),
        quantity: buyQty,
        price: product.price_numeric,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(() => {
        window.location.href = "/cartview";
      })
      .catch((err) => {
        console.error("ADD TO CART ERROR", err);
        alert("Backend error");
      });
  };

  /* =================wishlist TO CART (FINAL FIX) ================= */
  const addToWishlist = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login");
      return;
    }

    axios.post(
      `${API_BASE_URL}/wishlist/add`,
      {
        product_id: Number(productId),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(() => {
        alert("Added to wishlist ❤️");
        window.location.href = "/wishlist";
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


  const STOCK = Number.isFinite(Number(product.supplier_qty))
    ? Number(product.supplier_qty)
    : 0;

  const PRICE = Number(product.price_numeric);

  return (
    <section className="shop_details pt_100 xs_pt_80 pb-80">
      <div className="container">
        <div className="row">

          {/* IMAGE + ZOOM */}
          <div className="col-xl-4 col-md-8 col-lg-6">
            <div className="product_zoom">
              <div className="zoom_container">
                <img
                  src={activeImg}
                  alt="product"
                  className="zoom_image img-fluid w-100"
                />
              </div>

              <div className="exzoom_nav">
                {images.slice(0, 5).map((img, i) => (
                  <span
                    key={i}
                    className={activeImg === img ? "current" : ""}
                    onClick={() => setActiveImg(img)}
                  >
                    <img src={img} alt="thumb" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="col-xl-4 col-md-10 col-lg-6">
            <div className="product_det_text">

              <h2 className="details_title">{product.name}</h2>

              <p className="rating">
                {renderStars(avgRating)}
                <span style={{ marginLeft: "8px" }}>
                  {avgRating} / 5 ({productReviews.length} Reviews)
                </span>
              </p>


              <p className="price">
                QAR {PRICE.toFixed(2)} <del>QAR{product.old_price}</del>
              </p>

              <div className="details_short_description">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>

              <div className="details_quentity_area">
                <p>
                  <span>Qty Weight</span> (in {product.unit_of_measure}) :
                </p>

                <div className="button_area">
                  <button
                    onClick={() =>
                      STOCK > 0 && buyQty > 1 && setBuyQty(buyQty - 1)
                    }
                  >
                    –
                  </button>

                  <input
                    type="number"
                    value={buyQty}
                    min="1"
                    max={STOCK}
                    onChange={(e) =>
                      setBuyQty(Number(e.target.value))
                    }
                  />

                  <button
                    onClick={() =>
                      STOCK > 0 &&
                      buyQty < STOCK &&
                      setBuyQty(buyQty + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <h3>= QAR {(PRICE * buyQty).toFixed(2)}</h3>
              </div>

              <div className="details_cart_btn">
                <button
                  type="button"
                  className="common_btn"
                  // disabled={STOCK === 0}
                  onClick={addToCart}
                >
                  <i className="fa fa-shopping-basket"></i>
                  Add To Cart
                  <span></span>
                </button>

                <button className="love" onClick={addToWishlist}>
                  <i className="far fa-heart"></i>
                </button>

              </div>

              <p className="sku">
                <span>Qty:</span>{" "}
                {STOCK > 0 ? `${STOCK} available` : "Out of Stock"}
              </p>

              <p className="category">
                <span>Category:</span> {product.category}
              </p>

              <p className="sku">
                <span>Supplier:</span> {product.supplier_name}
              </p>

              <p className="sku">
                <span>Country of Origin:</span> {product.country_of_origin || "-"}
              </p>


              <ul className="share">
                <li>Share with friends:</li>
                <li>
                  <a href="#"><i className="fab fa-facebook-f"></i></a>
                </li>
                <li>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                </li>
                <li>
                  <a href="#"><i className="fab fa-linkedin-in"></i></a>
                </li>
                <li>
                  <a href="#"><i className="fab fa-behance"></i></a>
                </li>
              </ul>

            </div>
          </div>

          {/* RIGHT BANNER */}
          <div className="col-xl-4 d-none d-xl-block">
            <div className="shop_details_banner">
              <img
                src={bannerImg}
                alt="banner"
                className="img-fluid w-100"
              />
              <div className="text">
                <h4>Daily Offer</h4>
                <h3>Fresh Organic Food Up To 65% Off</h3>
                <Link className="common_btn" to="/CategorieList">
                  shop now <i className="fas fa-long-arrow-right"></i>
                  <span></span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* ================= TABS SECTION ================= */}
        <div className="row mt_120 xs_mt_80">
          <div className="col-12">
            <div className="shop_det_content_area">

              <nav>
                <div className="nav nav-tabs">
                  <button
                    className="nav-link active"
                    data-bs-toggle="tab"
                    data-bs-target="#desc"
                  >
                    Description
                  </button>
                  <button
                    className="nav-link"
                    data-bs-toggle="tab"
                    data-bs-target="#info"
                  >
                    Information
                  </button>
                  <button
                    className="nav-link"
                    data-bs-toggle="tab"
                    data-bs-target="#review"
                  >
                    Reviews
                  </button>
                </div>
              </nav>

              <div className="tab-content">

                <div className="tab-pane fade show active" id="desc">
                  <div className="shop_det_description">
                    <p>{product.description}</p>
                    <ul>
                      <li>Lorem Ipsum is not simply random.</li>
                      <li>Contrary to popular belief.</li>
                    </ul>
                  </div>
                </div>

                <div className="tab-pane fade" id="info">
                  <div className="shop_det_additional_info">
                    <table>
                      <tbody>
                        <tr>
                          <td>Unit</td>
                          <td>{product.unit_of_measure}</td>
                        </tr>
                        <tr>
                          <td>Stock</td>
                          <td>{STOCK}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="tab-pane fade" id="review">
                  <div className="shop_det_review_area">

                    {productReviews.length === 0 && (
                      <p>No reviews submitted yet.</p>
                    )}

                    {productReviews.map((r) => (
                      <div className="single_review" key={r.review_id}>

                        {/* Review Image */}
                        <div className="img">
                          <img
                            src={`${API_BASE_URL}/reviews/image/${r.review_id}`}
                            alt="review"
                            style={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "10px",
                              objectFit: "cover",
                            }}
                          />
                        </div>

                        {/* Review Text */}
                        <div className="text">
                          <h4>
                            Restaurant #{r.restaurant_id}
                            <span>
                              {" "}
                              {new Date(r.created_at).toLocaleDateString()}
                            </span>
                          </h4>

                          <p>
                            {"⭐".repeat(r.rating)}
                          </p>

                          <p>{r.review_text || "No comment given."}</p>
                        </div>

                      </div>
                    ))}

                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProductDetails;