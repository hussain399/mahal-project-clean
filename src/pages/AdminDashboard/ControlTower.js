import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
  ResponsiveContainer
} from "recharts";


const API = "http://127.0.0.1:5000/api/v1/admin/dashboard-metrics";

const COLORS = {
  Pending: "#ff9800",
  Completed: "#4caf50",
  Failed: "#f44336"
};

/* ================= FORMATTERS ================= */
const formatCurrency = (val) =>
  `QAR ${Number(val || 0).toLocaleString("en-QA")}`;

const formatPercent = (val) =>
  `${Number(val || 0).toFixed(1)}%`;

/* ================= KPI CARD ================= */
const KpiCard = ({ title, value, highlight }) => (
  <div style={{
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    borderLeft: highlight ? `4px solid ${highlight}` : "4px solid transparent"
  }}>
    <div style={{ fontSize: 13, color: "#777" }}>{title}</div>
    <div style={{ fontSize: 22, fontWeight: "bold", marginTop: 5 }}>
      {value}
    </div>
  </div>
);

/* ================= SAFE NORMALIZER ================= */
const normalizeStatusData = (data = []) => {
  const map = {};

  data.forEach((item) => {
    const key = item.status;
    if (!map[key]) map[key] = 0;
    map[key] += Number(item.total || 0);
  });

  return Object.keys(map).map((k) => ({
    status: k,
    total: map[k]
  }));
};

/* ================= BLINK STYLE ================= */
const blinkStyle = {
  animation: "blink 1s infinite",
  color: "red",
  fontWeight: "bold"
};

/* ================= MAIN ================= */
export default function ControlTower() {

  const [data, setData] = useState(null);
  const [range, setRange] = useState("7d");
  const token = localStorage.getItem("admin_token");

  const fetchData = () => {
    fetch(`${API}?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, [range]);

useEffect(() => {
  const interval = setInterval(fetchData, 30000); // 30s refresh
  return () => clearInterval(interval);
}, [range]);

  if (!data) return <div>Loading dashboard...</div>;

  const {
    kpis,
    order_trend,
    revenue_trend,
    order_status_distribution,
    top_suppliers,
    alerts,
    recent_activity,
    extra
  } = data;

  const pieData = normalizeStatusData(order_status_distribution);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 25 }}>

      {/* ================= RANGE FILTER ================= */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setRange("today")}>Today</button>
        <button onClick={() => setRange("7d")}>7 Days</button>
        <button onClick={() => setRange("month")}>Month</button>
      </div>

      {/* ================= KPI ================= */}
      <div>
        <h3>📊 Overview</h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
          gap: 15
        }}>
          <KpiCard title="Today Orders" value={kpis.today_orders} />
          <KpiCard title="Pending Orders" value={kpis.pending_orders} highlight="#ff9800" />
          <KpiCard title="Failed Orders" value={kpis.failed_orders} highlight="#f44336" />
          <KpiCard title="Active Suppliers" value={kpis.active_suppliers} />
          <KpiCard title="Active Restaurants" value={kpis.active_restaurants} />
          <KpiCard title="Today Revenue" value={formatCurrency(kpis.today_revenue)} highlight="#4caf50" />
          <KpiCard title="Monthly Revenue" value={formatCurrency(kpis.monthly_revenue)} />
          <KpiCard title="Open Tickets" value={kpis.open_tickets} highlight="#f44336" />
        </div>
      </div>

      {/* ================= CREDIT + HEALTH ================= */}
      <div>
        <h3>💰 Financial & Health</h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
          gap: 15
        }}>
          <KpiCard title="Credit Given" value={formatCurrency(kpis.credit_given)} />
          <KpiCard title="Credit Collected" value={formatCurrency(kpis.credit_collected)} />
          <KpiCard title="Outstanding Credit" value={formatCurrency(kpis.outstanding_credit)} highlight="#f44336" />
          <KpiCard title="Overdue Credit" value={formatCurrency(kpis.overdue_credit)} highlight="#ff9800" />
          <KpiCard title="Avg Order Value" value={formatCurrency(kpis.avg_order_value)} />
          <KpiCard title="Success Rate" value={formatPercent(kpis.success_rate)} highlight="#4caf50" />
          <KpiCard title="Cancellation Rate" value={formatPercent(kpis.cancellation_rate)} highlight="#f44336" />
        </div>
      </div>

      {/* ================= EXTRA INSIGHTS ================= */}
      <div className="card">
        <h4>⚡ System Insights</h4>
        <div>⚠ Credit Risk Restaurants: {kpis.credit_risk_restaurants}</div>
        <div>🚫 Inactive Suppliers: {extra?.inactive_suppliers}</div>
      </div>

      {/* ================= CHARTS ================= */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px,1fr))",
        gap: 20
      }}>

        {/* ORDER TREND */}
        <div className="card">
          <h4>Orders Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={order_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#ff9800" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* REVENUE TREND */}
        <div className="card">
          <h4>Revenue Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenue_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(val) => formatCurrency(val)} />
              <Bar dataKey="total" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* STATUS PIE */}
        <div className="card">
          <h4>Order Status</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="total"
                nameKey="status"
                outerRadius={90}
                label={({ percent }) =>
                  percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                }
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.status] || "#999"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* TOP SUPPLIERS */}
        <div className="card">
          <h4>Top Suppliers</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={top_suppliers}>
              <XAxis dataKey="supplier_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_orders" fill="#2196f3" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ================= ALERTS ================= */}
      <div className="card">
        <h4>🚨 Needs Attention</h4>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
          gap: 10
        }}>
          <div style={alerts.stuck_orders > 0 ? blinkStyle : {}}>
            ⚠ Stuck Orders: {alerts.stuck_orders}
          </div>
          <div>❌ Failed Payments: {alerts.failed_payments}</div>
          <div>🕒 Pending Suppliers: {alerts.pending_suppliers}</div>
          <div>🔥 High Priority Tickets: {alerts.high_priority_tickets}</div>
          <div style={alerts.sla_breach > 0 ? blinkStyle : {}}>
            ⏱ SLA Breach: {alerts.sla_breach}
          </div>
          <div>💰 Overdue Credit: {formatCurrency(alerts.overdue_credit)}</div>
        </div>
      </div>

      {/* ================= ACTIVITY ================= */}
      <div className="card">
        <h4>Recent Activity</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recent_activity.map((a, i) => (
              <tr key={i}>
                <td>{a.order_id}</td>
                <td>{a.status}</td>
                <td>{new Date(a.order_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= BLINK CSS ================= */}
      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>

    </div>
  );
}