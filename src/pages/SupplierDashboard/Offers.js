// import React, { useState } from "react";
// import CreateOfferModal from "../../components/Dashboard/CreateOfferModal";

// const Offers = () => {
//   const [showModal, setShowModal] = useState(false);

//   return (
//     <div className="dashboard_page offers_page">

//       <div className="page_header glass">
//         <div>
//           <h2>Offers</h2>
//           <p className="sub_text">Manage your offers</p>
//         </div>

//         <button
//           className="btn_save glow"
//           onClick={() => setShowModal(true)}
//         >
//           <i className="fas fa-plus"></i> Add Offer
//         </button>
//       </div>

//       {/* TABLE DUMMY */}
//       <div className="section_card soft">
//         <p>No offers created yet</p>
//       </div>

//       {/* MODAL */}
//       {showModal && (
//         <CreateOfferModal onClose={() => setShowModal(false)} />
//       )}
//     </div>
//   );
// };

// export default Offers;



// import React, { useEffect, useState } from "react";
// import CreateOfferModal from "../../components/Dashboard/CreateOfferModal";

// const Offers = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [offers, setOffers] = useState([]);
//   const [products, setProducts] = useState([]);

//   const supplierId = localStorage.getItem("linked_id");

//   /* ================= FETCH OFFERS ================= */
//   const fetchOffers = async () => {
//     if (!supplierId) return;

//     try {
//       const res = await fetch(
//         `http://127.0.0.1:5000/api/offers?supplier_id=${supplierId}`
//       );
//       const data = await res.json();
//       setOffers(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Fetch offers failed", err);
//     }
//   };

//   /* ================= FETCH PRODUCTS (FOR IMAGES) ================= */
//   const fetchProducts = async () => {
//     if (!supplierId) return;

//     try {
//       const res = await fetch(
//         `http://127.0.0.1:5000/api/products?supplier_id=${supplierId}`
//       );
//       const data = await res.json();
//       setProducts(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Fetch products failed", err);
//     }
//   };

//   /* ================= DELETE OFFER ================= */
//   const deleteOffer = async (offerId) => {
//     if (!window.confirm("Delete this offer?")) return;

//     try {
//       await fetch(
//         `http://127.0.0.1:5000/api/offers/${offerId}?supplier_id=${supplierId}`,
//         { method: "DELETE" }
//       );
//       fetchOffers();
//     } catch (err) {
//       alert("Delete failed");
//     }
//   };

//   useEffect(() => {
//     fetchOffers();
//     fetchProducts();
//   }, [supplierId]);

//   /* ================= IMAGE RESOLVER ================= */
//   const getOfferImage = (offer) => {
//     if (!offer.product_id) return "/placeholder.png";

//     const product = products.find(
//       (p) => p.product_id === offer.product_id
//     );

//     if (!product) return "/placeholder.png";

//     // case: multiple images
//     if (
//       Array.isArray(product.product_images) &&
//       product.product_images.length > 0
//     ) {
//       return `data:image/jpeg;base64,${product.product_images[0]}`;
//     }

//     // case: single base64 image
//     if (
//       typeof product.product_images === "string" &&
//       product.product_images.trim()
//     ) {
//       return `data:image/jpeg;base64,${product.product_images}`;
//     }

//     return "/placeholder.png";
//   };

//   return (
//     <div className="dashboard_page offers_page">
//       {/* HEADER */}
//       <div className="page_header glass">
//         <div>
//           <h2>Offers</h2>
//           <p className="sub_text">Manage your offers</p>
//         </div>

//         <button
//           className="btn_save glow"
//           onClick={() => setShowModal(true)}
//         >
//           <i className="fas fa-plus"></i> Add Offer
//         </button>
//       </div>

//       {/* OFFERS LIST */}
//       <div className="section_card soft">
//         {offers.length === 0 && <p>No offers created yet</p>}

//         {offers.map((o) => (
//           <div key={o.offer_id} className="offer_row">
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "12px",
//               }}
//             >
//               <img
//                 src={getOfferImage(o)}
//                 alt={o.product_name_english || "Offer"}
//                 style={{
//                   width: "48px",
//                   height: "48px",
//                   objectFit: "cover",
//                   borderRadius: "6px",
//                   border: "1px solid #ddd",
//                 }}
//               />

//               <div>
//                 <b>{o.product_name_english || "Category Offer"}</b>
//                 <div className="muted">
//                   {o.start_date} → {o.end_date}
//                 </div>
//               </div>
//             </div>

//             <div>{o.discount_percentage}% OFF</div>

//             <button
//               className="delete_btn"
//               onClick={() => deleteOffer(o.offer_id)}
//             >
//               🗑
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* MODAL */}
//       {showModal && (
//         <CreateOfferModal
//           onClose={() => setShowModal(false)}
//           onSaved={() => {
//             setShowModal(false);
//             fetchOffers();
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Offers;




  
import React, { useEffect, useState } from "react";
import CreateOfferModal from "../../components/Dashboard/CreateOfferModal";
import "../css/offer.css";

