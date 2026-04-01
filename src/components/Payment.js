import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState("");

  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [errors, setErrors] = useState({});

  /* ================= CARD FORMATTERS ================= */

  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (value) => {
    let v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) return v.slice(0, 2) + "/" + v.slice(2);
    return v;
  };

  /* ================= VALIDATIONS ================= */

  const validate = () => {
    let err = {};

   

    if (method === "card") {
      if (card.number.replace(/\s/g, "").length !== 16)
        err.number = "Invalid card number";

      const [mm] = card.expiry.split("/");
      if (!mm || mm < 1 || mm > 12) err.expiry = "Invalid expiry date";

      if (card.cvv.length !== 3) err.cvv = "Invalid CVV";
      if (!card.name) err.name = "Enter card holder name";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

//   const handlePay = () => {
//     if (validate()) {
//       alert("Payment data valid ✅");
//     }
//   };


const handlePay = async () => {

  if (!method) {
    alert("Select payment method");
    return;
  }

  const orderId = localStorage.getItem("order_id");
  const token = localStorage.getItem("token");

  if (!orderId) {
    alert("Order not found");
    return;
  }

  if (!validate()) return;

  try {

    const res = await fetch("http://127.0.0.1:5000/api/payment/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        order_id: orderId,
        payment_method: method,
        amount: total
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    // ✅ CART CLEAR AFTER SUCCESS
    await fetch("http://127.0.0.1:5000/api/cart/clear", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    // ✅ CLEANUP
    localStorage.removeItem("cart");
    localStorage.removeItem("cart_summary");
    localStorage.removeItem("order_id");
    localStorage.removeItem("total_amount");

    // ✅ REDIRECT
  //  navigate("/success", { state: { fromPayment: true } });

   navigate("/success");

  } catch (err) {
    console.error(err);
    alert("Payment failed ❌");
  }
};


// const handlePay = async () => {
//   if (!method) return alert("Select payment method");

//   const orderId = localStorage.getItem("order_id");
//   const amount = Number(localStorage.getItem("total_amount"));
//   const token = localStorage.getItem("token");

//   console.log("🚀 PAYMENT ORDER ID:", orderId);
//   console.log("💰 AMOUNT:", amount);

//   if (!orderId) {
//     alert("Order missing. Please checkout again.");
//     return;
//   }

//   if (!validate()) return;

//   try {
//     const res = await fetch("http://127.0.0.1:5000/api/payment/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         order_id: orderId,

//         // ✅ FIXED (NO online)
//         payment_method: method.toLowerCase(),

//         amount,
//       }),
//     });

//     const data = await res.json();

//     console.log("PAYMENT RESPONSE:", data);

//     if (!res.ok) throw new Error(data.error);

//     // ✅ SUCCESS CLEANUP
//     localStorage.setItem("success_order_id", orderId);
//     localStorage.removeItem("order_id");
//     localStorage.removeItem("total_amount");

//     navigate("/success");

//   } catch (err) {
//     console.error("❌ PAYMENT ERROR:", err.message);
//     alert(err.message || "Payment failed ❌");
//   }
// };
// ================= GET CART SUMMARY =================
const savedSummary = JSON.parse(localStorage.getItem("cart_summary")) || {
  subtotal: 0,
  delivery: 0,
  discount: 0,
  total: 0
};

const subtotal = Number(savedSummary.subtotal || 0);
const DELIVERY_CHARGE = Number(savedSummary.delivery || 0);
const discount = Number(savedSummary.discount || 0);

// FINAL TOTAL (safe)
const total = Number(savedSummary.total || 0);


// ================= COUPONS =================
const [cartCoupon, setCartCoupon] = useState(null);

// (if not using product coupons, keep 0)
const productCouponTotal = 0;


  return (
    <section className="payment pt_75 xs_pt_55 pt-80 pb-80">
      <div className="container">
        <div className="row">

          {/* LEFT */}
          <div className="col-xl-8 col-lg-7">
            <div className="payment_holder">
              <h3 className="mb_25">Select Payment Method</h3>

              <div className="payment-methods">

                
                

                <label className={`payment-option ${method === "card" ? "active" : ""}`}>
                  <input type="radio" name="payment" onChange={() => setMethod("card")} />
                  <i className="far fa-credit-card"></i>
                  <span>Credit / Debit Card</span>
                </label>

                <label className={`payment-option ${method === "cod" ? "active" : ""}`}>
                  <input type="radio" name="payment" onChange={() => setMethod("cod")} />
                  <i className="fas fa-money-bill-wave"></i>
                  <span>Cash on Delivery</span>
                </label>

              </div>


              {/* ================= CARD FORM ================= */}
              {method === "card" && (
                <div className="payment_form mt_25">
                  <div className="row">

                    <div className="col-md-12">
                      <div className="checkout_input_box">
                        <label>Card Number</label>
                        <input
                          type="text"
                          value={card.number}
                          onChange={(e) =>
                            setCard({ ...card, number: formatCardNumber(e.target.value) })
                          }
                          placeholder="1234 5678 9012 3456"
                        />
                        {errors.number && <small className="text-danger">{errors.number}</small>}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="checkout_input_box">
                        <label>Expiry Date</label>
                        <input
                          type="text"
                          value={card.expiry}
                          onChange={(e) =>
                            setCard({ ...card, expiry: formatExpiry(e.target.value) })
                          }
                          placeholder="MM/YY"
                        />
                        {errors.expiry && <small className="text-danger">{errors.expiry}</small>}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="checkout_input_box">
                        <label>CVV</label>
                        <input
                          type="password"
                          value={card.cvv}
                          maxLength="3"
                          onChange={(e) =>
                            setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })
                          }
                        />
                        {errors.cvv && <small className="text-danger">{errors.cvv}</small>}
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="checkout_input_box">
                        <label>Card Holder Name</label>
                        <input
                          type="text"
                          value={card.name}
                          onChange={(e) =>
                            setCard({ ...card, name: e.target.value })
                          }
                        />
                        {errors.name && <small className="text-danger">{errors.name}</small>}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              <div className="payment-button">
                <button className="common_btn mt_30" onClick={handlePay} disabled={!method}>
                  Pay Now <span></span>
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT */}
          <div className="col-lg-4 col-md-8">
            <div className="cart_sidebar mt_25">
              <h3>Total Cart (03)</h3>
              <div className="cart_sidebar_info">
                <h4>Subtotal : <span>$250.00</span></h4>
                <p>Delivery : <span>$53.00</span></p>
                <p>Discount : <span>$12.00</span></p>
                <h5>Total : <span>$315.00</span></h5>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Payment;









// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const Payment = () => {
//   const navigate = useNavigate();

//   const [method, setMethod] = useState("");
//   const [errors, setErrors] = useState({});

//   const [card, setCard] = useState({
//     number: "",
//     expiry: "",
//     cvv: "",
//     name: "",
//   });

//   const [upi, setUpi] = useState("");

//   // 🔐 BLOCK DIRECT ACCESS
//   // useEffect(() => {
//   //   const token = localStorage.getItem("token");
//   //   const orderId = localStorage.getItem("order_id");

//   //   if (!token || !orderId) {
//   //     alert("Unauthorized access");
//   //     navigate("/checkout");
//   //   }
//   // }, [navigate]);



//   // 🔐 BLOCK DIRECT ACCESS
// useEffect(() => {
//   const token = localStorage.getItem("token");
//   const orderId = localStorage.getItem("order_id");

//   if (!token) {
//     navigate("/login");
//     return;
//   }

//   if (!orderId) {
//     navigate("/checkout");
//     return;
//   }
// }, [navigate]);
//   /* ================= FORMATTERS ================= */

//   const formatCardNumber = (value) =>
//     value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

//   const formatExpiry = (value) => {
//     let v = value.replace(/\D/g, "").slice(0, 4);
//     return v.length >= 3 ? v.slice(0, 2) + "/" + v.slice(2) : v;
//   };

//   /* ================= VALIDATION ================= */

//   const validate = () => {
//     let err = {};

//     // if (method === "upi") {
//     //   if (!/^[\w.-]+@[\w.-]+$/.test(upi)) err.upi = "Enter valid UPI ID";
//     // }

//     if (method === "card") {
//       if (card.number.replace(/\s/g, "").length !== 16)
//         err.number = "Invalid card number";
//       if (!card.expiry || Number(card.expiry.split("/")[0]) > 12)
//         err.expiry = "Invalid expiry";
//       if (card.cvv.length !== 3) err.cvv = "Invalid CVV";
//       if (!card.name) err.name = "Enter card holder name";
//     }

//     setErrors(err);
//     return Object.keys(err).length === 0;
//   };
//   /* ================= CART ITEMS ================= */
//   const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

//   const subtotalFromCart = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   /* ================= CART SUMMARY (FROM CART PAGE) ================= */
//   const savedSummary = JSON.parse(localStorage.getItem("cart_summary")) || {
//     subtotal: subtotalFromCart,
//     delivery: 0,
//     discount: 0,
//     total: subtotalFromCart
//   };

//   const subtotal = savedSummary.subtotal;
//   const delivery = savedSummary.delivery;
//   const discount = savedSummary.discount;
//   const total = savedSummary.total;

//   /* ================= PAY ================= */

//   const handlePay = async () => {
//     if (!method) return alert("Select payment method");

//     const orderId = localStorage.getItem("order_id");
//     const amount = Number(localStorage.getItem("total_amount"));
//     const token = localStorage.getItem("token");

//     if (!validate()) return;

//     try {
//       const res = await fetch("http://127.0.0.1:5000/api/payment/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           order_id: orderId,
//           payment_method: method,
//           amount
//         })
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.error);

//       localStorage.setItem("success_order_id", orderId);
//       localStorage.removeItem("order_id");
//       localStorage.removeItem("total_amount");

//       navigate("/ordersuccess");

//     } catch (err) {
//       console.error(err);
//       alert("Payment failed ❌");
//     }
//   };

//     return (
//     <section className="payment pt_75 xs_pt_55 pt-80 pb-80">
//       <div className="container">
//         <div className="row">

//           {/* LEFT */}
//           <div className="col-xl-8 col-lg-7">
//             <div className="payment_holder">
//               <h3 className="mb_25">Select Payment Method</h3>

//               <div className="payment-methods">

                

//                 <label className={`payment-option ${method === "card" ? "active" : ""}`}>
//                   <input type="radio" name="payment" onChange={() => setMethod("card")} />
//                   <i className="far fa-credit-card"></i>
//                   <span>Credit / Debit Card</span>
//                 </label>

//                 <label className={`payment-option ${method === "cod" ? "active" : ""}`}>
//                   <input type="radio" name="payment" onChange={() => setMethod("cod")} />
//                   <i className="fas fa-money-bill-wave"></i>
//                   <span>Cash on Delivery</span>
//                 </label>

//               </div>

//               {/* ================= UPI FORM ================= */}
//               {/* {method === "upi" && (
//                 <div className="payment_form mt_25">
//                   <div className="checkout_input_box">
//                     <label>UPI ID</label>
//                     <input
//                       type="text"
//                       value={upi}
//                       onChange={(e) => setUpi(e.target.value)}
//                       placeholder="example@upi"
//                     />
//                     {errors.upi && <small className="text-danger">{errors.upi}</small>}
//                   </div>
//                 </div>
//               )} */}

//               {/* ================= CARD FORM ================= */}
//               {method === "card" && (
//                 <div className="payment_form mt_25">
//                   <div className="row">

//                     <div className="col-md-12">
//                       <div className="checkout_input_box">
//                         <label>Card Number</label>
//                         <input
//                           type="text"
//                           value={card.number}
//                           onChange={(e) =>
//                             setCard({ ...card, number: formatCardNumber(e.target.value) })
//                           }
//                           placeholder="1234 5678 9012 3456"
//                         />
//                         {errors.number && <small className="text-danger">{errors.number}</small>}
//                       </div>
//                     </div>

//                     <div className="col-md-6">
//                       <div className="checkout_input_box">
//                         <label>Expiry Date</label>
//                         <input
//                           type="text"
//                           value={card.expiry}
//                           onChange={(e) =>
//                             setCard({ ...card, expiry: formatExpiry(e.target.value) })
//                           }
//                           placeholder="MM/YY"
//                         />
//                         {errors.expiry && <small className="text-danger">{errors.expiry}</small>}
//                       </div>
//                     </div>

//                     <div className="col-md-6">
//                       <div className="checkout_input_box">
//                         <label>CVV</label>
//                         <input
//                           type="password"
//                           value={card.cvv}
//                           maxLength="3"
//                           onChange={(e) =>
//                             setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })
//                           }
//                         />
//                         {errors.cvv && <small className="text-danger">{errors.cvv}</small>}
//                       </div>
//                     </div>

//                     <div className="col-md-12">
//                       <div className="checkout_input_box">
//                         <label>Card Holder Name</label>
//                         <input
//                           type="text"
//                           value={card.name}
//                           onChange={(e) =>
//                             setCard({ ...card, name: e.target.value })
//                           }
//                         />
//                         {errors.name && <small className="text-danger">{errors.name}</small>}
//                       </div>
//                     </div>

//                   </div>
//                 </div>
//               )}

//               <div className="payment-button">
//                 <button className="common_btn mt_30" onClick={handlePay} disabled={!method}>
//                   Pay Now <span></span>
//                 </button>
//               </div>

//             </div>
//           </div>

//           {/* RIGHT */}
//           {/* <div className="col-lg-4 col-md-8">
//             <div className="cart_sidebar">
//               <h3>Total Cart ({cartItems.length})</h3>
//               <div className="cart_sidebar_info">
//                 <h4>Subtotal : <span>${subtotal.toFixed(2)}</span></h4>
//                 <p>Delivery : <span>${delivery}</span></p>
//                 <p>Discount : <span>-${discount}</span></p>
//                 <h5>Total : <span>${total.toFixed(2)}</span></h5>

                
//               </div>
//             </div>
//           </div> */}

//         </div>
//       </div>
//     </section>
//   );
// };

// export default Payment;


