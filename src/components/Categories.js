// import React, { useState, useMemo, useEffect, useContext } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { LocationContext } from "../pages/LocationContext";
// import axios from "axios";




// /* ---------- STATIC FRONTEND IMAGES (fallback only) ---------- */
// import img1 from "../images/product_img_1.jpg";
// import img2 from "../images/product_img_2.jpg";
// import img4 from "../images/product_img_4.jpg";
// import img6 from "../images/product_img_6.jpg";
// import img8 from "../images/product_img_8.jpg";

// const STATIC_IMAGES = [img1, img2, img4, img6, img8];

// /* ---------------- CONSTANTS ---------------- */
// const PRICE_MIN = 0;
// const PRICE_LIMIT_DEFAULT = 1000;
// const ITEMS_PER_PAGE = 12;

// const Categories = () => {
//   const location = useLocation();
//   const { locationName } = useContext(LocationContext);
//   const [stores, setStores] = useState([]);
// const [selectedStore, setSelectedStore] = useState("");


//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState(["All"]);
//   const [vendors, setVendors] = useState([]);

//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All");
//   const [sizes, setSizes] = useState([]);
//   const [vendorFilters, setVendorFilters] = useState([]);

//   const [minPrice, setMinPrice] = useState(PRICE_MIN);
//   const [maxPrice, setMaxPrice] = useState(PRICE_LIMIT_DEFAULT);
//   const [priceLimit, setPriceLimit] = useState(PRICE_LIMIT_DEFAULT);

//   const [sortBy, setSortBy] = useState("default");

//   /* ---------- PAGINATION ---------- */
//   const [currentPage, setCurrentPage] = useState(1);

//   /* ---------- FETCH DATA FROM BACKEND ---------- */
//   useEffect(() => {
//     const TOKEN = localStorage.getItem("token"); // 🔑 Add JWT token

//     axios
//       .get("http://127.0.0.1:5000/api/gridlist", {
//         headers: {
//           "Authorization": `Bearer ${TOKEN}`  // 🔑 Send token for auth
//         }
//       })
//       .then((res) => {
//         const data = res.data || {};

//         setProducts(data.products || []);
//         setCategories(["All", ...(data.categories || [])]);
//         setVendors(data.suppliers || []);

//         const serverMax = Number(
//           data.filters?.price_max || PRICE_LIMIT_DEFAULT
//         );
//         setPriceLimit(serverMax);
//         setMaxPrice(serverMax);
//       })
//       .catch((err) => console.error("Gridlist API Error:", err));
//   }, []);

//   /* ---------- FETCH RESTAURANT STORES ---------- */
// useEffect(() => {
//   const TOKEN = localStorage.getItem("token");

//   // TEMP: using static restaurant_id
//   const restaurantId = 7;

//   axios
//     .get(
//       `http://127.0.0.1:5000/api/restaurant/stores?restaurant_id=${restaurantId}`,
//       {
//         headers: { Authorization: `Bearer ${TOKEN}` },
//       }
//     )
//     .then((res) => {
//       setStores(res.data || []);
//     })
//     .catch((err) => console.log("Store fetch error", err));
// }, []);


// useEffect(() => {
//   const params = new URLSearchParams(location.search);
//   const searchQuery = params.get("search");

//   if (searchQuery) {
//     setSearch(searchQuery);
//   }
// }, [location.search]);

//   /* ---------- IMAGE HANDLER (Backend → else Static) ---------- */
//   const getProductImage = (product, index) => {
//     if (product?.images && product.images.length > 0) {
//       return product.images[0]; // backend image
//     }
//     return STATIC_IMAGES[index % STATIC_IMAGES.length]; // fallback static
//   };

//   /* ---------- FILTER LOGIC ---------- */
//   const filteredProducts = useMemo(() => {
//     let data = [...products];
//     if (selectedStore)
//   data = data.filter((p) => p.city === selectedStore);


//     if (search)
//       data = data.filter((p) =>
//         p.name?.toLowerCase().includes(search.toLowerCase())
//       );

//     if (category !== "All")
//       data = data.filter((p) => p.category === category);

//     if (sizes.length > 0)
//       data = data.filter((p) =>
//         sizes.some((s) =>
//           (p.unit_of_measure || "")
//             .toLowerCase()
//             .includes(s.toLowerCase())
//         )
//       );

