import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../pages/css/SupplierPromotionList.css";

const API = "http://127.0.0.1:5000/api/v1";

const SupplierPromotionList = () => {

  const [promotions, setPromotions] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {

      const res = await axios.get(
        `${API}/supplier/promotions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("PROMOTIONS API:", res.data);

      setPromotions(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="promo-list-page">

      <h2>Promotion Review</h2>

      <table className="promo-table">

        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Offer</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {promotions.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign:"center" }}>
                No promotions found
              </td>
            </tr>
          )}

          {promotions.map((promo) => (
            <tr key={promo.promo_id}>

              <td>{promo.promo_id}</td>

              <td>{promo.title}</td>

              <td>
                {promo.offer_value}
                {promo.offer_type === "PERCENTAGE" ? "%" : "QAR"}
              </td>

              <td>{promo.start_date}</td>

              <td>{promo.end_date}</td>

              <td>
                <span className={`status ${promo.supplier_status}`}>
                  {promo.supplier_status}
                </span>
              </td>

              <td>
                <button
                  className="view-btn"
                  onClick={() =>
                    navigate(`/dashboard/promotion-review/${promo.promo_id}`)
                  }
                >
                  View
                </button>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
};

export default SupplierPromotionList;