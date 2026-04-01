



// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// const API = "http://127.0.0.1:5000/api";
// const CheckItems = () => {
// const navigate = useNavigate();

//   const [addresses, setAddresses] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [cartItems, setCartItems] = useState([]);
// const [paymentMethod, setPaymentMethod] = useState("");
//   const [creditInfo, setCreditInfo] = useState(null);

//   const [coords, setCoords] = useState(null);

//   // ✅ NEW FEATURES
//   const [distance, setDistance] = useState(null);

//   const suppliers = [
//     { id: 1, lat: 17.385, lng: 78.486 },
//     { id: 2, lat: 17.45, lng: 78.50 },
//   ];

//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     altPhone: "",
//     pincode: "",
//     address1: "",
//     address2: "",
//     town: "",   
//     city: "",
//     state: "",
//     landmark: "",
//     type: "Home",
//   });
// useEffect(() => {
//   if (!coords) return;

//   const store = { lat: 17.385, lng: 78.486 };

//   const R = 6371;
//   const dLat = (coords.lat - store.lat) * (Math.PI / 180);
//   const dLng = (coords.lng - store.lng) * (Math.PI / 180);

//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(store.lat) *
//       Math.cos(coords.lat) *
//       Math.sin(dLng / 2) ** 2;

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const d = R * c;

//   setDistance(d);

// }, [coords]);

// /* ================= CREDIT FETCH ================= */
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     fetch(`${API}/restaurant/credit-info`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then(setCreditInfo)
//       .catch(() => {});
//   }, []);
//   /* ================= AUTO LOCATION ================= */
// useEffect(() => {
//   if (!navigator.geolocation) {
//     alert("Geolocation not supported");
//     return;
//   }

// navigator.geolocation.getCurrentPosition(
//   async (pos) => {
//     const { latitude, longitude } = pos.coords;

//     setCoords({ lat: latitude, lng: longitude });

//     try {
//       // ✅ GET ADDRESS
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
//       );
//       const data = await res.json();

//       const addr = data.address || {};

//       // ✅ TOKEN
//       const TOKEN = localStorage.getItem("token");

//       // ✅ FETCH PROFILE FIRST (IMPORTANT)
//       let profile = { name: "", phone: "" };

//       try {
//         const profileRes = await fetch(
//           "http://127.0.0.1:5000/api/restaurant/profile",
//           {
//             headers: {
//               Authorization: `Bearer ${TOKEN}`,
//             },
//           }
//         );

//         if (profileRes.ok) {
//           profile = await profileRes.json();
//         }
//       } catch (e) {
//         console.log("Profile fetch failed");
//       }

//       // ✅ SAVE CURRENT LOCATION TO DB (AFTER PROFILE)
//       try {
//         await fetch("http://127.0.0.1:5000/api/address/save", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${TOKEN}`,
//           },
//           body: JSON.stringify({
//             name: profile.name || "Current Location",
//             phone: profile.phone || "",
//             address: data.display_name,
//             city: addr.city || "",
//             state: addr.state || "",
//             pincode: addr.postcode || "",
//           }),
//         });
//       } catch (err) {
//         console.log("DB save failed");
//       }

//       // ✅ AUTO FILL FORM
//       setFormData((prev) => ({
//         ...prev,
//         name: profile.name || "",
//         phone: profile.phone || "",
//         address1: addr.road || "",
//         town: addr.town || addr.suburb || "",
//         city: addr.city || "",
//         state: addr.state || "",
//         pincode: addr.postcode || "",
//       }));

//       // ✅ CURRENT LOCATION OBJECT
//       const newAddress = {
//         id: Date.now(), // (optional – DB id use chesthe better)
//         name: profile.name || "Current Location",
//         phone: profile.phone || "",
//         address: data.display_name,
//         isDefault: false,
//         isCurrent: true,
//       };

//       // ✅ MERGE WITH OLD ADDRESSES (IMPORTANT FIX)
//       setAddresses((prev) => {
//         const filtered = prev.filter((a) => !a.isCurrent);
//         const updated = [newAddress, ...filtered];

//         localStorage.setItem("addresses", JSON.stringify(updated));
//         return updated;
//       });

//       setSelectedId(newAddress.id);

//     } catch (err) {
//       console.log("Reverse geocode failed");
//     }
//   },
//   (err) => {
//     console.log("LOCATION ERROR:", err);
//     alert("Please allow location permission");
//   }
// );
// }, []);


// useEffect(() => {
//   const saved = JSON.parse(localStorage.getItem("addresses")) || [];
//   if (saved.length > 0) {
//     setAddresses(saved);

//     const defaultAddr = saved.find(a => a.isDefault) || saved[0];
//     setSelectedId(defaultAddr.id);
//   }
// }, []);
//   /* ================= AUTO USER DATA ================= */
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));

