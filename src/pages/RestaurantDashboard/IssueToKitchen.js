import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/issue_to_kitchen.css";
import { useSearchParams } from "react-router-dom";
const API = "http://127.0.0.1:5000/api/inventory";

const IssueToKitchen = () => {
  const restaurantId = localStorage.getItem("linked_id");
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [issueMap, setIssueMap] = useState({});
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  

  // LOAD INVENTORY
  useEffect(() => {
    axios
      .get(`${API}/restaurant/stock?restaurant_id=${restaurantId}`)
      .then(res => {
        setItems(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [restaurantId]);

  // UPDATE QTY (KEYED BY product_id)
  const updateQty = (productId, value, max) => {
    if (value < 0 || value > max) return;
    setIssueMap(prev => ({ ...prev, [productId]: value }));
  };

  const totalQty = Object.values(issueMap).reduce(
    (sum, qty) => sum + Number(qty || 0),
    0
  );

  const totalItems = Object.values(issueMap).filter(q => q > 0).length;

  // SUBMIT ISSUE
  const submitIssue = async () => {
    const payload = Object.entries(issueMap)
      .filter(([_, qty]) => qty > 0)
      .map(([product_id, quantity]) => ({
        product_id: Number(product_id),
        quantity
      }));

    if (!payload.length) {
      alert("Please issue at least one item");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API}/issue-to-kitchen`, {
        restaurant_id: restaurantId,
        items: payload,
        remarks
      });

      navigate("/restaurantdashboard/inventory");
    } catch (e) {
      console.error(e);
      alert("Failed to issue items");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="issue-loading">Loading inventory…</div>;

  return (
    <div className="issue-container">
      {/* HEADER */}
      <div className="issue-header">
        <h2>🍳 Issue to Kitchen</h2>
        <p>Distribute ingredients for daily operations</p>
      </div>

      {/* ITEMS */}
      {/* ITEMS */}
<div className="issue-table-wrapper">
  <table className="issue-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Available</th>
        <th>Issue Qty</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {items.map(item => {
        const available = Number(item.available_qty || 0);
        const issued = issueMap[item.product_id] || 0;

        return (
          <tr key={item.product_id}>
            <td className="item-name">{item.product_name}</td>

            <td className="available">
              {available.toFixed(2)}
            </td>

            <td>
              <input
                type="number"
                min="0"
                max={available}
                value={issued}
                onChange={e =>
                  updateQty(
                    item.product_id,
                    Number(e.target.value),
                    available
                  )
                }
              />
            </td>

            <td className="qty-actions">
              <button
                onClick={() =>
                  updateQty(item.product_id, issued - 1, available)
                }
              >
                −
              </button>
              <button
                onClick={() =>
                  updateQty(item.product_id, issued + 1, available)
                }
              >
                +
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>


      {/* REMARKS */}
      <div className="remarks">
        <label>Remarks</label>
        <textarea
          placeholder="Optional notes for kitchen staff"
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
        />
      </div>

      {/* FOOTER */}
      <div className="issue-footer">
        <div className="summary">
          <b>{totalItems}</b> items • <b>{totalQty.toFixed(2)}</b> qty
        </div>

        <div className="actions">
            <button
            className="btn_save"
            disabled={submitting}
            onClick={submitIssue}
          >
            {submitting ? "Issuing…" : "Issue to Kitchen"}
          </button>
          <button className="btn cancel" onClick={() => navigate(-1)}>
            Cancel
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default IssueToKitchen;