//     if (vendorFilters.length > 0)
//       data = data.filter((p) =>
//         vendorFilters.includes(p.supplier_id)
//       );

//     data = data.filter(
//       (p) =>
//         Number(p.price_numeric || 0) >= minPrice &&
//         Number(p.price_numeric || 0) <= maxPrice
//     );

//     if (sortBy === "price_low")
//       data.sort((a, b) => a.price_numeric - b.price_numeric);

//     if (sortBy === "price_high")
//       data.sort((a, b) => b.price_numeric - a.price_numeric);

//     if (sortBy === "rating")
//       data.sort((a, b) => (b.rating || 0) - (a.rating || 0));

//     return data;
// }, [
//   products,
//   search,
//   category,
//   sizes,
//   vendorFilters,
//   minPrice,
//   maxPrice,
//   sortBy,
//   selectedStore
// ]);


//   /* ---------- RESET PAGE WHEN FILTER CHANGES ---------- */
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search, category, sizes, vendorFilters, sortBy, minPrice, maxPrice]);

//   /* ---------- PAGINATION ---------- */
//   const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     const end = start + ITEMS_PER_PAGE;
//     return filteredProducts.slice(start, end);
//   }, [filteredProducts, currentPage]);

//   /* ---------- HELPERS ---------- */
//   const toggleItem = (val, list, setList) => {
//     setList((prev) =>
//       prev.includes(val)
//         ? prev.filter((x) => x !== val)
//         : [...prev, val]
//     );
//   };

//   const resetFilters = () => {
//     setSearch("");
//     setCategory("All");
//     setSizes([]);
//     setVendorFilters([]);
//     setMinPrice(PRICE_MIN);
//     setMaxPrice(priceLimit);
//     setSortBy("default");
//     setCurrentPage(1);
//   };

//   return (
//     <section className="shop_page pt_100 pb-80 pb_80">
//       <div className="">
//         <div className="row">

//           {/* ================= SIDEBAR (UNCHANGED UI) ================= */}
//           <div className="col-lg-3">
//             <div className="shop_sidebar filter_card">

//               {/* SEARCH */}
// <div className="shop_sidebar_item mb_30">
//   <small>Select Store Address</small>

//   <select
//     className="filter_input"
//     value={selectedStore}
//     onChange={(e) => setSelectedStore(e.target.value)}
//   >
//     <option value="">Select store</option>

//     {stores.map((s) => (
//       <option key={s.store_id} value={s.city}>
//         {s.store_name_english} — {s.city}
//       </option>
//     ))}
//   </select>
// </div>



//               {/* CATEGORY */}
//               <div className="shop_sidebar_item mb_30">
//                 <h4 className="filter_title">Categories</h4>
//                 <div className="filter_group">
//                   {categories.map((c) => (
//                     <label key={c} className="filter_option">
//                       <input
//                         type="radio"
//                         name="category"
//                         checked={category === c}
//                         onChange={() => setCategory(c)}
//                       />
//                       <span>{c}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* SIZE */}
//               <div className="shop_sidebar_item mb_30">
//                 <h4 className="filter_title">Size</h4>
//                 <div className="filter_group">
//                   {["kg","ltr","box","piece","1kg","5kg","10kg"].map((s) => (
//                     <label key={s} className="filter_option">
//                       <input
//                         type="checkbox"
//                         checked={sizes.includes(s)}
//                         onChange={() =>
//                           toggleItem(s, sizes, setSizes)
//                         }
//                       />
//                       <span>{s}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* VENDOR */}
//               <div className="shop_sidebar_item mb_30">
//                 <h4 className="filter_title">Filter by Vendor</h4>
//                 <div className="filter_group">
//                   {vendors.map((v) => (
//                     <label key={v.supplier_id} className="filter_option">
//                       <input
//                         type="checkbox"
//                         checked={vendorFilters.includes(v.supplier_id)}
//                         onChange={() =>
//                           toggleItem(
//                             v.supplier_id,
//                             vendorFilters,
//                             setVendorFilters
//                           )
//                         }
//                       />
//                       <span>{v.company_name_english}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* PRICE */}
//               <div className="shop_sidebar_item mb_30">
//                 <h4 className="filter_title">Price</h4>

