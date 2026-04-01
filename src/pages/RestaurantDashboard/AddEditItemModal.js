import React, { useState, useEffect } from "react";

const AddEditItemModal = ({ show, onClose, onSave, item }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setPrice(item.price);
    } else {
      setName("");
      setCategory("Main Course");
      setPrice("");
    }
  }, [item]);

  if (!show) return null;

  const handleSubmit = () => {
    if (!name || !price) return;

    onSave({
      name,
      category,
      price: Number(price),
    });
  };

  return (
    <div className="modal_overlay">
      <div className="modal_box">

        <h5 className="mb-3">
          {item ? "Edit Item" : "Add New Item"}
        </h5>

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="form-select mb-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Main Course</option>
          <option>Rice</option>
          <option>Desserts</option>
        </select>

        <input
          type="number"
          className="form-control mb-3"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <div className="modal_actions">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddEditItemModal;
