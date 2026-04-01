import React from "react";

const ModificationRequestDetails = ({ request, onBack, onDecision }) => {
  if (!request) return null;

  const originalItems = request.original_items || [];
  const modifiedItems = request.modified_items || [];

  return (
    <div className="dashboard_page">

      {/* HEADER */}
      <div className="page_header">
        <h2>Modification Request</h2>
        <button className="btn_add_item_v2" onClick={onBack}>
          <i className="fa fa-arrow-left me-2"></i>Back
        </button>
      </div>

      {/* SUMMARY */}
      <div className="card order_summary">
        <div className="summary_left">
          <p><b>Order ID:</b> {request.order_id}</p>
          <p><b>Reason:</b> {request.note}</p>

          <span className="status_badge warning">
            Pending Approval
          </span>
        </div>
          <div className="summary_right">
        <span>Before</span>
        <h4>QAR {request.total_before}</h4>

        <span className="mt-2 d-block">After</span>
        <h3
            className={
            request.total_after < request.total_before
                ? "text-danger"
                : "text-success"
            }
        >
            QAR {request.total_after}
        </h3>
        </div>
      </div>


      {/* ITEMS COMPARISON */}
      <div className="row mt-4">

        {/* ORIGINAL */}
        <div className="col-md-6">
          <div className="card">
            <h5 className="card_title">Original Items</h5>
            <table className="table order_table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th className="text-end">Price</th>
                </tr>
              </thead>
              <tbody>
                {originalItems.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.product_name_english}</td>
                    <td>{i.quantity}</td>
                    <td className="text-end">
                      QAR {i.price_per_unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODIFIED */}
        <div className="col-md-6">
          <div className="card">
            <h5 className="card_title">Modified Items</h5>
            <table className="table order_table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th className="text-end">Price</th>
                </tr>
              </thead>
              <tbody>
                {modifiedItems.map((i, idx) => {
                  const oldQty = originalItems[idx]?.quantity;
                  const qtyChanged = oldQty !== i.quantity;

                  return (
                    <tr key={idx}>
                      <td>{i.product_name_english}</td>
                      <td className={qtyChanged ? "text-danger fw-bold" : ""}>
                        {i.quantity}
                      </td>
                      <td className="text-end">
                        QAR {i.price_per_unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="cta_bar">
        <button
          className="btn btn-outline-danger btn-lg"
          onClick={() => onDecision(request.id, "REJECTED")}
        >
          Reject Changes
        </button>

        <button
          className="btn btn-success btn-lg"
          onClick={() => onDecision(request.id, "APPROVED")}
        >
          Accept Changes
        </button>
      </div>
    </div>
  );
};

export default ModificationRequestDetails;