//     if (user) {
//       setFormData((prev) => ({
//         ...prev,
//         name: user.name || "",
//         phone: user.phone || "",
//         city: user.city || "",
//       }));
//     }
//   }, []);

//   /* ================= HANDLERS ================= */
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };
// const deleteAddress = async (id) => {
//   const TOKEN = localStorage.getItem("token");

//   try {
//     await fetch(`http://127.0.0.1:5000/api/address/delete/${id}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${TOKEN}`,
//       },
//     });
//   } catch (err) {
//     console.log("DB delete failed");
//   }

//   const updated = addresses.filter((addr) => addr.id !== id);

//   setAddresses(updated);
//   localStorage.setItem("addresses", JSON.stringify(updated));

//   // if deleted selected → reset
//   if (selectedId === id && updated.length > 0) {
//     setSelectedId(updated[0].id);
//   }
// };

//   const setDefault = (id) => {
//     const updated = addresses.map((addr) => ({
//       ...addr,
//       isDefault: addr.id === id,
//     }));
//     setAddresses(updated);
//     localStorage.setItem("addresses", JSON.stringify(updated)); // ✅ sync
//     setSelectedId(id);
//   };

//   /* ================= MAP DRAG ================= */
// const handleMapClick = () => {
//   if (!coords) {
//     alert("Location not ready");
//     return;
//   }

//   const url = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;

//   window.open(url, "_blank");
// };
//   /* ================= DELIVERY ================= */
//   const checkDelivery = () => {
//     const store = { lat: 17.385, lng: 78.486 };

//     const R = 6371;
//     const dLat = (coords.lat - store.lat) * (Math.PI / 180);
//     const dLng = (coords.lng - store.lng) * (Math.PI / 180);

//     const a =
//       Math.sin(dLat / 2) ** 2 +
//       Math.cos(store.lat) *
//         Math.cos(coords.lat) *
//         Math.sin(dLng / 2) ** 2;

//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const d = R * c;

//     setDistance(d);

//     if (d > 10) alert("❌ Delivery not available");
//     else alert("✅ Delivery available");
//   };

//   /* ================= NEAREST SUPPLIER ================= */
//   const getNearestSupplier = () => {
//     let min = Infinity;
//     let nearest = null;

//     suppliers.forEach((s) => {
//       const d = Math.sqrt(
//         (coords.lat - s.lat) ** 2 + (coords.lng - s.lng) ** 2
//       );
//       if (d < min) {
//         min = d;
//         nearest = s;
//       }
//     });

//     console.log("Nearest Supplier:", nearest);
//   };
// const handleEdit = (addr) => {
//   setShowForm(true);
//   setEditId(addr.id);

// const parts = addr.address.split(",").map(p => p.trim());

