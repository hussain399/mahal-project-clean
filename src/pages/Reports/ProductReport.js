import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
import "jspdf-autotable";

const ProductReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [nameFilter, setNameFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://127.0.0.1:5000/api/reports/products",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load product report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  /* ================= FILTER ================= */
  const filteredData = useMemo(() => {
    return data.filter((p) => {
      /* Status */
      const statusOk =
        statusFilter === "ALL" || p.product_status === statusFilter;

      /* Active / Inactive */
      const activeOk =
        activeFilter === "ALL" ||
        (activeFilter === "ACTIVE" && p.flag === "A") ||
        (activeFilter === "INACTIVE" && p.flag === "D");

      /* Product name search */
      const nameOk =
        !nameFilter ||
        p.product_name_english
          ?.toLowerCase()
          .includes(nameFilter.toLowerCase());

      /* Stock category */
      const stock = Number(p.stock_availability || 0);
      const minQty = Number(p.minimum_order_quantity || 0);

      let stockOk = true;
      if (stockFilter === "IN_STOCK") stockOk = stock > minQty;
      if (stockFilter === "LOW_STOCK")
        stockOk = stock > 0 && stock <= minQty;
      if (stockFilter === "OUT_OF_STOCK") stockOk = stock === 0;

      /* Stock range */
      const minStockOk = minStock === "" || stock >= Number(minStock);
      const maxStockOk = maxStock === "" || stock <= Number(maxStock);

      return (
        statusOk &&
        activeOk &&
        nameOk &&
        stockOk &&
        minStockOk &&
        maxStockOk
      );
    });
  }, [
    data,
    statusFilter,
    activeFilter,
    nameFilter,
    stockFilter,
    minStock,
    maxStock,
  ]);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= COLUMNS (ALL DB FIELDS) ================= */
  const columns = useMemo(() => {
    if (filteredData.length === 0) return [];
    return Object.keys(filteredData[0]);
  }, [filteredData]);

  /* ================= DOWNLOAD ================= */
  const download = async (type) => {
    const params = {
      status: statusFilter,
      active: activeFilter,
      name: nameFilter,
      stock: stockFilter,
      minStock,
      maxStock,
    };

    const res = await axios.get(
      `http://127.0.0.1:5000/api/reports/products/${type}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params,              // ✅ FILTERS SENT
        responseType: "blob",
      }
    );

    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `product_report.${type === "excel" ? "xlsx" : "pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  };


  /* ================= UI ================= */
  return (
  <div className="report_page">
    {/* BACK */}
    {/* <button className="back_btn" onClick={() => window.history.back()}>
      ← Back to Reports
    </button> */}

    {/* HEADER */}
    <div className="page_header glass">
      <h2>Product Report</h2>

      <div className="header_actions">
        <button className="btn dark bulk_btn" onClick={() => download("excel")}>
          ⬇ Excel
        </button>
        <button className="btn dark pdf_btn" onClick={() => download("pdf")}>
          ⬇ PDF
        </button>
      </div>
    </div>

    {/* FILTER BAR */}
    <div className="filter_bar advanced">
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1);
        }}
      >
        <option value="ALL">All Approval Status</option>
        <option value="Pending Approval">Pending Approval</option>
        <option value="Approved">Approved</option>
      </select>

      <input
        type="text"
        placeholder="Search product..."
        value={nameFilter}
        onChange={(e) => {
          setNameFilter(e.target.value);
          setCurrentPage(1);
        }}
      />

      <select
        value={stockFilter}
        onChange={(e) => {
          setStockFilter(e.target.value);
          setCurrentPage(1);
        }}
      >
        <option value="ALL">All Stock</option>
        <option value="IN_STOCK">In Stock</option>
        <option value="LOW_STOCK">Low Stock</option>
        <option value="OUT_OF_STOCK">Out of Stock</option>
      </select>

      <input
        type="number"
        placeholder="Min stock"
        value={minStock}
        onChange={(e) => setMinStock(e.target.value)}
      />

      <input
        type="number"
        placeholder="Max stock"
        value={maxStock}
        onChange={(e) => setMaxStock(e.target.value)}
      />
    </div>

    {/* TABLE */}
    {loading ? (
      <div className="report-loading">Loading...</div>
    ) : paginatedData.length === 0 ? (
      <div className="report-empty">No products found</div>
    ) : (
      <>
        <div className="table_scroll">
          <table className="mini_table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Category</th>
                <th>Company</th>
                <th>Created At</th>
                <th>Currency</th>
                <th>Expiry Date</th>
                <th>Price</th>
                <th>Product ID</th>
                <th>Product (AR)</th>
                <th>Product (EN)</th>
                <th>Status</th>
                <th>Shelf Life</th>
                <th>Stock</th>
                <th>Store</th>
                <th>Unit</th>
                <th>Updated</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((p) => (
                <tr key={p.product_id}>

                  {/* Branch */}
                  <td>{p.branch_name_english}</td>

                  {/* Category */}
                  <td>{p.category_id}</td>

                  {/* Company */}
                  <td>{p.company_name_english}</td>

                  {/* Created At */}
                  <td>
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Currency */}
                  <td>{p.currency}</td>

                  {/* Expiry Date */}
                  <td>
                    {p.expiry_date
                      ? new Date(p.expiry_date).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Price */}
                  <td>{p.price_per_unit}</td>

                  {/* Product ID */}
                  <td>{p.product_id}</td>

                  {/* Product (AR) */}
                  <td>{p.product_name_arabic}</td>

                  {/* Product (EN) */}
                  <td>{p.product_name_english}</td>

                  {/* Status */}
                  <td>
                    <span className="status warn">
                      {p.product_status}
                    </span>
                  </td>

                  {/* Shelf Life */}
                  <td>{p.shelf_life}</td>

                  {/* Stock */}
                  <td>{p.stock_availability}</td>

                  {/* Store */}
                  <td>{p.store_name_english}</td>

                  {/* Unit */}
                  <td>{p.unit_of_measure}</td>

                  {/* Updated */}
                  <td>
                    {p.updated_at
                      ? new Date(p.updated_at).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
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
      </>
    )}
  </div>
);

};

export default ProductReport;