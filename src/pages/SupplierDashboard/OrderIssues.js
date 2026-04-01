import React, { useEffect, useState } from "react";
import ResolveIssueModal from "./ResolveIssueModal";
import ViewIssueModal from "./ViewIssueModal";
import { useSearchParams } from "react-router-dom";

const API = "http://127.0.0.1:5000/api/v1";

const OrderIssues = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [viewIssue, setViewIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const issueIdFromUrl = searchParams.get("issueId");

  const token = localStorage.getItem("token");
  const autoReadIssueNotification = (issue) => {
    fetch(`${API}/orders/supplier/notifications/auto-read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reference_id: issue.issue_report_id,
        type: "ORDER_ISSUE",
      }),
    }).then(() => {
      window.dispatchEvent(new Event("refreshNotifications"));
    });
  };

  const loadIssues = () => {
    setLoading(true);
    fetch(`${API}/supplier/issues`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setIssues([]);
          return;
        }

        const sortedIssues = [...data].sort((a, b) => {
          // unresolved first
          if (a.status === "ISSUE_RESOLVED" && b.status !== "ISSUE_RESOLVED") return 1;
          if (a.status !== "ISSUE_RESOLVED" && b.status === "ISSUE_RESOLVED") return -1;
          return 0;
        });

        setIssues(sortedIssues);
      })

      .finally(() => setLoading(false));
  };

  useEffect(() => {
  loadIssues();
}, []);

useEffect(() => {
  if (!issueIdFromUrl || issues.length === 0) return;

  const match = issues.find(
    i => i.issue_report_id === issueIdFromUrl
  );

  if (match) {
    setViewIssue(match); // 👈 opens modal automatically
  }
}, [issueIdFromUrl, issues]);
  useEffect(() => {
  if (!issueIdFromUrl) return;

  fetch(`${API}/orders/supplier/notifications/auto-read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reference_id: issueIdFromUrl,
      type: "ORDER_ISSUE",
    }),
  }).then(() => {
    window.dispatchEvent(new Event("refreshNotifications"));
  });
}, [issueIdFromUrl, token]);

  // ✅ THIS IS THE IMPORTANT PART
  const handleResolved = (updatedIssue) => {
    fetch(`${API}/orders/supplier/notifications/auto-read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reference_id: updatedIssue.issue_report_id,
        type: "ORDER_ISSUE",
      }),
    }).then(() => {
      window.dispatchEvent(new Event("refreshNotifications"));
    });

    setIssues((prev) =>
      prev.map((i) =>
        i.issue_report_id === updatedIssue.issue_report_id
          ? updatedIssue
          : i
      )
    );

    // keep modals in sync
    setViewIssue(updatedIssue);
    setSelectedIssue(null);
  };

  if (loading) return <div>Loading issues...</div>;



  return (
    <div className="order_issues_page">
      <h3 className="page_title">Order Issues</h3>

      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Order ID</th>
              <th>Restaurant</th>
              <th>Issue</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {issues.map((i) => (
              <tr key={i.issue_report_id}>
                <td>{i.issue_report_id}</td>
                <td>{i.order_id}</td>
                <td>{i.restaurant_name_english}</td>
                <td>{i.issue_type}</td>
                <td>{i.description || "—"}</td>
                <td>
                  <span className={`issue_status ${i.status.toLowerCase()}`}>
                    {i.status}
                  </span>
                </td>
                <td>
                  {i.status !== "ISSUE_RESOLVED" ? (
                    <button
                      className="btn resolve"
                      onClick={() => {
                        autoReadIssueNotification(i);
                        setSelectedIssue(i);
                      }}
                    >
                      Resolve
                    </button>
                  ) : (
                    <button
                      className="btn view"
                      onClick={() => {
                        autoReadIssueNotification(i);
                        setViewIssue(i);
                      }}
                    >
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {issues.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No issues found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {selectedIssue && (
        <ResolveIssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onResolved={handleResolved} // ✅ FIXED
        />
      )}

      {viewIssue && (
        <ViewIssueModal
          issue={viewIssue}
          onClose={() => setViewIssue(null)}
        />
      )}
    </div>
  );
};

export default OrderIssues;