//   setFormData({
//     name: addr.name || "",
//     phone: addr.phone || "",
//     altPhone: "",
//     pincode: "",
//     town: parts[1] || "",   
//     address1: parts[0] || "",
//     address2:  "",
//     city: parts[2] || "",
//     state: "",
//     landmark: "",
//     type: "Home",
//   });
// };
//   /* ================= SUBMIT ================= */
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (!coords) {
//     alert("Location not detected yet");
//     return;
//   }

//   if (!formData.address1) {
//     alert("Enter Building / Flat");
//     return;
//   }

//   const TOKEN = localStorage.getItem("token");

//   const fullAddress = `${formData.address1}, ${formData.town}, ${formData.city}`;

//   let updatedList;
//   let newAddressId = editId;

//   // ================= SAVE LOCAL =================
//   if (editId) {
//     updatedList = addresses.map((addr) =>
//       addr.id === editId
//         ? {
//             ...addr,
//             name: formData.name,
//             phone: formData.phone,
//             address: fullAddress,
//           }
//         : addr
//     );
//   } else {
//     const newAddress = {
//       id: Date.now(),
//       name: formData.name,
//       phone: formData.phone,
//       address: fullAddress,
//       isDefault: addresses.length === 0,
//     };

//     updatedList = [...addresses, newAddress];
//     setSelectedId(newAddress.id);
//     newAddressId = newAddress.id;
//   }

//   setAddresses(updatedList);
//   localStorage.setItem("addresses", JSON.stringify(updatedList));

//   setShowForm(false);
//   setEditId(null);

//   // ================= SAVE TO DB =================
// try {
//   const res = await fetch("http://127.0.0.1:5000/api/address/save", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${TOKEN}`,
//     },
//     body: JSON.stringify({
//       name: formData.name,
//       phone: formData.phone,
//       address: fullAddress,
//       city: formData.city,
//       state: formData.state,
//       pincode: formData.pincode,
//       payment_method: paymentMethod,
//     }),
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     alert(data.error || "Address save failed ❌");
//     return;
//   }
//   // ✅ ALWAYS GO TO SUCCESS PAGE
//       if (paymentMethod === "CREDIT") {
//         window.dispatchEvent(new Event("creditUpdated"));
//       }

//       // store success order id (missing in your first code)
//       if (data.orders_created?.length > 0) {
//         localStorage.setItem("success_order_id", data.orders_created[0].order_id);
//       }

//       if (paymentMethod !== "CREDIT") {
//         alert("Please select payment method");
//         return;
//       }

//       if (creditInfo && creditInfo.credit_available <= 0) {
//         alert("Insufficient credit balance");
//         return;
//       }
//       if (creditInfo?.overdue_amount > 0) {
//         alert("You have overdue payments. Credit is disabled.");
//         return;
//       }

//       navigate("/restaurantdashboard/ordersuccess");

//   console.log("Address saved to DB ✅");

// } catch (err) {
//   console.error(err);
//   alert("Server error while saving address ❌");
// }

 
//   // ✅ CHECKOUT
//   try {
//     const res = await fetch("http://127.0.0.1:5000/api/checkout", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${TOKEN}`,
//       },
//       body: JSON.stringify({
//         name: formData.name,
//         phone: formData.phone,
//         address: `${formData.address1}, ${formData.town}, ${formData.city}, ${formData.state}, ${formData.pincode}`,
//         latitude: coords.lat,
//         longitude: coords.lng,
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.error || "Checkout failed");
//       return;
//     }

//     // ✅ STORE ORDER ID
//     if (data.orders_created?.length > 0) {
//       const order = data.orders_created[0];

//       localStorage.setItem("order_id", order.order_id);
//       localStorage.setItem("success_order_id", order.order_id);
//       localStorage.setItem("total_amount", order.total);
//     }

//     alert("Order placed ✅");

//     navigate("/restaurantdashboard/ordersuccess");

//   } catch (err) {
//     console.error(err);
//     alert("Checkout failed");
//   }
// };
// /* ================= CART ================= */
// useEffect(() => {
//   const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
//   setCartItems(storedCart);
// }, []);

// useEffect(() => {
//   const handleStorageChange = () => {
//     const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
//     setCartItems(updatedCart);
//   };

//   window.addEventListener("storage", handleStorageChange);
//   return () => window.removeEventListener("storage", handleStorageChange);
// }, []);


// /* ================= SUBTOTAL ================= */
// const subtotal = cartItems.reduce(
//   (sum, item) => sum + Number(item.price) * Number(item.quantity),
//   0
// );


// /* ================= SUMMARY ================= */
// const [summary, setSummary] = useState({
//   subtotal: 0,
//   delivery: 0,
//   discount: 0,
//   total: 0,
// });

// useEffect(() => {
//   const storedSummary = JSON.parse(localStorage.getItem("cart_summary"));
//   if (storedSummary) {
//     setSummary(storedSummary);
//   }
// }, []);


// /* ================= DYNAMIC DELIVERY ================= */
// const getDeliveryCharge = (subtotal) => {
//   if (subtotal >= 500) return 0;   // FREE delivery
//   if (subtotal >= 200) return 30;  // Medium charge
//   return 50;                       // Low cart charge
// };

// const DELIVERY_CHARGE = getDeliveryCharge(subtotal);


