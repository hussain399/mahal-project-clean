import React, { useEffect, useState } from "react";
import axios from "axios";
import "../pages/css/AdminPromotionReview.css";
import { useOutletContext } from "react-router-dom";

const API = "http://127.0.0.1:5000/api/v1";

const AdminPromotionReview = () => {
//   const { id } = useParams();
  const promoId = localStorage.getItem("review_promo_id");
  const { setActiveView } = useOutletContext();
  const [editMode, setEditMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [promotion, setPromotion] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    axios.get(`${API}/admin/promotions/supplier/${promoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setPromotion(res.data));
  }, [promoId]);

  useEffect(() => {
    if (!promotion?.target_ids) return;

    axios.get(`${API}/admin/products/by-ids`, {
        params: { ids: promotion.target_ids.join(",") }
    }).then(res => setProducts(res.data));
  }, [promotion]);

  const decision = async (action) => {
    const token = localStorage.getItem("admin_token");

    if (action === "REJECT" && !reason.trim()) {
        alert("Please enter rejection reason");
        return;
    }

    await axios.post(
      `${API}/admin/promotions/supplier/${promoId}/decision`,
      {
        action,
        priority_level: promotion.priority_level,
        bid_amount: promotion.bid_amount,
        decision_reason: action === "REJECT" ? reason : null
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    localStorage.removeItem("review_promo_id");
    setActiveView("promotionRequests");
  };

  if (!promotion) return <div>Loading...</div>;

  return (
    <div className="review_container">
      <div className="review_card">

        <h2>Promotion Review</h2>

        <div className="review_section">
          <p><strong>Supplier:</strong> {promotion.company_name_english} (ID: {promotion.supplier_ids})</p>
          <p><strong>Target Type:</strong> {promotion.target_type}</p>
        </div>

        <div className="review_section">
          <h4>Products</h4>
          {products.map(p => (
            // <p key={p.product_id}>
            <p>{p.product_name_english} (ID: {p.product_id}) </p>
          ))}
        </div>

        <div className="review_section">
          <h4>Content</h4>
          <p><strong>Title:</strong> {promotion.title}</p>
          <p><strong>Headline:</strong> {promotion.headline}</p>
          <p><strong>Description:</strong> {promotion.description}</p>
          <p><strong>Cities:</strong> {promotion.location_values?.join(", ")}</p>
        </div>

        <div className="review_section">
          {promotion.image_url && (
            <div className="banner_preview">
              <img src={promotion.image_url} alt="Banner" />
            </div>
          )}
        </div>

        <div className="review_section">
          <p><strong>Offer:</strong> {promotion.offer_type} - {promotion.offer_value}</p>
          {/* <p><strong>Priority:</strong> {promotion.priority_level}</p> */}
          {editMode ? (
            <input
              value={promotion.priority_level}
              onChange={(e) =>
                setPromotion({...promotion, priority_level: e.target.value})
              }
            />
          ) : (
            <p><strong>Priority:</strong> {promotion.priority_level}</p>
          )}
          {/* <p><strong>Bid:</strong> QAR{promotion.bid_amount}</p> */}
          {editMode ? (
            <input
              type="number"
              value={promotion.bid_amount}
              onChange={(e) =>
                setPromotion({
                  ...promotion,
                  bid_amount: e.target.value
                })
              }
            />
          ) : (
            <p><strong>Bid:</strong> QAR{promotion.bid_amount}</p>
          )}
          {/* <p><strong>Start:</strong> {promotion.start_date}</p> */}
          <p><strong>Start:</strong> {new Date(promotion.start_date).toLocaleDateString()}</p>
          <p><strong>End:</strong> {promotion.end_date}</p>
        </div>

        <div className="review_actions">
          <button 
            className="approve_btn"
            onClick={() => decision("APPROVE")}
          >
            Approve
          </button>

          <button 
            className="reject_btn"
            onClick={() => setEditMode(true)}
          >
            Reject
          </button>

        </div>

        {editMode && (
          <div className="reject_section">
            <textarea
              placeholder="Enter rejection reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <button
              className="confirm_reject_btn"
              onClick={() => decision("REJECT")}
            >
              Confirm Reject
            </button>

            <button
              className="cancel_btn"
              onClick={() => {
                setEditMode(false);
                setReason("");
              }}
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPromotionReview;