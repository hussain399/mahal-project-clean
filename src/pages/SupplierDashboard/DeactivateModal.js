const DeactivateModal = ({ product, onClose,onConfirm }) => {
  return (
    <div className="modal_overlay">
      <div className="modal_box">

        <span className="product_title">{product.name}?</span>
        <h3>Deactivate Product</h3>
        <p>Are you sure you want to deactivate</p>
        

        <div className="modal_actions">
          <button className="btn cancel" onClick={onClose}>Cancel</button>
          <button className="btn deactivate" onClick={onConfirm}>
  Yes, Deactivate
</button>

        </div>
      </div>
    </div>
  );
};

export default DeactivateModal;