// /* ================= COUPONS ================= */
// const [cartCoupon, setCartCoupon] = useState(null);




// /* ================= TOTAL ================= */
// const total =
//   subtotal +
//   DELIVERY_CHARGE -
// (summary.discount || 0)
// /* ================= HANDLE CHECKOUT ================= */
// const handleCheckout = () => {

//   const discountValue = summary.discount || 0;

//   const summaryData = {
//     subtotal,
//     delivery: DELIVERY_CHARGE,
//     discount: discountValue,
//     total: subtotal + DELIVERY_CHARGE - discountValue
//   };

//   localStorage.setItem("cart_summary", JSON.stringify(summaryData));

//   console.log("✅ CART SUMMARY SAVED:", summaryData);
// };
// useEffect(() => {
//   const savedSummary = JSON.parse(localStorage.getItem("cart_summary"));

//   if (savedSummary) {
//     setSummary(savedSummary);

//     // ✅ restore coupon properly
//     if (savedSummary.discount && savedSummary.discount > 0) {
//       setCartCoupon({
//         discount: savedSummary.discount
//       });
//     }
//   }
// }, []);
//   return (
//    <section className="checkout pt_100 pb-80">
//       <div className="container">
//         <div className="row">

//           <div className="col-lg-8">

//             {/* ✅ CREDIT BOX */}
//               {creditInfo && (
//                 <div className="credit_summary_box">

//                   <div className="credit_summary_header">
//                     <i className="fas fa-wallet"></i>
//                     <span>Business Credit</span>
//                   </div>

//                   <div className="credit_summary_grid">

//                     <div>
//                       <small>Limit</small>
//                       <strong>QAR {creditInfo.credit_limit}</strong>
//                     </div>

//                     <div>
//                       <small>Used</small>
//                       <strong>QAR {creditInfo.credit_used}</strong>
//                     </div>

//                     <div>
//                       <small>Available</small>
//                       <strong className="credit_available">
//                         QAR {creditInfo.credit_available}
//                       </strong>
//                     </div>

//                     <div>
//                       <small>Credit Period</small>
//                       <strong>{creditInfo.credit_days} days</strong>
//                     </div>

//                     {creditInfo.next_due_date && (
//                       <div>
//                         <small>Next Due</small>
//                         <strong>
//                           {new Date(creditInfo.next_due_date).toLocaleDateString()}
//                         </strong>
//                       </div>
//                     )}

//                     {creditInfo.overdue_amount > 0 && (
//                       <div className="credit_overdue">
//                         Overdue:QAR {creditInfo.overdue_amount}
//                       </div>
//                     )}

//                   </div>
//                 </div>
//               )}

//             {/* SHIPPING ADDRESS */}
//             <div className="shipping_address_box">
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h3>Shipping Address</h3>
//                 <button
//                   className="add_address_btn"
//                   onClick={() => {
//                     setShowForm(!showForm);
//                     setEditId(null);
//                   }}
//                 >
//                   + Add New Address
//                 </button>
//               </div>

//               {/* ADDRESS LIST */}
//               {addresses.map((addr) => (
//   <div
//     key={addr.id}
//     className={`address_card ${selectedId === addr.id ? "active" : ""}`}
//   >
//     <div className="address_row">

//       {/* LEFT SECTION */}
//       <div className="address_left">
//         <input
//           type="radio"
//           checked={selectedId === addr.id}
//           onChange={() => setSelectedId(addr.id)}
//         />

//         <div className="address_content">
//           <div className="address_header">
//             <h5>{addr.name}</h5>
//             {addr.isDefault && (
//               <span className="default_badge">Default</span>
//             )}
//           </div>

//           <p className="address_text">{addr.address}</p>
//           <small className="phone_text">
//             Phone: {addr.phone}
//           </small>
//         </div>
//       </div>

//       {/* RIGHT ACTIONS */}
//      <div className="address_right">
//   <button onClick={() => handleEdit(addr)}>Edit</button>
//  {!addr.isCurrent && (
//   <button onClick={() => deleteAddress(addr.id)}>Delete</button>
// )}
//  {!addr.isDefault && (
//   <button onClick={() => setDefault(addr.id)}>
//     Make Default
//   </button>
// )}
// </div>

