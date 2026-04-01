import React, { useEffect, useState } from "react";

const OfferModal = ({ product, offer, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [type, setType] = useState("");
  const [percentage, setPercentage] = useState("");
  const [flat, setFlat] = useState("");
  const [buyQty, setBuyQty] = useState("");
  const [getQty, setGetQty] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    const normalizeDate = (d) => {
      if (!d) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      const parsed = new Date(d);
      if (isNaN(parsed)) return "";
      return parsed.toISOString().split("T")[0];
    };

    if (offer) {
      setTitle(offer.offer_title || "");
      setDescription(offer.offer_description || "");
      setType(offer.offer_type || "");
      setPercentage(offer.discount_percentage || "");
      setFlat(offer.flat_amount || "");
      setBuyQty(offer.buy_quantity || "");
      setGetQty(offer.get_quantity || "");
      setStartDate(normalizeDate(offer.start_date));
      setEndDate(normalizeDate(offer.end_date));
      setStartTime(offer.start_time || "");
      setEndTime(offer.end_time || "");
      setIsInactive(offer.is_active === false);
    } else {
      setTitle("");
      setDescription("");
      setType("");
      setPercentage("");
      setFlat("");
      setBuyQty("");
      setGetQty("");
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setIsInactive(false);
    }
  }, [offer]);

  return (
    <div className="modal_overlay">
      {/* 🔥 SAME STRUCTURE AS EditInventoryModal */}
      <div className="modal_box large edit_modal">

        <h3 className="modal_title">
          {offer ? "Edit Offer" : "Create Offer"}
        </h3>
        <p className="product_name">{product.name}</p>

        {/* Offer Title */}
        <div className="form_group">
          <label>Offer Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="form_group">
          <label>Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Offer Type */}
        <div className="form_group">
          <label>Offer Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Select Offer Type</option>
            <option value="Percentage">Percentage</option>
            <option value="Flat">Flat</option>
            <option value="BOGO">BOGO</option>
          </select>
        </div>

        {type === "Percentage" && (
          <div className="form_group">
            <label>Discount Percentage (%)</label>
            <input
              type="number"
              min="1"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
          </div>
        )}

        {type === "Flat" && (
          <div className="form_group">
            <label>Flat Discount Amount</label>
            <input
              type="number"
              min="1"
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
            />
          </div>
        )}

        {type === "BOGO" && (
          <>
            <div className="form_group">
              <label>Buy Quantity</label>
              <input
                type="number"
                min="1"
                value={buyQty}
                onChange={(e) => setBuyQty(e.target.value)}
              />
            </div>

            <div className="form_group">
              <label>Get Quantity</label>
              <input
                type="number"
                min="1"
                value={getQty}
                onChange={(e) => setGetQty(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Dates */}
        <div className="form_group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form_group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="form_group">
          <label>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="form_group">
          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        {offer && (
          <>
            <div className="offer_status">
              Status: <b>{offer.offer_status}</b>
            </div>

            <div className="form_group">
              <label>
                <input
                  type="checkbox"
                  checked={isInactive}
                  onChange={(e) => setIsInactive(e.target.checked)}
                />
                Deactivate / Activate this offer
              </label>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="modal_actions">
          <button className="btn cancel" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn save"
            onClick={() =>
              onSave({
                product_id: product.product_id,
                title,
                description,
                offer_type: type,
                discount_percentage: percentage,
                flat_amount: flat,
                buy_quantity: buyQty,
                get_quantity: getQty,
                start_date: startDate,
                end_date: endDate,
                start_time: startTime,
                end_time: endTime,
                is_active: !isInactive,
              })
            }
          >
            {offer ? "Update Offer" : "Create Offer"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OfferModal;
