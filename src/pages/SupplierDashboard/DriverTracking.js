import { useEffect, useState } from "react";
import "../css/driverTracking.css";

const API = "/api/v1/orders";

const DriverTracking = () => {

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [details, setDetails] = useState(null);
  const [otp, setOtp] = useState("");
  const [coords, setCoords] = useState(null);
  const [delivered, setDelivered] = useState(false);



  /* ================= LOAD DETAILS ================= */
  useEffect(() => {

    if (!token) {
      setDetails({ error: "Invalid link" });
      return;
    }

    fetch(`${API}/driver/details`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {

        const data = await res.json();

        if (!res.ok) {
          setDetails({ error: data.error || "Invalid link" });
          return;
        }

        setDetails(data);

      })
      .catch(() => setDetails({ error: "Invalid link" }));

  }, [token]);


  /* ================= GPS ================= */
  useEffect(() => {

    if (!token || !details || details.error || delivered) return;

    const watchId = navigator.geolocation.watchPosition(

      async (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setCoords({ lat, lng });

        await fetch(`${API}/driver/location`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ lat, lng })
        });

      },

      () => alert("Enable GPS"),
      { enableHighAccuracy: true }

    );

    return () => navigator.geolocation.clearWatch(watchId);

  }, [token, details, delivered]);


  /* ================= LOADING ================= */
  if (!details) return <div className="loading">Loading...</div>;

  /* ================= SUCCESS SCREEN ================= */
  if (delivered) {
    return (
      <div className="driver-page center">
        <div className="success-card">

          <div className="checkmark-circle">
            ✔
          </div>

          <h2>Delivery Successful</h2>
          <p>Order #{details?.order_id}</p>

          <p className="sub">
            Thank you! Delivery has been completed.
          </p>

        </div>
      </div>
    );
  }


  /* ================= ERROR STATES ================= */

  if (details.error) {

    let title = "❌ Invalid Link";
    let msg = "This delivery link is not valid.";

    if (details.error === "Delivery already completed") {
      title = "✅ Delivery Completed";
      msg = "This delivery link is no longer active.";
    }

    if (details.error === "Link expired") {
      title = "⌛ Link Expired";
      msg = "Please contact restaurant.";
    }

    return (
      <div className="driver-page">
        <div className="card">
          <h2>{title}</h2>
          <p>{msg}</p>
        </div>
      </div>
    );
  }


  /* ================= NORMAL PAGE ================= */

const mapsLink =
  details.delivery_lat && details.delivery_lng
    ? `https://www.google.com/maps?q=${details.delivery_lat},${details.delivery_lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.delivery_address)}`;


return (
  <div className="driver-container">

    {/* HEADER */}
    <div className="header">
      <h2>🚚 Delivery</h2>
      <span className="order-id">Order #{details.order_id}</span>
    </div>

    {/* NAVIGATION CARD */}
    <div className="card highlight">
      <h3>📍 Navigate to Location</h3>

      <p>{details.delivery_address}</p>

      {/* ✅ VISUAL HINT */}
      {details.delivery_lat && details.delivery_lng && (
        <small style={{ color: "green", fontWeight: "bold" }}>
          📍 GPS Navigation Enabled
        </small>
      )}

      <a
        href={mapsLink}
        target="_blank"
        rel="noreferrer"
        className="btn big primary"
      >
        🧭 Start Navigation
      </a>
    </div>

    {/* RESTAURANT */}
    <div className="card">
      <h3>🏪 Restaurant</h3>
      <p>{details.restaurant_name}</p>

      <a href={`tel:${details.restaurant_phone}`} className="btn call">
        📞 Call
      </a>
    </div>

    {/* ITEMS */}
    <div className="card">
      <h3>📦 Order Items</h3>

      {details.items?.map((item, i) => (
        <div key={i} className="item-row">
          <span>{item.product_name_english}</span>
          <span>x{item.quantity}</span>
        </div>
      ))}
    </div>

    {/* PAYMENT */}
    <div className="card payment">
      <h3>💳 Payment</h3>

      <p><b>{details.payment_method}</b></p>
      <p>Status: {details.payment_status}</p>
      <h2>QAR {details.total_amount}</h2>

      {details.payment_method === "COD" &&
        details.payment_status !== "PAID" && (
          <button
            className="btn success big"
            onClick={async () => {
              const res = await fetch(`${API}/driver/payment`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ payment_status: "PAID" })
              });

              const data = await res.json();
              alert(data.message || data.error);

              if (data.success) {
                setDetails({
                  ...details,
                  payment_status: "PAID"
                });
              }
            }}
          >
            ✅ Mark Payment Received
          </button>
        )}
    </div>

    {/* DELIVERY COMPLETE */}
    <div className="card complete">
      <h3>✅ Complete Delivery</h3>

      <input
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="otp-input"
      />

      <button
        className="btn big primary"
        onClick={async () => {
          const res = await fetch(`${API}/driver/complete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ otp })
          });

          const data = await res.json();
          alert(data.message || data.error);

          if (res.ok) setDelivered(true);
        }}
      >
        🚀 Mark Delivered
      </button>
    </div>

  </div>
);
};

export default DriverTracking;