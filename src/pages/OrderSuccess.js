





// import React from "react";
// import { Link } from "react-router-dom";

// const OrderSuccess = () => {
//   // ✅ FETCH ORDER ID FROM LOCALSTORAGE (NOT PATH)
//   const orderId = localStorage.getItem("success_order_id");

//   return (
//     <section className="order_success_page">
//       <div className="success_card">

//         <div className="success_icon">
//           <i className="fas fa-check"></i>
//         </div>

//         <h2>Order Placed Successfully!</h2>
//         <p>Your order has been confirmed and will be delivered soon</p>

//         <h6>
//           Order ID: <span>#ORD-{orderId || "----"}</span>
//         </h6>

//         <div className="success_actions">
//           <Link to="/restaurantoffers" className="success_btn">
//             Continue Shopping
//           </Link>
//           <Link
//             to="/restaurantdashboard/orders"
//             className="success_btn outline"
//           >
//             View Orders
//           </Link>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default OrderSuccess;


import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const OrderSuccess = () => {
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const orderId = localStorage.getItem("success_order_id");
    const token = localStorage.getItem("token");

    if (!orderId || !token) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/v1/orders/restaurant/${orderId}`, // ✅ FIXED
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!res.ok) throw new Error("Order not found");

        const data = await res.json();
        setOrder(data);

        localStorage.removeItem("success_order_id");

      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  useEffect(() => {
    if (error) navigate("/");
  }, [error, navigate]);

  if (loading) {
    return <h3 style={{ textAlign: "center" }}>Loading...</h3>;
  }

  if (!order) {
    return null;
  }

  return (
  
    <section className="order_success_page">
      <div className="success_card">

         <div className="success_icon">
          <i className="fas fa-check"></i>
        </div>

        <h2>Order Placed Successfully 🎉</h2>
        <p>Your order has been confirmed</p>

        <h6>
          Order ID: <span>#{order.order_id}</span>
        </h6>

        <h6>
          Payment Method: <span>{order.payment_method}</span>
        </h6>

        <h6>
          Total Amount: <span>₹{order.total_amount}</span>
        </h6>

        <div className="success_actions">
          <Link to="/CategorieList" className="success_btn">
            Continue Shopping
          </Link>
          <Link
            to="/restaurantdashboard/orders"
            className="success_btn outline"
          >
            View Orders
          </Link>
        </div>

      </div>
    </section>
  );
};

export default OrderSuccess;