const Offers = () => {
  const [showModal, setShowModal] = useState(false);
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);

  const supplierId = localStorage.getItem("linked_id");

  /* ================= FETCH ================= */
  const fetchOffers = async () => {
    if (!supplierId) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/offers?supplier_id=${supplierId}`
      );
      const data = await res.json();
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch offers failed", err);
    }
  };

  const fetchProducts = async () => {
    if (!supplierId) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/products?supplier_id=${supplierId}`
      );
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch products failed", err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchProducts();
  }, [supplierId]);

  /* ================= DELETE ================= */
  const deleteOffer = async (offerId) => {
    if (!window.confirm("Delete this offer?")) return;
    try {
      await fetch(
        `http://127.0.0.1:5000/api/offers/${offerId}?supplier_id=${supplierId}`,
        { method: "DELETE" }
      );
      fetchOffers();
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= HELPERS ================= */
  const getOfferImage = (o) =>
    o.image_url
      ? `http://127.0.0.1:5000${o.image_url}`
      : "/placeholder.png";

  const getCurrentPrice = (productId) => {
    const p = products.find(
      (x) => x.product_id === productId || x.id === productId
    );

    return (
      Number(p?.price_per_unit) ||
      Number(p?.price) ||
      Number(p?.unit_price) ||
      0
    );
  };

  const getOfferType = (o) => {
    return o.offer_type || o.discount_type || "—";
  };

  const getOfferPrice = (o) => {
    const original = getCurrentPrice(o.product_id);
    if (!original) return 0;

    const type = getOfferType(o);

    if (type === "Percentage") {
      return original - (original * Number(o.discount_percentage || 0)) / 100;
    }

    if (type === "Flat") {
      return Math.max(0, original - Number(o.flat_amount || 0));
    }

    return original;
  };
const getOfferLabel = (o) => {
  const now = new Date();

  const startDT = o.start_time
    ? new Date(`${o.start_date}T${o.start_time}`)
    : new Date(`${o.start_date}T00:00:00`);

  const endDT = o.end_time
    ? new Date(`${o.end_date}T${o.end_time}`)
    : new Date(`${o.end_date}T23:59:59`);

  // 🔴 EXPIRED
  if (now > endDT) {
    return { text: "EXPIRED", type: "expired" };
  }

  // 🟡 UPCOMING
  if (now < startDT) {
    const mins = Math.ceil((startDT - now) / (1000 * 60));

    if (mins <= 60) {
      return { text: `STARTS IN ${mins} MIN`, type: "upcoming" };
    }

    return { text: "UPCOMING", type: "upcoming" };
  }

  // 🟠 ENDING SOON
  const minsLeft = Math.ceil((endDT - now) / (1000 * 60));
  if (minsLeft <= 30) {
    return { text: `ENDING IN ${minsLeft} MIN`, type: "ending" };
  }

  // 🟢 ACTIVE
  return { text: "ACTIVE", type: "active" };
};

  /* ================= RENDER ================= */
return (
  <div className="orders_page">
    {/* HEADER (kept – not removed) */}
    <div className="page_header glass">
      <div>
        <h3 className="page_title">Offers</h3>
        <p className="sub_text">Manage your offers</p>
      </div>

      <button
        className="btn_save glow"
        onClick={() => {
          setEditingOffer(null);
          setShowModal(true);
        }}
      >
        <i className="fas fa-plus"></i> Add Offer
      </button>
    </div>

    {/* ORDERS TABLE DESIGN */}
    <div className="table_wrapper">
      <table className="orders_table">
        <thead>
          <tr>
            <th>Offer ID</th>
            <th>Status</th>
            <th>Product</th>
            <th>Validity</th>
            <th>Offer Type</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {offers.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No offers created yet
              </td>
            </tr>
          )}

          {offers.map((o) => {
            const offerType = getOfferType(o);
            const label =
              o.is_active === false
                ? { text: "INACTIVE", type: "inactive" }
                : getOfferLabel(o);

            return (
              <tr key={o.offer_id}>
                {/* OFFER ID */}
                <td>{o.offer_id}</td>

                {/* STATUS */}
                <td>
                  <span className={`status ${label.type}`}>
                    {label.text}
                  </span>
                </td>

                {/* PRODUCT */}
                <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={getOfferImage(o)}
                    alt={o.product_name_english || "Offer"}
                    className="offer_img"
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                    }}
                  />
                  <b>{o.product_name_english || "Category Offer"}</b>
                </td>

                {/* VALIDITY */}
                <td className="muted">
                  {o.start_date} → {o.end_date}
                </td>

                {/* OFFER TYPE */}
                <td className="muted">{offerType}</td>

                {/* ACTIONS */}
                <td>
                  <button
                    className="view_btn"
                    onClick={() => {
                      setEditingOffer(o);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete_btn"
                    onClick={() => deleteOffer(o.offer_id)}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* MODAL (unchanged) */}
    {showModal && (
      <CreateOfferModal
        offer={editingOffer}
        onClose={() => {
          setShowModal(false);
          setEditingOffer(null);
        }}
        onSaved={() => {
          setShowModal(false);
          setEditingOffer(null);
          fetchOffers();
        }}
      />
    )}
  </div>
);

};

export default Offers;