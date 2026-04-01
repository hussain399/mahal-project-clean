import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

const MahalStealDeals = () => {
  const scrollRef = useRef(null);

  const [pause, setPause] = useState(false);
  const [cart, setCart] = useState({});
  const [deals, setDeals] = useState([]);
  const [startIndex, setStartIndex] = useState(0); // ✅ control window
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/deals`);

        const formatted = (res.data || []).map((item) => ({
          id: item.id,
          dealTitle: item.deal_title,
          name: item.name,
          qty: item.qty,
          price: item.price,
          oldPrice: item.old_price,
          img: item.image
            ? item.image.startsWith("http")
              ? item.image.replace("127.0.0.1", "localhost")
              : `data:image/jpeg;base64,${item.image}`
            : `${API_BASE}/static/products/default.png`,
        }));

        setDeals(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  /* ================= AUTO CHANGE (3 sec) ================= */
  useEffect(() => {
    if (deals.length === 0) return;

    const interval = setInterval(() => {
      if (pause) return;

      setStartIndex((prev) => {
        const next = prev + 1;
        return next >= deals.length ? 0 : next;
      });
    }, 300000); // ✅ 3 seconds

    return () => clearInterval(interval);
  }, [deals, pause]);

  /* ================= GET 8 ITEMS ================= */
  const visibleDeals = deals.slice(startIndex, startIndex + 8);

  /* loop fix (end lo break avvakunda) */
  if (visibleDeals.length < 8 && deals.length > 0) {
    visibleDeals.push(...deals.slice(0, 8 - visibleDeals.length));
  }

  /* ================= CART ================= */
  const addItem = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const removeItem = (item) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[item.id] === 1) delete updated[item.id];
      else updated[item.id] -= 1;
      return updated;
    });
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-5">
      <h3 className="mm-steal-title">Steal deals for you</h3>

      <div
        className="mm-steal-row"
        ref={scrollRef}
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
      >
        {loading && <p>Loading deals...</p>}

        {!loading &&
          visibleDeals.map((d) => (
            <div className="mm-deal-card" key={d.id}>
              
              <div className="mm-deal-title-badge">
                {d.dealTitle}
              </div>

              <div className="mm-deal-body">
                <span className="mm-deal-qty">{d.qty}</span>

                <div className="mm-deal-img">
                  <img
                    src={d.img}
                    alt={d.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${API_BASE}/static/products/default.png`;
                    }}
                  />
                </div>

                <h4 className="mm-deal-title">{d.name}</h4>

                <div className="mm-deal-price">
                  <span className="mm-old-price">₹{d.oldPrice}</span>
                  <span className="mm-new-price">₹{d.price}</span>
                </div>

                {!cart[d.id] ? (
                  <button
                    className="mm-add-btn"
                    onClick={() => addItem(d)}
                  >
                    +
                  </button>
                ) : (
                  <div className="mm-stepper">
                    <button onClick={() => removeItem(d)}>-</button>
                    <span>{cart[d.id]}</span>
                    <button onClick={() => addItem(d)}>+</button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MahalStealDeals;