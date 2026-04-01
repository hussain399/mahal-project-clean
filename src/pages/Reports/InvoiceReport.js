import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "jspdf-autotable";

const ITEMS_PER_PAGE = 5;

const InvoiceReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [invoiceFilter, setInvoiceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/reports/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data || []))
      .finally(() => setLoading(false));
  }, [token]);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return data.filter(
      (r) =>
        (invoiceFilter === "ALL" ||
          r.invoice_number === invoiceFilter) &&
        (statusFilter === "ALL" ||
          r.invoice_status === statusFilter)
    );
  }, [data, invoiceFilter, statusFilter]);

  /* ================= GROUP BY INVOICE ================= */
  const groupedInvoices = useMemo(() => {
    const map = new Map();

    filtered.forEach((row) => {
      if (!map.has(row.invoice_id)) {
        map.set(row.invoice_id, row);
      }
    });

    return Array.from(map.values());
  }, [filtered]);

  /* ================= PAGINATION ================= */
  const totalPages =
    Math.ceil(groupedInvoices.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedData = groupedInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= DOWNLOAD ================= */
  const download = async (type) => {
    const res = await axios.get(
      `http://127.0.0.1:5000/api/reports/invoices/${type}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          invoice: invoiceFilter,
          status: statusFilter,
        },
        responseType: "blob",
      }
    );

    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_report.${type === "excel" ? "xlsx" : "pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================= UI ================= */
  return (
    <div className="report_page">
      <div className="page_header glass">
        <h2>Invoice Report</h2>

        <div className="header_actions">
          <button
            className="btn dark bulk_btn"
            onClick={() => download("excel")}
          >
            ⬇ Excel
          </button>
          <button
            className="btn dark pdf_btn"
            onClick={() => download("pdf")}
          >
            ⬇ PDF
          </button>
        </div>
      </div>

      <div className="filter_bar advanced">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">All Status</option>
          {[...new Set(data.map((d) => d.invoice_status))].map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>
      </div>

      <div className="table_scroll">
        <table className="mini_table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Invoice No</th>
              <th>Order</th>
              <th>Date</th>
              <th>Restaurant</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Item Total</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Grand Total</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((r) => (
              <tr key={r.invoice_id}>
                <td>{r.invoice_id}</td>
                <td>{r.invoice_number}</td>
                <td>{r.order_id}</td>
                <td>
                  {new Date(r.invoice_date).toLocaleDateString()}
                </td>
                <td>{r.restaurant_name_english}</td>
                <td>{r.product_name_english}</td>
                <td>{r.quantity}</td>
                <td>{r.price_per_unit}</td>
                <td>{r.discount}</td>
                <td>{r.item_total}</td>
                <td>{r.subtotal_amount}</td>
                <td>{r.tax_amount}</td>
                <td>{r.grand_total}</td>
                <td>
                  <span className="status ok">
                    {r.invoice_status}
                  </span>
                </td>
                <td>
                  <span className="status danger">
                    {r.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {groupedInvoices.length > 0 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => Math.max(p - 1, 1))
              }
            >
              Prev
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(p + 1, totalPages)
                )
              }
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceReport;
