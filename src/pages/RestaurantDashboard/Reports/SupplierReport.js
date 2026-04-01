import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API =
  "http://127.0.0.1:5000/api/v1/restaurant/reports/suppliers";

const SupplierReport = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 5;
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
      setCurrentPage(1);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);


  /* ================= SUMMARY ================= */

  const totalSuppliers = data.length;

  const totalPurchase = data.reduce(
    (sum, r) => sum + Number(r.total_purchase || 0),
    0
  );

  const totalDelivered = data.reduce(
    (sum, r) => sum + Number(r.delivered_orders || 0),
    0
  );

  const totalOrders = data.reduce(
    (sum, r) => sum + Number(r.total_orders || 0),
    0
  );

  const successRate =
    totalOrders === 0
      ? 0
      : Math.round((totalDelivered / totalOrders) * 100);


  /* ================= PAGINATION ================= */

  const totalPages = Math.max(
    1,
    Math.ceil(data.length / ITEMS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = data.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );


  if (loading) return <p>Loading supplier report...</p>;


  return (
    <div className="report_page">

      {/* HEADER */}
      <div className="page_header glass">
        <h2>Supplier Performance</h2>
      </div>


      {/* KPI */}
      <div className="kpi_grid">

        <div className="kpi_card">
          <p>Total Suppliers</p>
          <h3>{totalSuppliers}</h3>
        </div>

        <div className="kpi_card">
          <p>Total Purchase</p>
          <h3>{formatQAR(totalPurchase)}</h3>
        </div>

        <div className="kpi_card">
          <p>Delivered Orders</p>
          <h3>{totalDelivered}</h3>
        </div>

        <div className="kpi_card">
          <p>Success Rate</p>
          <h3>{successRate}%</h3>
        </div>

      </div>


      {/* TABLE */}
      <table className="mini_table">

        <thead>
          <tr>
            <th>Supplier</th>
            <th>Orders</th>
            <th>Delivered</th>
            <th>Pending</th>
            <th>Total Spend</th>
            <th>Success %</th>
          </tr>
        </thead>

        <tbody>

          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No data found
              </td>
            </tr>
          ) : (

            paginatedData.map((r, i) => {

              const pending =
                Number(r.total_orders || 0) -
                Number(r.delivered_orders || 0);

              const success =
                r.total_orders === 0
                  ? 0
                  : Math.round(
                      (r.delivered_orders / r.total_orders) * 100
                    );

              return (

                <tr key={i}>

                  <td>{r.supplier_name}</td>

                  <td>{r.total_orders}</td>

                  <td>{r.delivered_orders}</td>

                  <td>{pending}</td>

                  <td>{formatQAR(r.total_purchase)}</td>

                  <td>
                    <span className={`status ${
                      success >= 80
                        ? "ok"
                        : success >= 50
                        ? "warn"
                        : "danger"
                    }`}>
                      {success}%
                    </span>
                  </td>

                </tr>

              );
            })

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

export default SupplierReport;
