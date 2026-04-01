import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API =
  "http://127.0.0.1:5000/api/v1/restaurant/reports/invoices";

const ITEMS_PER_PAGE = 5;

const InvoiceReport = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

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


  /* RESET PAGE WHEN FILTER CHANGES */
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, data]);


  /* ================= FILTER ================= */

  const filteredData = useMemo(() => {

    return data.filter(r => {

      const statusOk =
        statusFilter === "ALL" ||
        r.payment_status === statusFilter;

      const searchOk =
        !searchTerm ||
        String(r.invoice_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(r.order_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(r.supplier_name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return statusOk && searchOk;

    });

  }, [data, statusFilter, searchTerm]);


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


  if (loading) return <p>Loading invoice report...</p>;


  return (
    <div className="report_page">

      {/* HEADER */}
      <div className="page_header glass">

        <h2>Invoice Report</h2>

        <div className="header_actions">

          <div className="summary_inline">
            <span>Total Invoices:</span>
            <b>{filteredData.length}</b>
          </div>

        </div>

      </div>


      {/* FILTER BAR */}
      <div className="filter_bar">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search Invoice / Order / Supplier..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ minWidth: 260 }}
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

      </div>


      {/* TABLE */}
      <table className="mini_table">

        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Order ID</th>
            <th>Supplier</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>

          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No data found
              </td>
            </tr>
          ) : (

            paginatedData.map(r => (

              <tr key={r.invoice_id}>

                <td>INV-{r.invoice_id}</td>

                <td>{r.order_id}</td>

                <td>{r.supplier_name}</td>

                <td>
                  <span className={`status ${
                    r.payment_status === "PAID"
                      ? "ok"
                      : r.payment_status === "UNPAID"
                      ? "warn"
                      : "danger"
                  }`}>
                    {r.payment_status}
                  </span>
                </td>

                <td>
                  {r.invoice_date
                    ? new Date(r.invoice_date).toLocaleDateString()
                    : "-"}
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
          onClick={() =>
            setCurrentPage(p => Math.max(1, p - 1))
          }
        >
          Prev
        </button>

        <span>
          Page {safePage} of {totalPages}
        </span>

        <button
          disabled={safePage === totalPages}
          onClick={() =>
            setCurrentPage(p => Math.min(totalPages, p + 1))
          }
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default InvoiceReport;