//                 <div className="range_slider">
//                   <div
//                     className="range_progress"
//                     style={{
//                       left: `${(minPrice / priceLimit) * 100}%`,
//                       right: `${100 - (maxPrice / priceLimit) * 100}%`,
//                     }}
//                   />

//                   <input
//                     type="range"
//                     min={PRICE_MIN}
//                     max={priceLimit}
//                     value={minPrice}
//                     onChange={(e) => {
//                       const val = Number(e.target.value);
//                       if (val < maxPrice) setMinPrice(val);
//                     }}
//                   />

//                   <input
//                     type="range"
//                     min={PRICE_MIN}
//                     max={priceLimit}
//                     value={maxPrice}
//                     onChange={(e) => {
//                       const val = Number(e.target.value);
//                       if (val > minPrice) setMaxPrice(val);
//                     }}
//                   />
//                 </div>

//                 <div className="price_values">
//                   <span>₹{minPrice}</span>
//                   <span>₹{maxPrice}</span>
//                 </div>
//               </div>

//               <button className="reset_btn" onClick={resetFilters}>
//                 Reset Filters
//               </button>

//             </div>
//           </div>

//           {/* ================= PRODUCTS ================= */}
//           <div className="col-lg-9">
//             <div className="shop_header d-flex justify-content-between mb-4">
//               <p>
//                 Showing <b>{paginatedProducts.length}</b> of{" "}
//                 <b>{filteredProducts.length}</b> results
//               </p>

//               <select
//                 className="form-select w-auto"
//                 onChange={(e) => setSortBy(e.target.value)}
//               >
//                 <option value="default">Default</option>
//                 <option value="price_low">Price: Low → High</option>
//                 <option value="price_high">Price: High → Low</option>
//                 <option value="rating">Best Rating</option>
//               </select>
//             </div>

//             <div className="row g-4">
//               {paginatedProducts.map((p, i) => (
//                 // <div className="col-xl-4 col-sm-6" key={p.id}>
//                 <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6" key={p.id}>
//                   <div className="product_card">

//                     <div className="product_img">
//                       <img src={getProductImage(p, i)} alt={p.name} />
//                       <div className="hover_icons">
//                         <button><i className="far fa-eye"></i></button>
//                         <button><i className="far fa-heart"></i></button>
//                       </div>
//                     </div>

//                     <div className="product_text">
//                       <h4>{p.name}</h4>
//                       <p>
//                         ₹{p.price_numeric}
//                         <del> ₹{(p.price_numeric + 5).toFixed(2)}</del>
//                       </p>

//                       <Link
//                         to={`/ShopDetails/${p.id}`}
//                         className="add_cart_btn"
//                       >
//                         View Product
//                       </Link>
//                     </div>

//                   </div>
//                 </div>
//               ))}

//               {paginatedProducts.length === 0 && (
//                 <p className="text-center mt-5">No products found 😢</p>
//               )}
//             </div>

//             {/* PAGINATION — unchanged UI */}
//             <div className="pagination mt_60">
//                 <ul className="pagination justify-content-center">

//                   {/* Prev */}
//                   <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//                     <button
//                       className="page-link"
//                       onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
//                     >
//                       <i className="fa fa-angle-double-left"></i>
//                     </button>
//                   </li>

//                   {/* Page Numbers */}
//                   {[...Array(totalPages)].map((_, i) => (
//                     <li key={i} className="page-item">
//                       <button
//                         className={`page-link ${currentPage === i + 1 ? "active" : ""}`}
//                         onClick={() => setCurrentPage(i + 1)}
//                       >
//                         {i + 1}
//                       </button>
//                     </li>
//                   ))}

//                   {/* Next */}
//                   <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
//                     <button
//                       className="page-link"
//                       onClick={() =>
//                         currentPage < totalPages && setCurrentPage(currentPage + 1)
//                       }
//                     >
//                       <i className="fa fa-angle-double-right"></i>
//                     </button>
//                   </li>

//                 </ul>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default Categories;



