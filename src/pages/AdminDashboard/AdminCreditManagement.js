import React, { useEffect, useState } from "react";
import "../css/admincredit.css";
const API = "http://127.0.0.1:5000/api";

export default function AdminCreditManagement() {

  const token = localStorage.getItem("admin_token"); // ✅ IMPORTANT

  const [restaurants, setRestaurants] = useState([]);
  const [summary, setSummary] = useState(null);

  const [selected, setSelected] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustRemarks, setAdjustRemarks] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [usageFilter, setUsageFilter] = useState("ALL");
  const [adjustData, setAdjustData] = useState({
    amount: "",
    payment_mode: "CASH",
    remarks: "",
    receipt: null
  });


  const [editData, setEditData] = useState({
    credit_limit: 0,
    credit_days: 0,
    is_credit_blocked: false
  });

  /* ================= LOAD ================= */
  const loadData = async () => {
    try {

      const r1 = await fetch(`${API}/admin/credit/restaurants`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data1 = await r1.json();
      setRestaurants(Array.isArray(data1) ? data1 : []);

      const r2 = await fetch(`${API}/admin/credit/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data2 = await r2.json();
      setSummary(data2 || null);

    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  /* ================= UPDATE ================= */
  const updateCredit = async () => {

    await fetch(`${API}/admin/credit/update/${selected.restaurant_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editData)
    });

    loadData();
    alert("Credit updated");
  };

  /* ================= ADJUST ================= */
// const adjustCredit = async () => {

//   if (!adjustData.amount) {
//     alert("Enter amount");
//     return;
//   }

//   const formData = new FormData();
//   formData.append("restaurant_id", selected.restaurant_id);
//   formData.append("amount", adjustData.amount);
//   formData.append("payment_mode", adjustData.payment_mode);
//   formData.append("remarks", adjustData.remarks);

//   if (adjustData.receipt) {
//     formData.append("receipt", adjustData.receipt);
//   }

//   await fetch(`${API}/admin/credit/adjust`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`
//     },
//     body: formData
//   });

//   setShowAdjust(false);

//   setAdjustData({
//     amount: "",
//     payment_mode: "CASH",
//     remarks: "",
//     receipt: null
//   });

//   loadData();
//   alert("Payment adjusted successfully");
// };

const openPopup = async (restaurant) => {

  setSelected(restaurant);

  setEditData({
    credit_limit: restaurant.credit_limit,
    credit_days: restaurant.credit_days,
    is_credit_blocked: restaurant.is_credit_blocked
  });

  try {
    const res = await fetch(
      `${API}/admin/credit/ledger/${restaurant.restaurant_id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const data = await res.json();

    if (Array.isArray(data)) {
      setLedger(data);
    } else {
      setLedger([]);
    }

  } catch (err) {
    console.error(err);
    setLedger([]);
  }
};


const filteredRestaurants = restaurants.filter(r => {

  // search
  if (
    search &&
    !r.restaurant_name_english
      .toLowerCase()
      .includes(search.toLowerCase())
  ) return false;

  // status filter
  if (statusFilter === "ACTIVE" && r.is_credit_blocked) return false;
  if (statusFilter === "BLOCKED" && !r.is_credit_blocked) return false;

  // usage filter
  if (usageFilter === "OVERUSED" && r.credit_used <= r.credit_limit) return false;
  if (usageFilter === "AVAILABLE" && r.credit_used >= r.credit_limit) return false;

  return true;
});
  return (
    <div className="dashboard_page">

      <h2>Credit Management</h2>

      {/* SUMMARY */}
      {summary && (
        <div className="card_grid mb-4">

          <div className="stat_card">
            <p>Total Limit</p>
            <h3>QAR {summary.total_limit}</h3>
          </div>

          <div className="stat_card">
            <p>Total Used</p>
            <h3>QAR {summary.total_used}</h3>
          </div>

          <div className="stat_card">
            <p>Total Available</p>
            <h3>QAR {summary.total_available}</h3>
          </div>

          <div className="stat_card">
            <p>Overdue Accounts</p>
            <h3>{summary.overdue_accounts}</h3>
          </div>

        </div>
      )}

      <div className="card p-3 mb-3">

        <div className="row">

          <div className="col-md-4">
            <label>Search Restaurant</label>
            <input
              className="form-control"
              placeholder="Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label>Status</label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div className="col-md-3">
            <label>Credit Usage</label>
            <select
              className="form-control"
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="OVERUSED">Over Limit</option>
              <option value="AVAILABLE">Within Limit</option>
            </select>
          </div>

          <div className="col-md-2 d-flex align-items-end">
            <button
              className="btn btn-secondary w-100"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setUsageFilter("ALL");
              }}
            >
              Reset
            </button>
          </div>

        </div>

      </div>

      {/* TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>Restaurant</th>
            <th>Limit</th>
            <th>Used</th>
            <th>Available</th>
            <th>Days</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
{filteredRestaurants.map(r => {

  const usagePercent =
    r.credit_limit > 0
      ? Math.round((r.credit_used / r.credit_limit) * 100)
      : 0;

  return (
    <tr
      key={r.restaurant_id}
      style={
        r.is_credit_blocked
          ? { backgroundColor: "#f2f2f2" }
          : r.is_overdue
          ? { backgroundColor: "#ffe6e6" }
          : usagePercent >= 90
          ? { backgroundColor: "#fff4e6" }
          : {}
      }
    >
      <td>{r.restaurant_name_english}</td>
      <td>{r.credit_limit}</td>
      <td>{r.credit_used}</td>
      <td>{r.credit_available}</td>
      <td>{r.credit_days}</td>

      <td>

        {/* BLOCKED */}
        {r.is_credit_blocked && (
          <span className="badge bg-dark me-1">Blocked</span>
        )}

        {/* OVERDUE */}
        {r.is_overdue && (
          <span className="badge bg-danger me-1">
            Overdue ({r.overdue_days}d)
          </span>
        )}

        {/* DUE SOON */}
        {!r.is_overdue && r.is_due_soon && (
          <span className="badge bg-warning text-dark me-1">
            Due in {r.next_due_in_days}d
          </span>
        )}

        {/* USAGE */}
        <span
          className={
            usagePercent >= 90
              ? "badge bg-danger"
              : usagePercent >= 70
              ? "badge bg-warning text-dark"
              : "badge bg-success"
          }
        >
          {usagePercent}% Used
        </span>

      </td>

      <td>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => openPopup(r)}
        >
          Manage
        </button>
      </td>
    </tr>
  );

})}
        </tbody>
      </table>


      {/* ================= POPUP ================= */}
      {selected && (
        <div className="modal_show">

          <div className="modal_box" style={{ width: 700 }}>

            <h3>{selected.restaurant_name_english}</h3>

            {/* EDIT SECTION */}
            <div className="row">

              <div className="col-md-4">
                <label>Credit Limit</label>
                <input
                  className="form-control"
                  value={editData.credit_limit}
                  onChange={e =>
                    setEditData({
                      ...editData,
                      credit_limit: e.target.value
                    })
                  }
                />
              </div>

              <div className="col-md-4">
                <label>Credit Days</label>
                <input
                  className="form-control"
                  value={editData.credit_days}
                  onChange={e =>
                    setEditData({
                      ...editData,
                      credit_days: e.target.value
                    })
                  }
                />
              </div>

              <div className="col-md-4 mt-4">
                <label>
                  <input
                    type="checkbox"
                    checked={editData.is_credit_blocked}
                    onChange={e =>
                      setEditData({
                        ...editData,
                        is_credit_blocked: e.target.checked
                      })
                    }
                  />
                  Block Credit
                </label>
              </div>

            </div>

            <div className="mt-3">

              <button
                className="btn btn-success me-2"
                onClick={updateCredit}
              >
                Save Changes
              </button>

                {/* <button
                    className="btn btn-warning me-2"
                    onClick={() => setShowAdjust(true)}
                    >
                    Adjust Payment
                    </button> */}

              <button
                className="btn btn-secondary"
                onClick={() => setSelected(null)}
              >
                Close
              </button>

            </div>
            {showLedger && (
              <div className="modal_show">

                <div className="modal_box" style={{ width: 800 }}>

                  <h4>Transaction History</h4>

                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Payment</th>
                        <th>Remarks</th>
                        <th>Receipt</th>
                      </tr>
                    </thead>

                    <tbody>
                      {ledger.map((l, i) => (
                        <tr key={i}>
                          <td>{l.created_at}</td>
                          <td>{l.amount}</td>
                          <td>{l.type}</td>
                          <td>{l.payment_mode}</td>
                          <td>{l.remarks}</td>

                          <td>
                            {l.receipt_filename && l.receipt_filename !== "" && (
                              l.type === "SETTLEMENT" ? (
                                <a
                                  href={`${API}/admin/credit/settlement-receipt/${l.id}?token=${token}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View Receipt"
                                >
                                  <i className="fas fa-file-alt"></i>
                                </a>
                              ) : (
                                <a
                                  href={`${API}/admin/credit/receipt/${l.id}?token=${token}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View Receipt"
                                >
                                  <i className="fas fa-file-alt"></i>
                                </a>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowLedger(false)}
                  >
                    Close
                  </button>

                </div>
              </div>
            )}

            {showAdjust && (
              <div className="modal_show">

                <div className="modal_box" style={{ width: 450 }}>

                  <h4>Adjust Payment</h4>

                  <label>Amount Received</label>
                  <input
                    className="form-control"
                    value={adjustData.amount}
                    onChange={(e) =>
                      setAdjustData({ ...adjustData, amount: e.target.value })
                    }
                  />

                  <label className="mt-2">Payment Mode</label>
                  <select
                    className="form-control"
                    value={adjustData.payment_mode}
                    onChange={(e) =>
                      setAdjustData({
                        ...adjustData,
                        payment_mode: e.target.value
                      })
                    }
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card / POS</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="ONLINE">Online Payment</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>

                  <label className="mt-2">Remarks</label>
                  <textarea
                    className="form-control"
                    value={adjustData.remarks}
                    onChange={(e) =>
                      setAdjustData({
                        ...adjustData,
                        remarks: e.target.value
                      })
                    }
                  />

                  <label className="mt-2">Upload Receipt</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setAdjustData({
                        ...adjustData,
                        receipt: e.target.files[0]
                      })
                    }
                  />

                  <div className="mt-3">

                    {/* <button
                      className="btn btn-success me-2"
                      onClick={adjustCredit}
                    >
                      Confirm Payment
                    </button> */}

                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowAdjust(false)}
                    >
                      Cancel
                    </button>

                  </div>

                </div>
              </div>
            )}

            {/* LEDGER */}
                <hr />

                <div className="mt-3">

                <button
                    className="btn btn-outline-dark"
                    title="View Transaction History"
                    onClick={() => setShowLedger(true)}
                >
                    <i className="fas fa-eye"></i> View History
                </button>

                </div>

          </div>
        </div>
      )}

    </div>
  );
}