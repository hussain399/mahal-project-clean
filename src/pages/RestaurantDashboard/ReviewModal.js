import React, { useEffect, useState } from "react";
import axios from "axios";

const ReviewModal = ({ order, onClose }) => {
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [reviewImage, setReviewImage] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  /* ================= LOAD ORDER ITEMS ================= */
  useEffect(() => {
    axios
      .get(
        `http://127.0.0.1:5000/api/v1/orders/restaurant/orders/${order.order_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => setItems(res.data?.items || []))
      .catch(() => alert("Failed to load order items"));
  }, [order, token]);

  /* ================= LOAD REVIEWS ================= */
  const loadReviews = () => {
    setLoadingReviews(true);

    axios
      .get("http://127.0.0.1:5000/api/reviews/restaurant", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setReviews(res.data || []))
      .finally(() => setLoadingReviews(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  /* ================= SUBMIT REVIEW ================= */
  const submitReview = async () => {
    if (!selectedItem) {
      alert("Please select a product");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("product_id", selectedItem);

      formData.append(
        "product_name",
        items.find((i) => i.product_id === Number(selectedItem))
          ?.product_name_english
      );

      formData.append("order_id", order.order_id);
      formData.append("rating", rating);
      formData.append("review_text", reviewText);

      /* ✅ Add Image */
      if (reviewImage) {
        formData.append("review_image", reviewImage);
      }

      await axios.post("http://127.0.0.1:5000/api/reviews", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("⭐ Review submitted successfully!");

      setSelectedItem("");
      setRating(5);
      setReviewText("");
      setReviewImage(null);

      loadReviews();
      onClose(); // auto close modal
    } catch (err) {
      alert(err.response?.data?.error || "Review submission failed");
    }
  };

  return (
    <div className="modal_overlay">
      <div className="order_modal">
        {/* HEADER */}
        <div className="modal_header">
          <h4>Submit Review</h4>
          <button onClick={onClose}>✖</button>
        </div>

        {/* ORDER INFO */}
        <div className="info_grid">
          <div>
            <b>Order ID</b>
            <span>{order.order_id}</span>
          </div>

          <div>
            <b>Supplier</b>
            <span>{order.supplier_name}</span>
          </div>

          <div>
            <b>Total</b>
            <span>QAR {order.total_amount}</span>
          </div>
        </div>

        {/* REVIEW FORM */}
        <div className="card">
          <h5>Review Products</h5>

          {/* PRODUCT SELECT */}
          <label>Select Product</label>
          <select
            className="form-control mb-2"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            <option value="">-- Select Product --</option>
            {items.map((i) => (
              <option key={i.product_id} value={i.product_id}>
                {i.product_name_english}
              </option>
            ))}
          </select>

          {/* RATING */}
          <label>Rating</label>
          <select
            className="form-control mb-2"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} {"⭐".repeat(r)}
              </option>
            ))}
          </select>

          {/* REVIEW TEXT */}
          <label>Review Text</label>
          <textarea
            className="form-control mb-2"
            placeholder="Write your feedback..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          {/* IMAGE UPLOAD */}
          <label>Upload Photo</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() =>
                document.getElementById("reviewFile").click()
              }
            >
              📷 Upload
            </button>

            <input
              type="file"
              id="reviewFile"
              style={{ display: "none" }}
              accept="image/*"
              onChange={(e) => setReviewImage(e.target.files[0])}
            />

            {reviewImage && <span>{reviewImage.name}</span>}
          </div>

          {/* SUBMIT */}
          <button className="btn accept mt-3" onClick={submitReview}>
            Submit Review
          </button>
        </div>

        {/* REVIEWS LIST */}
        <div className="card">
          <h5>My Submitted Reviews</h5>

          {loadingReviews && <p>Loading reviews...</p>}

          <table className="mini_table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Photo</th>
              </tr>
            </thead>

            <tbody>
              {reviews
                .filter((r) => r.order_id === order.order_id)
                .map((r) => (
                  <tr key={r.review_id}>
                    <td>{r.product_name}</td>

                    <td>
                      {r.rating} {"⭐".repeat(r.rating)}
                    </td>

                    <td>{r.review_text || "-"}</td>

                    {/* IMAGE */}
                    <td>
                      <img
                        src={`http://127.0.0.1:5000/api/reviews/image/${r.review_id}`}
                        alt="review"
                        width="60"
                        style={{ borderRadius: "8px" }}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* ACTIONS */}
        <div className="modal_actions">
          <button className="btn reject" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;