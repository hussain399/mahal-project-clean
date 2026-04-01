import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api/v1/restaurant/reports/grn";

const ITEMS_PER_PAGE = 5;

const GRNReport = () => {

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

    } catch (err) {
      console.error("GRN report error", err);
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
        statusFilter === "ALL" || r.status === statusFilter;

      const searchOk =
        !searchTerm ||
        String(r.grn_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.order_id).toLowerCase().includes(searchTerm.toLowerCase());

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


  /* ================= SUMMARY ================= */

  const totalReceived = filteredData.reduce(
    (sum, r) => sum + Number(r.received_qty || 0),
    0
  );


  if (loading) return <p>Loading GRN report...</p>;


  return (
    <div className="report_page">

      {/* HEADER */}
      <div className="page_header glass">

        <h2>GRN Report</h2>

        <div className="header_actions">

          <div className="summary_inline">
            <span>Total GRNs:</span>
            <b>{filteredData.length}</b>
          </div>

          <div className="summary_inline">
            <span>Total Received:</span>
            <b>{totalReceived}</b>
          </div>

        </div>

      </div>


      {/* FILTER BAR */}
      <div className="filter_bar">

        {/* SEARCH INPUT */}
        <input
          type="text"
          placeholder="Search GRN / Order ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ minWidth: 220 }}
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
        </select>

      </div>


      {/* TABLE */}
      <table className="mini_table">

        <thead>
          <tr>
            <th>GRN ID</th>
            <th>Order ID</th>
            <th>Supplier</th>
            <th>Status</th>
            <th>Received Qty</th>
            <th>Date</th>
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

            paginatedData.map((r, index) => (

              <tr key={`${r.grn_id}-${index}`}>

                <td>GRN-{r.grn_id}</td>

                <td>{r.order_id}</td>

                <td>{r.supplier_name}</td>

                <td>
                  <span
                    className={`status ${
                      r.status === "CONFIRMED"
                        ? "ok"
                        : "warn"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>

                <td>{r.received_qty}</td>

                <td>
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString()
                    : "-"
                  }
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

export default GRNReport;
