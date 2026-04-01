import React, { useEffect, useState } from "react";

/* REPORT MODULES */
import PurchaseReport from "./Reports/PurchaseReport";
import GRNReport from "./Reports/GRNReport";
import InvoiceReport from "./Reports/InvoiceReport";
import SupplierReport from "./Reports/SupplierReport";

const API = "http://127.0.0.1:5000/api/v1";

const RestaurantReports = () => {

  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const [totalPurchase, setTotalPurchase] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsReceived, setItemsReceived] = useState(0);
  const [pendingGRN, setPendingGRN] = useState(0);

  const [topSuppliers, setTopSuppliers] = useState([]);

  const restaurantId = localStorage.getItem("linked_id");
  const token = localStorage.getItem("token");

  /* ================= CURRENCY ================= */

  const formatQAR = (amount) =>
    new Intl.NumberFormat("en-QA", {
      style: "currency",
      currency: "QAR"
    }).format(amount || 0);


  const loadKPIs = async () => {

    if (!restaurantId) return;

    try {

      /* PURCHASE */
      const ordersRes = await fetch(
        `${API}/restaurant/reports/purchases`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const orders = await ordersRes.json();
      const rows = Array.isArray(orders) ? orders : [];

      const uniqueOrders = new Set(rows.map(r => r.order_id));
      setTotalOrders(uniqueOrders.size);

      const purchase = rows.reduce(
        (sum, r) => sum + Number(r.item_total || 0),
        0
      );
      setTotalPurchase(purchase);

      const supplierMap = {};

      rows.forEach(r => {

        if (!supplierMap[r.supplier_id]) {
          supplierMap[r.supplier_id] = {
            name: r.supplier_name,
            orders: 0,
            amount: 0
          };
        }

        supplierMap[r.supplier_id].orders += 1;
        supplierMap[r.supplier_id].amount += Number(r.item_total || 0);

      });

      const top = Object.values(supplierMap)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      setTopSuppliers(top);

      /* GRN */

      const grnRes = await fetch(
        `${API}/restaurant/reports/grn`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const grn = await grnRes.json();
      const grnRows = Array.isArray(grn) ? grn : [];

      const receivedQty = grnRows.reduce(
        (sum, g) => sum + Number(g.received_qty || 0),
        0
      );

      setItemsReceived(receivedQty);

      const pending = grnRows.filter(
        g => g.status !== "CONFIRMED"
      ).length;

      setPendingGRN(pending);

    } catch (err) {
      console.error("Reports load error", err);
    }
  };

  useEffect(() => {
    loadKPIs();
  }, [restaurantId]);


  const renderReport = () => {

    switch (activeSubmenu) {

      case "purchase":
        return <PurchaseReport />;

      case "grn":
        return <GRNReport />;

      case "invoice":
        return <InvoiceReport />;

      case "supplier":
        return <SupplierReport />;

      default:
        return null;
    }
  };

  return (
    <div className="reports_page">

      <h3 className="page_title">Reports & Analytics</h3>

      {/* KPI CARDS */}
      <div className="kpi_grid">

        <div className="kpi_card">
          <i className="fa fa-coins"></i>
          <p>Total Purchase</p>
          <h3>{formatQAR(totalPurchase)}</h3>
        </div>

        <div className="kpi_card">
          <i className="fa fa-shopping-cart"></i>
          <p>Total Orders</p>
          <h3>{totalOrders}</h3>
        </div>

        <div className="kpi_card">
          <i className="fa fa-box"></i>
          <p>Items Received</p>
          <h3>{itemsReceived}</h3>
        </div>

        <div className="kpi_card alert">
          <i className="fa fa-truck"></i>
          <p>Pending GRN</p>
          <h3>{pendingGRN}</h3>
        </div>

      </div>


      {/* TOP SUPPLIERS */}
      <div className="card">

        <h4>Top Suppliers</h4>

        <table className="mini_table">

          <thead>
            <tr>
              <th>Supplier</th>
              <th>Orders</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>

            {topSuppliers.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  No data
                </td>
              </tr>
            ) : (
              topSuppliers.map((s, i) => (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td>{s.orders}</td>
                  <td>{formatQAR(s.amount)}</td>
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>


      {/* REPORT MODULES */}
      {!activeSubmenu ? (

        <div className="reports_section">

          <h4>Reports</h4>
          <p className="sub_text">Select a report module</p>

          <div className="report_cards">

            <div
              className="report_card"
              onClick={() => setActiveSubmenu("purchase")}
            >
              <i className="fa fa-shopping-basket"></i>
              <h5>Purchase Report</h5>
              <p>Orders placed to suppliers</p>
            </div>

            <div
              className="report_card"
              onClick={() => setActiveSubmenu("grn")}
            >
              <i className="fa fa-truck-loading"></i>
              <h5>GRN Report</h5>
              <p>Goods received details</p>
            </div>

            <div
              className="report_card"
              onClick={() => setActiveSubmenu("invoice")}
            >
              <i className="fa fa-file-invoice"></i>
              <h5>Invoice Report</h5>
              <p>Supplier invoices</p>
            </div>

            <div
              className="report_card"
              onClick={() => setActiveSubmenu("supplier")}
            >
              <i className="fa fa-industry"></i>
              <h5>Supplier Performance</h5>
              <p>Supplier analytics</p>
            </div>

          </div>

        </div>

      ) : (
        <>
          <button
            className="back_btn"
            onClick={() => setActiveSubmenu(null)}
          >
            ← Back to Reports
          </button>

          {renderReport()}
        </>
      )}

    </div>
  );
};

export default RestaurantReports;
