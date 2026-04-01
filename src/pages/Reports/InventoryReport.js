import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "jspdf-autotable";

const API = "http://127.0.0.1:5000/api/reports/inventory";

const InventoryReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stockFilter, setStockFilter] = useState("ALL");
  const [expiryFilter, setExpiryFilter] = useState("ALL");
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  /* ================= FILTER ================= */
  const filteredData = useMemo(() => {
    return data.filter((r) => {
      const stockOk = stockFilter === "ALL" || r.stock_status === stockFilter;
      const expiryOk = expiryFilter === "ALL" || r.expiry_status === expiryFilter;
      return stockOk && expiryOk;
    });
  }, [data, stockFilter, expiryFilter]);

  /* ================= DOWNLOAD ================= */
  const downloadExcel = async () => {
    const res = await axios.get(`${API}/excel`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { stock: stockFilter, expiry: expiryFilter },
      responseType: "blob"
    });

    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_report.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    const res = await axios.get(`${API}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { stock: stockFilter, expiry: expiryFilter },
      responseType: "blob"
    });

    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };
const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

const paginatedData = filteredData.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

return (
  <div className="report_page">

    {/* <button className="back_btn" onClick={() => window.history.back()}>
      ← Back to Reports
    </button> */}

    <div className="page_header glass">
      <h2>Inventory Report</h2>

      <div className="header_actions">
        <button className="btn dark bulk_btn" onClick={downloadExcel}>⬇ Excel</button>
        <button className="btn dark pdf_btn" onClick={downloadPDF}>⬇ PDF</button>
      </div>
    </div>

    <div className="filter_bar">
      <select value={stockFilter} onChange={e => {setStockFilter(e.target.value);setCurrentPage(1);}}>
        <option value="ALL">All Stock</option>
        <option value="IN_STOCK">In Stock</option>
        <option value="LOW_STOCK">Low Stock</option>
        <option value="OUT_OF_STOCK">Out of Stock</option>
      </select>

      <select value={expiryFilter} onChange={e => {setExpiryFilter(e.target.value);setCurrentPage(1);}}>
        <option value="ALL">All Expiry</option>
        <option value="VALID">Valid</option>
        <option value="EXPIRING_SOON">Expiring Soon</option>
        <option value="EXPIRED">Expired</option>
      </select>
    </div>

    <table className="mini_table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Expiry</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        {paginatedData.map(r => (
          <tr key={r.product_id}>
            <td>{r.product_name_english}</td>
            <td>{r.stock_availability}</td>
            <td>
              <span className={`status ${r.stock_status === "IN_STOCK" ? "ok" : "danger"}`}>
                {r.stock_status.replace("_", " ")}
              </span>
            </td>
            <td>
              <span className={`status ${
                r.expiry_status === "VALID" ? "ok" :
                r.expiry_status === "EXPIRING_SOON" ? "warn" : "danger"
              }`}>
                {r.expiry_status.replace("_", " ")}
              </span>
            </td>
            <td>{r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

  </div>
);

};

export default InventoryReport;