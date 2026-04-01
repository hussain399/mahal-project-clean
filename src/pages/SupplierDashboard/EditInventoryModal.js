import React, { useState } from "react";
import { useEffect } from "react";

const EditInventoryModal = ({ product, onClose, onSave }) => {
  // 🔥 CONTROLLED STATES (THIS WAS MISSING)
  const [units, setUnits] = useState(product.units);
  const [price, setPrice] = useState(product.price);
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [moq, setMoq] = useState(product.moq);
  const [currency, setCurrency] = useState(product.currency);
  const [uom, setUom] = useState(product.uom);

  // 🖼️ IMAGE LOGIC (UNCHANGED)
  const [images] = useState(product.images || []);
  const [newImages, setNewImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...previews]);
  };
useEffect(() => {
  setExpiryDate(formatDateForInput(product.expiry_date));
  setExpiryTime(formatTimeForInput(product.expiry_time));
}, [product]);


  return (
    <div className="modal_overlay">
      <div className="modal_box large edit_modal">

        <h3 className="modal_title">Product Actions</h3>
        <p className="product_name">{product.name}</p>

        {/* Stock */}
        <div className="form_group">
          <label>Stock Quantity</label>
          <input
            type="number"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
          />
        </div>

        {/* Price */}
        <div className="form_group">
          <label>Price per unit</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Expiry Date */}
        <div className="form_group">
          <label>Expiry Date</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        {/* Expiry Time (UI only – backend optional) */}
        <div className="form_group">
          <label>Expiry Time</label>
          <input
            type="time"
            value={expiryTime}
            onChange={(e) => setExpiryTime(e.target.value)}
          />
        </div>

        {/* MOQ */}
        <div className="form_group">
          <label>Minimum Order Quantity</label>
          <input
            type="number"
            value={moq}
            onChange={(e) => setMoq(e.target.value)}
          />
        </div>

        {/* Currency */}
        <div className="form_group">
          <label>Currency</label>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>

        {/* UOM */}
        <div className="form_group">
          <label>Unit of Measure</label>
          <input
            value={uom}
            onChange={(e) => setUom(e.target.value)}
          />
        </div>

        {/* Existing Images */}
        <div className="form_group">
          <label>Existing Images</label>
          <div className="image_row">
            {images.map((img, i) => (
              <img key={i} src={img} alt="product" />
            ))}
            {newImages.map((img, i) => (
              <img key={i} src={img.preview} alt="new" />
            ))}
          </div>
        </div>

        {/* Upload */}
        <div className="form_group">
          <label className="upload_btn">
            Choose Images
            <input type="file" multiple hidden onChange={handleImageUpload} />
          </label>
        </div>

        {/* Actions */}
        <div className="modal_actions">
          <button className="btn cancel" onClick={onClose}>
            Back
          </button>

          <button
            className="btn save"
            onClick={() =>
              onSave({
                product_id: product.product_id,
                units,
                price,
                expiry_date: expiryDate,
                expiry_time: expiryTime,
                moq,
                currency,
                uom,
                images: newImages.map(img => img.file),
              })
            }
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};
const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

const formatTimeForInput = (time) => {
  if (!time) return "";
  // handles: "00:00:00", "00:00:00 GMT", "00:00"
  return time.substring(0, 5);
};

export default EditInventoryModal;
