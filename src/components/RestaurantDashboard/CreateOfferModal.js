import React, { useState } from "react";

const CreateOfferModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("category");

  return (
    <div className="modal_overlay">
      <div className="offer_modal modern">

        {/* HEADER */}
        <div className="modal_header">
          <h3>Create Offer</h3>
          <button className="close_btn" onClick={onClose}>×</button>
        </div>

        {/* TABS */}
        <div className="offer_tabs pill_tabs">
          <button
            className={activeTab === "category" ? "active" : ""}
            onClick={() => setActiveTab("category")}
          >
            Category Offer
          </button>

          <button
            className={activeTab === "product" ? "active" : ""}
            onClick={() => setActiveTab("product")}
          >
            Product Offer
          </button>
        </div>

        {/* BODY */}
        <div className="modal_body form_stack">

          {activeTab === "category" && (
            <>
              <div className="form_group">
                <label>Category</label>
                <select>
                  <option>Select Category</option>
                </select>
              </div>

              <div className="form_group">
                <label>Sub Category</label>
                <select>
                  <option>Select Sub Category</option>
                </select>
              </div>
            </>
          )}

          {activeTab === "product" && (
            <div className="form_group">
              <label>Select Products</label>
              <select>
                <option>Select Product</option>
              </select>
            </div>
          )}

          <div className="form_group">
            <label>Discount Percentage (%)</label>
            <input type="number" placeholder="Eg: 10" />
          </div>

          <div className="two_col">
            <div className="form_group">
              <label>Start Date</label>
              <input type="date" />
            </div>

            <div className="form_group">
              <label>End Date</label>
              <input type="date" />
            </div>
          </div>

          <div className="form_group">
            <label>Offer Title</label>
            <input type="text" placeholder="Eg: Weekend Super Saver" />
          </div>

          <div className="form_group">
            <label>Offer Description</label>
            <textarea
              rows="2"
              className="resizable_textarea"
              placeholder="Short description about the offer"
            />
          </div>

          <div className="checkbox_row modern_check">
            <input type="checkbox" id="featured" />
            <label htmlFor="featured">Set as Featured Offer</label>
          </div>

          <button className="btn_save glow full">
            Save Offer
          </button>

        </div>
      </div>
    </div>
  );
};

export default CreateOfferModal;