//     </div>
//   </div>
// ))}

//               {/* ADD / EDIT FORM */}
//               <div
//                 className={`address_form_wrapper ${
//                   showForm ? "open" : ""
//                 }`}
//               >
//                 {showForm && (

//                  <form className="checkout_form mt-4" onSubmit={handleSubmit}>
//   <div className="row">

//     {/* NAME */}
//     <div className="col-md-6">
//       <div className="checkout_input_box">
//         <label>Full Name *</label>
//        <input
//         name="name"
//         value={formData.name}
//         onChange={handleChange}
//         placeholder="Enter full name"
//       />
//       </div>
//     </div>

//     {/* PHONE */}
//     <div className="col-md-6">
//       <div className="checkout_input_box">
//         <label>Phone Number *</label>
//         <input
//         name="phone"
//         value={formData.phone}
//         onChange={handleChange}
//         type="text" placeholder="Enter phone number"
//       />
        
//       </div>
//     </div>

//     {/* ALT PHONE */}
//     <div className="col-md-6">
//       <div className="checkout_input_box">
//         <label>Alternate Phone</label>
//         <input
//           name="altPhone"
//           value={formData.altPhone}
//           onChange={handleChange}
//         />
        
//       </div>
//     </div>

//     {/* PINCODE */}
//     <div className="col-md-6">
//       <div className="checkout_input_box">
//         <label>Pincode *</label>
//        <input
//         name="pincode"
//         value={formData.pincode}
//         onChange={handleChange}
//       />
//       </div>
//     </div>

//     {/* STREET 1 */}
//     <div className="col-12">
//       <div className="checkout_input_box">
//         <label>Street Address Line 1 *</label>
//         <input
//           name="address1"
//           value={formData.address1}
//           onChange={handleChange}
//         />
//       </div>
//     </div>

//     {/* STREET 2 */}
//     <div className="col-12">
//       <div className="checkout_input_box">
//         <label>Street Address Line 2</label>
//         <input
//       name="address2"
//       value={formData.address2}
//       onChange={handleChange}
//       placeholder="Enter town or area"
//     />
//       </div>
//     </div>

//     {/* TOWN */}
//     <div className="col-md-6">
//       <div className="checkout_input_box">
//         <label>Town / Area *</label>
//      <input
//   name="town"
//   value={formData.town}
//   onChange={handleChange}
//   placeholder="Enter town or area"
// />
//       </div>
//     </div>

//     {/* CITY */}
//     <div className="col-md-6">
//       <div className="checkout_input_box">
//         <label>City *</label>
//         <input
//           name="city"
//           value={formData.city}
//           onChange={handleChange}
//         />
//       </div>
//     </div>

//     {/* STATE */}
//     <div className="col-md-6">
//       <div className="checkout_input_box">
//         <label>State *</label>
//         <input
//         name="state"
//         value={formData.state}
//         onChange={handleChange}
//       />
//       </div>
//     </div>

//     {/* LANDMARK */}
//     <div className="col-md-6">
//       <div className="checkout_input_box">
//         <label>Landmark</label>
//         <input
//           name="landmark"
//           value={formData.landmark}
//           onChange={handleChange}
//         />
//       </div>
//     </div>

//     {/* ADDRESS TYPE */}
//     <div className="col-12 mt-3">
//       <label className="mb-2">Address Type</label>
//       <div className="address_type_group">
//         <label>
//          <input
//           type="radio"
//           name="type"
//           value="Home"
//           checked={formData.type === "Home"}
//           onChange={handleChange}
//         /> Home
//         </label>
//         <label>
//           <input
//         type="radio"
//         name="type"
//         value="Office"
//         checked={formData.type === "Office"}
//         onChange={handleChange}
//       /> Office
//         </label>
//       </div>
//     </div>

//     {/* BUTTONS */}
//     <div className="col-12 mt-4 d-flex gap-3 m-auto">
//       <div className="d-flex gap-3 m-auto">

     
//    <button type="submit" className="common_btn">
//   {editId ? "Update Address" : "Save Address"}
// </button>

//       <button
//   type="button"
//   className="cancel_btn"
//   onClick={() => {
//     setShowForm(false);
//     setEditId(null);
//   }}
// >
//   Cancel
// </button>
//        </div>
//     </div>

//   </div>
// </form>

