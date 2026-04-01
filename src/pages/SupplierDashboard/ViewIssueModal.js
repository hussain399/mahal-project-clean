// import React from "react";

// const ViewIssueModal = ({ issue, onClose }) => {
//   return (
//     <div className="modal_overlay">
//       <div className="modal_box">
//         <h4>Issue Details</h4>

//         <p><b>Order:</b> {issue.id}</p>
//         <p><b>Restaurant:</b> {issue.restaurant}</p>
//         <p><b>Issue:</b> {issue.issue}</p>
//         <p><b>Description:</b> {issue.description}</p>

//         <hr />

//         <p><b>Action:</b> {issue.action}</p>
//         <p><b>Refund:</b> ₹{issue.refund}</p>
//         <p><b>Notes:</b> {issue.notes}</p>
//         <p><b>Resolved On:</b> {issue.resolvedOn}</p>

//         <button className="btn cancel" onClick={onClose}>
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ViewIssueModal;




import React from "react";

const ViewIssueModal = ({ issue, onClose }) => {
  return (
    <div className="modal_overlay">
      <div className="modal_box">
        <h4>Issue Details</h4>

        <p><b>Order:</b> {issue.order_id}</p>
        <p><b>Restaurant:</b> {issue.restaurant_name_english}</p>
        <p><b>Issue:</b> {issue.issue_type}</p>
        <p><b>Description:</b> {issue.description || "—"}</p>

        <hr />

        <p>
          <b>Status:</b>{" "}
          <span className={`issue_status ${issue.status?.toLowerCase()}`}>
            {issue.status}
          </span>
        </p>

        <p><b>Action Taken:</b> {issue.action || "—"}</p>

        <p>
          <b>Refund:</b>{" "}
          {issue.refund !== null && issue.refund !== undefined
            ? `₹${issue.refund}`
            : "—"}
        </p>

        <p><b>Notes:</b> {issue.notes || "—"}</p>

        <p>
          <b>Resolved On:</b>{" "}
          {issue.resolved_at
            ? new Date(issue.resolved_at).toLocaleDateString()
            : "—"}
        </p>

        <div className="modal_actions">
          <button className="btn cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewIssueModal;