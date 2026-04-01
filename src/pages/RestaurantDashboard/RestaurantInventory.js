import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/restaurant_inventory.css";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaShoppingCart } from "react-icons/fa";

const API = "http://127.0.0.1:5000/api/inventory";
const CART_API = "http://127.0.0.1:5000/api/cart/add";

const RestaurantInventory = () => {

  const restaurantId = localStorage.getItem("linked_id");
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Issue modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [issueQty, setIssueQty] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [issuing, setIssuing] = useState(false);

  // Reorder modal
  const [reorderItemData, setReorderItemData] = useState(null);
  const [reorderQty, setReorderQty] = useState(1);
  const [reordering, setReordering] = useState(false);

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");


  /* ================= FETCH INVENTORY ================= */
  useEffect(() => {
    if (!restaurantId) return;

    axios
      .get(`${API}/restaurant/stock?restaurant_id=${restaurantId}`)
      .then(res => {
        setItems(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  }, [restaurantId]);


  /* ================= SUMMARY ================= */
  const totalQty = items.reduce(
    (sum, i) => sum + Number(i.available_qty || 0),
    0
  );

  const lowStockCount = items.filter(
    i => Number(i.available_qty) > 0 && Number(i.available_qty) < 10
  ).length;


  if (loading) return <div className="inv-loading">Loading inventory…</div>;


  /* ================= FILTER ================= */
  const filteredItems = items.filter(item => {

    const qty = Number(item.available_qty || 0);

    const name = (item.product_name || "").toLowerCase();
    const query = search.trim().toLowerCase();

    const matchesSearch = name.includes(query);

    const matchesStock =
      stockFilter === "ALL" ||
      (stockFilter === "IN" && qty >= 10) ||
      (stockFilter === "LOW" && qty > 0 && qty < 10) ||
      (stockFilter === "OUT" && qty <= 0);

    return matchesSearch && matchesStock;

  });


  /* ================= REORDER CONFIRM ================= */
  const confirmReorder = async () => {
    try {

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      setReordering(true);

      await axios.post(
        CART_API,
        {
          product_id: reorderItemData.product_id,
          quantity: reorderQty,
          price: Number(reorderItemData.price || 0)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Added to cart");
      setReorderItemData(null);

      navigate("/restaurantdashboard/cartview");

    } catch (err) {
      console.error(err);
      alert("Failed to reorder");
    } finally {
      setReordering(false);
    }
  };


  return (
    <div className="inv-wrapper">

      {/* HEADER */}
      <div className="inv-header">
        <h2>📦 Restaurant Inventory</h2>
        <span className="inv-subtitle">Real-time stock snapshot</span>
      </div>


      {/* FILTERS */}
      <div className="inv-filters">

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="IN">In Stock</option>
          <option value="LOW">Low Stock</option>
          <option value="OUT">Out of Stock</option>
        </select>

      </div>


      {/* SUMMARY */}
      <div className="inv-summary">

        <div className="summary-card">
          <span>Total Products</span>
          <b>{items.length}</b>
        </div>

        <div className="summary-card">
          <span>Total Quantity</span>
          <b>{totalQty.toFixed(2)}</b>
        </div>

        <div className="summary-card warning">
          <span>Low Stock</span>
          <b>{lowStockCount}</b>
        </div>

      </div>


      {/* GRID */}
      <div className="inv-grid">

        {filteredItems.map(item => {

          const qty = Number(item.available_qty || 0);

          let status = "IN STOCK";
          let statusclass = "ok";

          if (qty <= 0) {
            status = "OUT OF STOCK";
            statusclass = "danger";
          } else if (qty < 10) {
            status = "LOW STOCK";
            statusclass = "warning";
          }

          return (
            <div
              className={`inv-card ${statusclass}`}
              key={item.product_id}
            >

              {/* IMAGE */}
              <div className="inv-image">
                <img
                  src={
                    item.product_image
                      ? `data:image/png;base64,${item.product_image}`
                      : "/placeholder-product.png"
                  }
                  alt={item.product_name}
                />
              </div>


              {/* INFO */}
              <div className="inv-info">

                <h4>{item.product_name}</h4>

                <div className="inv-qty">
                  {qty.toFixed(2)}
                </div>

                <div className="inv-actions">

                  <span className={`status ${statusclass}`}>
                    {status}
                  </span>

                 {/* ISSUE */}
                  <button
                    className="action-btn issue-modern"
                    disabled={qty <= 0}
                    onClick={() => {
                      setSelectedItem(item);
                      setIssueQty(1);
                      setRemarks("");
                    }}
                  >
                    <FaUtensils className="btn-icon" />
                    Issue to Kitchen
                  </button>


                  {/* REORDER */}
                  <button
                    className="action-btn reorder-modern"
                    onClick={() => {
                      const suggested = qty < 10 ? 20 - qty : 10;
                      setReorderItemData(item);
                      setReorderQty(suggested);
                    }}
                  >
                    <FaShoppingCart className="btn-icon" />
                    Reorder
                  </button>


                </div>

              </div>

            </div>
          );

        })}

      </div>


      {/* ================= ISSUE MODAL ================= */}
      {selectedItem && (

        <div className="inv-modal-backdrop">

          <div className="inv-modal">

            <h3>Issue to Kitchen</h3>

            <p><b>{selectedItem.product_name}</b></p>

            <label>Quantity</label>
            <input
              type="number"
              min="1"
              max={selectedItem.available_qty}
              value={issueQty}
              onChange={e =>
                setIssueQty(
                  Math.min(
                    Number(e.target.value),
                    selectedItem.available_qty
                  )
                )
              }
            />

            <label>Remarks</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />

            <div className="modal-actions">

              <button
                className="btn cancel"
                onClick={() => setSelectedItem(null)}
              >
                Cancel
              </button>

              <button
                className="btn_save"
                disabled={issuing}
                onClick={async () => {

                  try {

                    setIssuing(true);

                    await axios.post(
                      `${API}/issue-to-kitchen`,
                      {
                        restaurant_id: restaurantId,
                        items: [
                          {
                            product_id: selectedItem.product_id,
                            quantity: issueQty
                          }
                        ],
                        remarks
                      }
                    );

                    setSelectedItem(null);
                    window.location.reload();

                  } catch {
                    alert("Failed to issue item");
                  } finally {
                    setIssuing(false);
                  }

                }}
              >
                {issuing ? "Issuing…" : "Issue"}
              </button>

            </div>

          </div>

        </div>
      )}


      {/* ================= REORDER MODAL ================= */}
      {reorderItemData && (

        <div className="inv-modal-backdrop">

          <div className="inv-modal">

            <h3>Reorder Product</h3>

            <p><b>{reorderItemData.product_name}</b></p>

            <p>
              Current Stock:
              {" "}
              {Number(
                reorderItemData.available_qty
              ).toFixed(2)}
            </p>

            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={reorderQty}
              onChange={(e) =>
                setReorderQty(Number(e.target.value))
              }
            />

            <div className="modal-actions">

              <button
                className="btn cancel"
                onClick={() => setReorderItemData(null)}
              >
                Cancel
              </button>

              <button
                className="btn_save"
                disabled={reordering}
                onClick={confirmReorder}
              >
                {reordering ? "Ordering..." : "Reorder"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default RestaurantInventory;