//                 )}
//               </div>

//             </div>
 

//           </div>
//            <div className="payment-methods mt-4">

//               <label
//                 className={`payment-option ${
//                   paymentMethod === "CREDIT" ? "active" : ""
//                 } ${creditInfo?.overdue_amount > 0 ? "disabled" : ""}`}
//                 onClick={() => {
//                   if (creditInfo?.overdue_amount > 0) return;
//                   setPaymentMethod("CREDIT");
//                 }}
//                 style={{
//                   cursor: creditInfo?.overdue_amount > 0 ? "not-allowed" : "pointer",
//                   opacity: creditInfo?.overdue_amount > 0 ? 0.5 : 1
//                 }}
//               >
//                 <input
//                   type="radio"
//                   checked={paymentMethod === "CREDIT"}
//                   readOnly
//                 />
//                 <i className="fas fa-wallet"></i>
//                 <span>Pay using Credit</span>
//               </label>

//             </div>
//               <div className="payment-button">
//             <button
//               onClick={handleSubmit}
//               className="common_btn mt_30"
//               disabled={!paymentMethod}
//             >
//               Proceed
//             </button>
//             </div>

//             {creditInfo?.overdue_amount > 0 && (
//               <p style={{ color: "red", marginTop: "10px" }}>
//                 ⚠️ Your account has overdue amount of ₹{creditInfo.overdue_amount}.  
//                 Please clear dues to use credit.
//               </p>
//             )}       

//           {/* CART SUMMARY */}
//   <div className="col-lg-4 col-md-8">
//               <div className="cart_sidebar">
//                 <h3>Total Cart ({cartItems.length})</h3>
  
//                 <div className="cart_sidebar_info">
//                   <h4>Subtotal : <span>${subtotal.toFixed(2)}</span></h4>
//                   <p>Delivery : <span>${DELIVERY_CHARGE.toFixed(2)}</span></p>
//                   <p>
//                   Coupon Discount :
// <span>
//     -${(summary.discount || 0).toFixed(2)}
//   </span>
//                   </p>
//                   <h5>Total : <span>${total.toFixed(2)}</span></h5>
  
//                   {/* <Link to="/restaurantdashboard/Checkout" className="common_btn">
//                     Checkout <i className="fa fa-long-arrow-right"></i>
//                     <span></span>
//                   </Link> */}
//                         <Link
//                       to="/payment"
//                       className="common_btn"
//                       onClick={handleCheckout}
//                     >
//                       Order Confirm<i className="fa fa-long-arrow-right"></i>
//                       <span></span>
//                     </Link>
  
//                 </div>
//               </div>
//             </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CheckItems;


import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000/api";

