import React from "react";

const API = "http://127.0.0.1:5000/api/v1/restaurant/invoices";

const RestaurantInvoiceDetailsModal = ({ invoice, onClose }) => {
  const token = localStorage.getItem("token");

  const downloadPDF = async () => {
    const invoiceId =
      invoice?.header?.invoice_id || invoice?.header?.invoice_number;

    if (!invoiceId) {
      alert("Invoice ID not found");
      return;
    }

    try {
      const res = await fetch(`${API}/${invoiceId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceId}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download invoice PDF");
    }
  };

  if (!invoice) return null;

  return (
    <div className="modal_overlay">
      <div className="order_modal">
        {/* HEADER */}
        <div className="modal_header">
          <h4>Invoice Details</h4>
          <button onClick={onClose}>✖</button>
        </div>

        {/* ACTION */}
        <div className="modal_actions">
          <button className="btn accept" onClick={downloadPDF}>
            ⬇️ Download Invoice PDF
          </button>
        </div>

        {/* SUMMARY */}
        <div className="info_grid">
          <div>
            <b>Invoice</b>
            <span>{invoice.header.invoice_number}</span>
          </div>
          <div>
            <b>Order</b>
            <span>{invoice.header.order_id}</span>
          </div>
          <div>
            <b>Status</b>
            <span className={`status ${invoice.header.invoice_status}`}>
              {invoice.header.invoice_status}
            </span>
          </div>
          <div>
            <b>Total</b>
            <span>QAR {invoice.header.grand_total}</span>
          </div>
        </div>

        {/* SUPPLIER */}
        <div className="card">
          <h5>Supplier Details</h5>
          <div className="info_grid">
            <div>
              <b>Name</b>
              <span>{invoice.header.supplier_name}</span>
            </div>
            <div>
              <b>Contact</b>
              <span>{invoice.header.supplier_contact_name}</span>
            </div>
            <div>
              <b>Mobile</b>
              <span>{invoice.header.supplier_contact_mobile}</span>
            </div>
            <div>
              <b>Email</b>
              <span>{invoice.header.supplier_email}</span>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="card">
          <h5>Items</h5>
          <table className="mini_table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((i, idx) => (
                <tr key={idx}>
                  <td>{i.product_name_english}</td>
                  <td>{i.quantity}</td>
                  <td>{i.price_per_unit}</td>
                  <td>{i.discount}</td>
                  <td>{i.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInvoiceDetailsModal;