import React, { useState, useMemo, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { LocationContext } from "../pages/LocationContext";
import { useParams } from "react-router-dom";
import axios from "axios";




/* ---------- STATIC FRONTEND IMAGES (fallback only) ---------- */
import img1 from "../images/product_img_1.jpg";
import img2 from "../images/product_img_2.jpg";
import img4 from "../images/product_img_4.jpg";
import img6 from "../images/product_img_6.jpg";
import img8 from "../images/product_img_8.jpg";

const STATIC_IMAGES = [img1, img2, img4, img6, img8];

const PRICE_MIN = 0;
const ITEMS_PER_PAGE = 12;
const API_BASE_URL = "http://127.0.0.1:5000/api";

const Categories = () => {
  const location = useLocation();
  const { locationName } = useContext(LocationContext);

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [vendors, setVendors] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sizes, setSizes] = useState([]);
  const [vendorFilters, setVendorFilters] = useState([]);

  const [minPrice, setMinPrice] = useState(PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(0);
  const [priceLimit, setPriceLimit] = useState(0);

  const [sortBy, setSortBy] = useState("default");
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const { promotionId } = useParams();

  const [currentPage, setCurrentPage] = useState(1);
  const getPrice = (p) => {
    return Number(
      String(p.price_numeric || p.price || 0).replace(/[^\d.]/g, "")
    );
  };
  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {

    const TOKEN = localStorage.getItem("token");

    // ===============================
    // PROMOTION MODE
    // ===============================
    if (promotionId) {

      axios
        .get(`${API_BASE_URL}/admin/promotions/promotion-products/${promotionId}`)
        .then((res) => {

          const promoProducts = res.data || [];

          setProducts(promoProducts);

          // keep UI intact but minimal filters
          setCategories(["All"]);
          setVendors([]);

          setMinPrice(PRICE_MIN);
          setMaxPrice(1000);
          setPriceLimit(1000);

        })
        .catch((err) => console.error("Promotion API Error:", err));

      return; // 🚨 IMPORTANT: stop normal flow
    }

    // ===============================
    // NORMAL GRIDLIST (UNCHANGED)
    // ===============================

    axios
      .get(`${API_BASE_URL}/gridlist`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      })
      .then((res) => {

        const data = res.data || {};
        const productList = data.products || [];
        const suppliersList = data.suppliers || [];

        setVendors(suppliersList);

        const userCity = selectedStore || locationName || "";

        const updatedProducts = productList.map((p) => {

          const supplier = suppliersList.find(
            (s) => String(s.supplier_id) === String(p.supplier_id)
          );

          const supplierCity = supplier?.city || "";

          const isNearby =
            supplierCity.toLowerCase().trim() ===
            userCity.toLowerCase().trim();

          const deliveryTime = isNearby
            ? Math.floor(Math.random() * 40) + 10
            : null;

          return {
            ...p,
            verified: supplier?.verified ?? true,
            deliveryTime,
            sameDay: deliveryTime && deliveryTime < 20,
          };

        });

        setProducts(updatedProducts);
        setCategories(["All", ...(data.categories || [])]);

        if (updatedProducts.length > 0) {

          const prices = updatedProducts.map((p) =>
            Number(p.price_numeric || p.price || 0)
          );

          const min = Math.min(...prices);
          const max = Math.max(...prices);

          setMinPrice(min);
          setMaxPrice(max);
          setPriceLimit(max);
        }

      })
      .catch((err) => console.error("Gridlist API Error:", err));

  }, [selectedStore, locationName, promotionId]);
  /* ================= FETCH STORES ================= */
  useEffect(() => {
    const TOKEN = localStorage.getItem("token");
    const restaurantId = localStorage.getItem("linked_id");
    if (!restaurantId) return;

    axios
      .get(`${API_BASE_URL}/restaurant/store/${restaurantId}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      })
      .then((res) => {
        if (res.data?.data) {
          setStores([res.data.data]);
        }
      })
      .catch((err) => console.log("Store fetch error", err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const supplierQuery = params.get("supplier");

    if (supplierQuery && vendors.length > 0) {
      const match = vendors.find(
        (v) => String(v.supplier_id) === String(supplierQuery)
      );

      if (match) {
        setVendorFilters([String(match.supplier_id)]);
      }
    }
  }, [location.search, vendors]);
  /* ================= URL SUPPORT ================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search");
    const categoryQuery = params.get("category");

    if (searchQuery) setSearch(searchQuery);
    if (categoryQuery) setCategory(categoryQuery);
  }, [location.search]);

  /* ================= DYNAMIC SIZES ================= */
  const SIZES = useMemo(() => {
    const unique = new Set();
    products.forEach((p) => {
      if (p.unit_of_measure) {
        unique.add(p.unit_of_measure.trim());
      }
    });
    return Array.from(unique);
  }, [products]);

  /* ================= FILTER LOGIC ================= */
  const filteredProducts = useMemo(() => {
    let data = [...products];

    if (selectedStore)
      data = data.filter(
        (p) =>
          p.store_id === selectedStore ||
          p.city === selectedStore
      );

    if (search)
      data = data.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      );

    if (category !== "All") {
      data = data.filter((p) =>
        (p.category || "")
          .toLowerCase()
          .trim()
          .includes(category.toLowerCase().trim())
      );
    }

    if (sizes.length > 0)
      data = data.filter((p) =>
        sizes.includes(p.unit_of_measure)
      );

    if (vendorFilters.length > 0)
      data = data.filter((p) =>
        vendorFilters.includes(String(p.supplier_id))
      );

    if (sameDayOnly)
      data = data.filter((p) => Boolean(p.sameDay));

    if (verifiedOnly)
      data = data.filter((p) => Boolean(p.verified));

    data = data.filter((p) => {
      const price = Number(
        String(p.price_numeric || p.price || 0).replace(/[^\d.]/g, "")
      );
      return price >= minPrice && price <= maxPrice;
    });

    if (sortBy === "price_low")
      data.sort(
        (a, b) =>
          Number(a.price_numeric || a.price || 0) -
          Number(b.price_numeric || b.price || 0)
      );

    if (sortBy === "price_high")
      data.sort(
        (a, b) =>
          Number(b.price_numeric || b.price || 0) -
          Number(a.price_numeric || a.price || 0)
      );

    if (sortBy === "rating")
      data.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );

    return data;
  }, [
    products,
    search,
    category,
    sizes,
    vendorFilters,
    minPrice,
    maxPrice,
    sortBy,
    selectedStore,
    sameDayOnly,
    verifiedOnly
  ]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const toggleItem = (val, list, setList) => {
    setList((prev) =>
      prev.includes(val)
        ? prev.filter((x) => x !== val)
        : [...prev, val]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setSizes([]);
    setVendorFilters([]);
    setSameDayOnly(false);
    setVerifiedOnly(false);
    setMinPrice(PRICE_MIN);
    setMaxPrice(priceLimit);
    setSortBy("default");
    setCurrentPage(1);
  };

  return (

    <section className="shop_page mt-5 pb-80 pb_80">

      <div className="container-fluid pl-20 pr-20">

        <div className="row">

          {/* ================= SIDEBAR ================= */}
          <div className="col-lg-2 sidebar_col">

            <div className="shop_sidebar filter_card">

              {/* SEARCH */}
              <div className="shop_sidebar_item mb_30">
                <input
                  className="filter_input"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* CATEGORY */}
              <div className="shop_sidebar_item mb_30">
                <h4 className="filter_title">Categories</h4>
                {categories.map((c) => (
                  <label key={c} className="filter_option">
                    <input
                      type="radio"
                      checked={category === c}
                      onChange={() => setCategory(c)}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>

              {/* SIZE */}
              <div className="shop_sidebar_item mb_30">
                <h4 className="filter_title">Size</h4>
                {SIZES.map((s) => (
                  <label key={s} className="filter_option">
                    <input
                      type="checkbox"
                      checked={sizes.includes(s)}
                      onChange={() => toggleItem(s, sizes, setSizes)}
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>

              {/* PRICE RANGE */}
              <div className="shop_sidebar_item mb_30">
                <h4 className="filter_title">Price Range</h4>

                <div className="price_slider_container">
                  <div className="slider_track"></div>

                  <div
                    className="slider_range"
                    style={{
                      left: `${(minPrice / priceLimit) * 100}%`,
                      width: `${((maxPrice - minPrice) / priceLimit) * 100}%`,
                    }}
                  ></div>

                  {/* MIN */}
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={priceLimit}
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(Math.min(Number(e.target.value), maxPrice - 1))
                    }
                    className="range_input"
                  />

                  {/* MAX */}
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={priceLimit}
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(Math.max(Number(e.target.value), minPrice + 1))
                    }
                    className="range_input"
                  />
                </div>

                <div className="price_display">
                  ₹{minPrice} — ₹{maxPrice}
                </div>
              </div>




              {/* VENDOR */}
              <div className="shop_sidebar_item mb_30">
                <h4 className="filter_title">Filter by Vendor</h4>
                {vendors.map((v) => (
                  <label key={v.supplier_id} className="filter_option">
                    <input
                      type="checkbox"
                      checked={vendorFilters.includes(String(v.supplier_id))}
                      onChange={() =>
                        toggleItem(
                          String(v.supplier_id),
                          vendorFilters,
                          setVendorFilters
                        )
                      }
                    />
                    <span>{v.company_name_english}</span>
                  </label>
                ))}
              </div>

              {/* SAME DAY & VERIFIED */}
              <div className="shop_sidebar_item mb_30">
                <h4 className="filter_title">Delivery & Trust</h4>

                <label className="filter_option">
                  <input
                    type="checkbox"
                    checked={sameDayOnly}
                    onChange={() => setSameDayOnly(!sameDayOnly)}
                  />
                  <span>Same Day Delivery</span>
                </label>

                <label className="filter_option">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={() => setVerifiedOnly(!verifiedOnly)}
                  />
                  <span>Verified Suppliers</span>
                </label>
              </div>

              <button className="reset_btn" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>

          {/* ================= PRODUCTS ================= */}
          <div className="col-lg-10">
            <div className="row g-4">
              {filteredProducts
                .flatMap((p) => {
                  if (!p.offers || p.offers.length === 0) {
                    return [{ ...p, singleOffer: null }];
                  }

                  return p.offers.map((offer) => ({
                    ...p,
                    singleOffer: offer
                  }));
                })
                .map((p, i) => (
                  <div className="col-xl-2 col-sm-6" key={`{p.id}-${i}`}>
                    <div className="product_card">
                      <div className="product_img">
                        <img
                          src={
                            p.image
                              ? p.image.replace("127.0.0.1", "localhost")
                              : p.img1
                                ? p.img1
                                : "http://127.0.0.1:5000/static/products/default.png"
                          }
                          alt={p.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "http://127.0.0.1:5000/static/products/default.png";
                          }}
                        />

                        {/* {p.verified && (
                        <span className=" verified-ribbon" >
                          ✔ Verified
                        </span>
                      )} */}

                        {p.singleOffer ? (
                          <span className="offer_badge">
                            {p.singleOffer.offer_type === "PERCENTAGE"
                              ? `${p.singleOffer.offer_value}% OFF`
                              : `₹${p.singleOffer.offer_value} OFF`}
                          </span>
                        ) : p.verified ? (
                          <span className="verified-ribbon">✔ Verified</span>
                        ) : null}

                        {/* SAME DAY BADGE */}
                        {p.sameDay && p.deliveryTime && (
                          <div className="delivery_strip_label">
                            <i className="fas fa-shipping-fast delivery_icon"></i>
                            <span>
                              Delivery in{" "}
                              <strong
                                className={
                                  p.deliveryTime <= 20
                                    ? "fast"
                                    : p.deliveryTime <= 35
                                      ? "medium"
                                      : "slow"
                                }
                              >
                                {p.deliveryTime} MIN
                              </strong>
                            </span>
                          </div>
                        )}





                        <div className="hover_icons">
                          <button>
                            <i className="far fa-eye"></i>
                          </button>
                          <button>
                            <i className="far fa-heart"></i>
                          </button>
                        </div>
                      </div>

                      <div className="product_text">
                        <h4>{p.name}</h4>

                        <p className="product_unit">{p.unit}</p>

                        <p className="product_price">
                          QAR {
                            Number(
                              String(p.price_numeric || p.price || 0).replace(/[^\d.]/g, "")
                            ).toFixed(2)
                          }{" "}
                          <del>₹{(Number(p.price || p.price_numeric || 0) + 5).toFixed(2)}</del>
                          {/* {p.singleOffer ? (
                          <span className="offer_badge">
                            {p.singleOffer.offer_type === "PERCENTAGE"
                              ? `${p.singleOffer.offer_value}% OFF`
                              : `₹${p.singleOffer.offer_value} OFF`}
                          </span>
                        ) : p.verified ? (
                          <span className="verified-ribbon">✔ Verified</span>
                        ) : null} */}
                        </p>

                        <Link to={`/shopdetails/${p.id}`} className="add_cart_btn">
                          View Product
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

              {filteredProducts.length === 0 && (
                <p className="text-center mt-5">No products found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;