const CheckItems = () => {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const selectedAddress = addresses.find(a => a.id === selectedId);

  const [coords, setCoords] = useState(null);

  // ✅ CREDIT STATES
  // const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [creditInfo, setCreditInfo] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    altPhone: "",
    pincode: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    landmark: "",
    type: "Home",
  });

  /* ================= CREDIT FETCH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/restaurant/credit-info`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setCreditInfo)
      .catch(() => {});
  }, []);

  /* ================= AUTO LOCATION ================= */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;

        setCoords({
          lat: latitude,
          lng: longitude,
        });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          const addressText = data.display_name || "Current Location";

          const newId = Date.now();

          setAddresses([
            {
              id: newId,
              name: "Current Location",
              phone: "",
              address: addressText,
              isDefault: true,
            },
          ]);

          setSelectedId(newId);
        } catch {}
      });
    }
  }, []);

  /* ================= USER AUTO FILL ================= */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        city: user.city || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const deleteAddress = (id) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const setDefault = (id) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    setSelectedId(id);
  };

  /* ================= SUBMIT ================= */
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const TOKEN = localStorage.getItem("token");

    if (!TOKEN) {
      alert("Login expired");
      return;
    }

    if (!coords) {
      alert("Location not detected yet");
      return;
    }

    if (!paymentMethod) {
      alert("Select payment method");
      return;
    }

    // =============================
    // 🚀 STEP 1: CREATE ORDER
    // =============================
    const res = await fetch(`${API}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        address:
          selectedAddress?.address ||
          `${formData.address1}, ${formData.city}`,
        note: formData.landmark,
        latitude: coords.lat,
        longitude: coords.lng,
        payment_method:
        paymentMethod === "CREDIT"
          ? "CREDIT"
          : paymentMethod === "COD"
          ? "COD"
          : "ONLINE",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Checkout failed");
      return;
    }

    if (!data.orders_created || data.orders_created.length === 0) {
      alert("Order not created");
      return;
    }

    const firstOrder = data.orders_created[0];

    console.log("✅ ORDER CREATED:", firstOrder.order_id);

    // =============================
    // ✅ STORE ORDER
    // =============================
    localStorage.setItem("order_id", firstOrder.order_id);
    localStorage.setItem("total_amount", firstOrder.amount);

    // =============================
    // 🚀 CREDIT FLOW
    // =============================
    if (paymentMethod === "CREDIT") {
      if (creditInfo?.credit_available <= 0) {
        alert("Insufficient credit balance");
        return;
      }

      if (creditInfo?.overdue_amount > 0) {
        alert("You have overdue payments.");
        return;
      }

      localStorage.setItem("success_order_id", firstOrder.order_id);
      navigate("/success");
      return;
    }

    // =============================
    // 🚀 COD FLOW (NEW 🔥)
    // =============================
    if (paymentMethod === "COD") {
      const payRes = await fetch(`${API}/payment/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          order_id: firstOrder.order_id,
          payment_method: "cod",
          amount: firstOrder.amount,
        }),
      });

      const payData = await payRes.json();

      if (!payRes.ok) {
        alert(payData.error || "Payment failed");
        return;
      }

      // ✅ SUCCESS
      localStorage.setItem("success_order_id", firstOrder.order_id);
      localStorage.removeItem("order_id");
      localStorage.removeItem("total_amount");

      navigate("/success");
      return;
    }

    // =============================
    // 🚀 FUTURE ONLINE PAYMENTS
    // =============================
    navigate("/payment");

  } catch (err) {
    console.error(err);
    alert("Checkout failed");
  }
};
  /* ================= CART ================= */
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  const subtotalFromCart = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const savedSummary = JSON.parse(localStorage.getItem("cart_summary")) || {
    subtotal: subtotalFromCart,
    delivery: 0,
    discount: 0,
    total: subtotalFromCart,
  };

  const { subtotal, delivery, discount, total } = savedSummary;

  return (
    <section className="checkout pt_100 pb-80">
      <div className="container">
        <div className="row">

          <div className="col-lg-8">
                        {/* ✅ CREDIT BOX */}
              {creditInfo && (
                <div className="credit_summary_box">

                  <div className="credit_summary_header">
                    <i className="fas fa-wallet"></i>
                    <span>Business Credit</span>
                  </div>

                  <div className="credit_summary_grid">

                    <div>
                      <small>Limit</small>
                      <strong>QAR {creditInfo.credit_limit}</strong>
                    </div>

                    <div>
                      <small>Used</small>
                      <strong>QAR {creditInfo.credit_used}</strong>
                    </div>

                    <div>
                      <small>Available</small>
                      <strong className="credit_available">
                        QAR {creditInfo.credit_available}
                      </strong>
                    </div>

                    <div>
                      <small>Credit Period</small>
                      <strong>{creditInfo.credit_days} days</strong>
                    </div>

                    {creditInfo.next_due_date && (
                      <div>
                        <small>Next Due</small>
                        <strong>
                          {new Date(creditInfo.next_due_date).toLocaleDateString()}
                        </strong>
                      </div>
                    )}

                    {creditInfo.overdue_amount > 0 && (
                      <div className="credit_overdue">
                        Overdue:QAR {creditInfo.overdue_amount}
                      </div>
                    )}

                  </div>
                </div>
              )}

            <div className="shipping_address_box">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Shipping Address</h3>
                <button
                  className="add_address_btn"
                  onClick={() => {
                    setShowForm(!showForm);
                    setEditId(null);
                  }}
                >
                  + Add New Address
                </button>
              </div>

              {/* ADDRESS LIST */}
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`address_card ${selectedId === addr.id ? "active" : ""}`}
                >
                  <div className="address_row">

                    <div className="address_left">
                      <input
                        type="radio"
                        checked={selectedId === addr.id}
                        onChange={() => setSelectedId(addr.id)}
                      />

                      <div className="address_content">
                        <div className="address_header">
                          <h5>{addr.name}</h5>
                          {addr.isDefault && (
                            <span className="default_badge">Default</span>
                          )}
                        </div>

                        <p className="address_text">{addr.address}</p>
                        <small className="phone_text">
                          Phone: {addr.phone}
                        </small>
                      </div>
                    </div>

                    <div className="address_right">
                      <button onClick={() => setEditId(addr.id)}>Edit</button>
                      <button onClick={() => deleteAddress(addr.id)}>Delete</button>
                      {!addr.isDefault && (
                        <button onClick={() => setDefault(addr.id)}>
                          Make Default
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              ))}



              {/* FORM */}
              <div className={`address_form_wrapper ${showForm ? "open" : ""}`}>
                {showForm && (

                  <form className="checkout_form mt-4" onSubmit={handleSubmit}>
                    <div className="row">

                      <div className="col-md-6">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
                      </div>

                      <div className="col-md-6">
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
                      </div>

                      <div className="col-md-6">
                        <input name="altPhone" value={formData.altPhone} onChange={handleChange} placeholder="Alt Phone" />
                      </div>

                      <div className="col-md-6">
                        <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
                      </div>

                      <div className="col-12">
                        <input name="address1" value={formData.address1} onChange={handleChange} placeholder="Address 1" />
                      </div>

                      <div className="col-12">
                        <input name="address2" value={formData.address2} onChange={handleChange} placeholder="Address 2" />
                      </div>

                      <div className="col-md-6">
                        <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                      </div>

                      <div className="col-md-6">
                        <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                      </div>

                      <div className="col-md-6">
                        <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark" />
                      </div>

                      <div className="col-12 mt-3">
                        <label>
                          <input type="radio" name="type" value="Home" onChange={handleChange} /> Home
                        </label>
                        <label>
                          <input type="radio" name="type" value="Office" onChange={handleChange} /> Office
                        </label>
                      </div>

                      <div className="col-12 mt-4">
                        <button type="submit" className="common_btn">
                          Save Address
                        </button>
                      </div>

                    </div>
                  </form>

                )}
              </div>
            {/* ✅ PAYMENT METHOD */}
            {/* <div className="checkout_input_box mt-4">
              <label>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="COD">Cash on Delivery</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div> */}

            <div className="payment-methods mt-4">

              {/* CREDIT */}
              <label
                className={`payment-option ${paymentMethod === "CREDIT" ? "active" : ""}`}
                onClick={() => setPaymentMethod("CREDIT")}
              >
                <input type="radio" checked={paymentMethod === "CREDIT"} readOnly />
                <span>Pay using Credit</span>
              </label>

              {/* COD */}
              <label
                className={`payment-option ${paymentMethod === "COD" ? "active" : ""}`}
                onClick={() => setPaymentMethod("COD")}
              >
                <input type="radio" checked={paymentMethod === "COD"} readOnly />
                <span>Cash on Delivery</span>
              </label>

              {/* 🔥 NEW ONLINE OPTION */}
              <label
                className={`payment-option ${paymentMethod === "ONLINE" ? "active" : ""}`}
                onClick={() => setPaymentMethod("ONLINE")}
              >
                <input type="radio" checked={paymentMethod === "ONLINE"} readOnly />
                <span>Online Payment</span>
              </label>

            </div>

            <button
              onClick={handleSubmit}
              className="common_btn mt-3"
              disabled={!paymentMethod}
            >
              Proceed
            </button>

            {creditInfo?.overdue_amount > 0 && (
              <p style={{ color: "red", marginTop: "10px" }}>
                ⚠️ Your account has overdue amount of ₹{creditInfo.overdue_amount}.  
                Please clear dues to use credit.
              </p>
            )}
            </div>

          </div>

          {/* CART */}
           <div className="col-lg-4 col-md-8">
            <div className="cart_sidebar">
              <h3>Total Cart ({cartItems.length})</h3>
              <div className="cart_sidebar_info">
                <h4>Subtotal : <span>${subtotal.toFixed(2)}</span></h4>
                <p>Delivery : <span>${delivery}</span></p>
                <p>Discount : <span>-${discount}</span></p>
                <h5>Total : <span>${total.toFixed(2)}</span></h5>

                
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CheckItems;