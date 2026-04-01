import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api/v1/restaurant/reports/purchases";

const ITEMS_PER_PAGE = 5;

const PurchaseReport = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");

  /* ================= CURRENCY ================= */

  const formatQAR = (amount) =>
    new Intl.NumberFormat("en-QA", {
      style: "currency",
      currency: "QAR"
    }).format(amount || 0);


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


  /* RESET PAGE WHEN FILTER CHANGES */
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, supplierFilter, searchTerm, data]);


  /* ================= FILTER ================= */

  const suppliers = [...new Set(data.map(d => d.supplier_name))];

  const filteredData = useMemo(() => {

    return data.filter(r => {

      const statusOk =
        statusFilter === "ALL" || r.status === statusFilter;

      const supplierOk =
        supplierFilter === "ALL" || r.supplier_name === supplierFilter;

      const searchOk =
        !searchTerm ||
        String(r.order_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(r.product_name_english)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(r.supplier_name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return statusOk && supplierOk && searchOk;

    });

  }, [data, statusFilter, supplierFilter, searchTerm]);


  /* ================= SUMMARY ================= */

  const totalAmount = filteredData.reduce(
    (sum, r) => sum + Number(r.item_total || 0),
    0
  );

  const totalQty = filteredData.reduce(
    (sum, r) => sum + Number(r.quantity || 0),
    0
  );

  const uniqueOrders = new Set(filteredData.map(r => r.order_id)).size;

  const uniqueSuppliers = new Set(filteredData.map(r => r.supplier_name)).size;


  /* ================= PAGINATION ================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = filteredData.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );


  if (loading) return <p>Loading purchase report...</p>;


  return (
    <div className="report_page">

      {/* HEADER */}
      <div className="page_header glass">
        <h2>Purchase Report</h2>
      </div>


      {/* KPI */}
      <div className="kpi_grid">

        <div className="kpi_card">
          <p>Total Purchase</p>
          <h3>{formatQAR(totalAmount)}</h3>
        </div>

        <div className="kpi_card">
          <p>Total Orders</p>
          <h3>{uniqueOrders}</h3>
        </div>

        <div className="kpi_card">
          <p>Total Quantity</p>
          <h3>{totalQty}</h3>
        </div>

        <div className="kpi_card">
          <p>Suppliers</p>
          <h3>{uniqueSuppliers}</h3>
        </div>

      </div>


      {/* FILTER BAR */}
      <div className="filter_bar">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search Order / Product / Supplier..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ minWidth: 260 }}
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="DELIVERED">Delivered</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={supplierFilter}
          onChange={e => setSupplierFilter(e.target.value)}
        >
          <option value="ALL">All Suppliers</option>

          {suppliers.map(s => (
            <option key={s}>{s}</option>
          ))}

        </select>

      </div>


      {/* TABLE */}
      <table className="mini_table">

        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Supplier</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No data found
              </td>
            </tr>
          ) : (

            paginatedData.map((r, i) => (

              <tr key={i}>

                <td>{r.order_id}</td>

                <td>
                  {r.order_date
                    ? new Date(r.order_date).toLocaleDateString()
                    : "-"}
                </td>

                <td>{r.supplier_name}</td>

                <td>{r.product_name_english}</td>

                <td>{r.quantity}</td>

                <td>{formatQAR(r.item_total)}</td>

                <td>
                  <span className={`status ${
                    r.status === "DELIVERED"
                      ? "ok"
                      : r.status === "CANCELLED"
                      ? "danger"
                      : "warn"
                  }`}>
                    {r.status}
                  </span>
                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>


      {/* PAGINATION */}
      <div className="pagination">

        <button
          disabled={safePage === 1}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        >
          Prev
        </button>

        <span>
          Page {safePage} of {totalPages}
        </span>

        <button
          disabled={safePage === totalPages}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default PurchaseReport;
