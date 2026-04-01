import React from "react";

const ProductActionsModal = ({ product, onClose, onEdit, onDeactivate,onEditOffer }) => {
  return (
    <div className="modal_overlay">
      <div className="modal_box action_modal">

        <h3 className="modal_title">Product Actions</h3>
        <p className="product_name">{product.name}</p>

        <button className="action_btn edit_btn" onClick={onEdit}>
          <i className="fas fa-pen"></i>
          Edit Inventory
        </button>

        <button className="action_btn deactivate_btn" onClick={onDeactivate}>
          <i className="fas fa-ban"></i>
          Deactivate Product
        </button>

        <button
          className="action_btn offer_btn"
          onClick={() => onEditOffer(product)}
        >
          <i className="fas fa-tags"></i>
          Manage Offer
        </button>


        <button className="action_btn close_btn" onClick={onClose}>
          <i className="fas fa-times"></i>
          Close
        </button>

      </div>
    </div>
  );
};

export default ProductActionsModal;
