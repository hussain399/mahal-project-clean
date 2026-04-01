import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../pages/css/SupplierPromotionReview.css";

const SupplierPromotionReview = () => {
  const { promoId } = useParams();
  const [promotion, setPromotion] = useState(null);
  const [products, setProducts] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:5000/api/v1/promotions/${promoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPromotion(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (promoId && token) {
      fetchPromotion();
    }
  }, [promoId, token]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:5000/api/v1/promotions/${promoId}/products`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (promoId && token) {
      fetchProducts();
    }
  }, [promoId, token]);

  const acceptPromotion = async () => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/api/v1/supplier/promotions/${promoId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
      window.location.reload();

      // fetchPromotion(); // 🔥 Refresh status
    } catch (err) {
      console.log(err);
    }
  };

  const rejectPromotion = async () => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/api/v1/supplier/promotions/${promoId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
      window.location.reload();

      // fetchPromotion(); // 🔥 Refresh status
    } catch (err) {
      console.log(err);
    }
  };

  if (!promotion) return <p>Loading...</p>;

  return (
    <div className="supplier-promo-page">
      <div className="supplier-promo-card">

        <div className="promo-header">
          <div className="promo-title">{promotion.title}</div>
          <div className={`status-badge status-${promotion.supplier_status?.toLowerCase()}`}>
            {promotion.supplier_status}
          </div>
        </div>

        <div className="promo-section">
          <p className="promo-description">{promotion.description}</p>
        </div>

        <div className="promo-grid">

          <div className="grid-box">
            <p>Headline</p>
            <p>{promotion.headline || "-"}</p>
          </div>

          <div className="grid-box">
            <p>Priority Level</p>
            <p>{promotion.priority_level || "-"}</p>
          </div>

          <div className="grid-box">
            <p>Offer Type</p>
            <p>{promotion.offer_type}</p>
          </div>

          <div className="grid-box">
            <p>Offer Value</p>
            <p>{promotion.offer_value}</p>
          </div>

          <div className="grid-box">
            <p>Start Date</p>
            <p>{promotion.start_date}</p>
          </div>

          <div className="grid-box">
            <p>End Date</p>
            <p>{promotion.end_date}</p>
          </div>

        </div>

        {/* Products Section */}
        <div className="products-section">
          <h3>Promotion Products</h3>

          <div className="products-grid">
            {products.map((p) => (
              <div className="product-card" key={p.id}>

                <div className="product-image-wrapper">

                  {p.images?.[0] && (
                    <img src={p.images[0]} alt="" className="product-image" />
                  )}

                  <div className="su-offer-badge">
                    {p.offer_type === "PERCENTAGE"
                      ? `${p.offer_value}% OFF`
                      : `QAR${p.offer_value} OFF`}
                  </div>
                </div>

                {/* {p.images?.[0] && (
                  <img src={p.images[0]} alt="" className="product-image" />
                )} */}

                <div className="product-name">{p.name}</div>

                <div className="product-price">
                  <span className="original-price">
                    QAR{p.original_price}
                  </span>
                  <span className="discounted-price">
                    QAR{p.discounted_price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* {promotion.supplier_status === "INVITED" && ( */}
        {promotion.supplier_status?.toUpperCase() === "INVITED" && (
          // <div className="button-row">
          //   <button className="promo-btn promo-btn-accept" onClick={acceptPromotion}>
          //     Accept Promotion
          //   </button>
          //   <button className="promo-btn promo-btn-reject" onClick={rejectPromotion}>
          //     Reject
          //   </button>
          // </div>

          <div className="promo-actions">
            <button className="btn-corporate btn-accept" onClick={acceptPromotion}>
              Accept
            </button>

            <button className="btn-corporate btn-reject" onClick={rejectPromotion}>
              Reject
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SupplierPromotionReview;