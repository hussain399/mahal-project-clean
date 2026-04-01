import React, { useState, useEffect } from "react";
import "./css/SupportTicket.css";
import customerSupport from "../images/customer_support.png";

/* -------- GET USER FROM TOKEN -------- */
function getUserFromToken() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  return {
    username: localStorage.getItem("username"),
    role: localStorage.getItem("role"),
    user_id: localStorage.getItem("user_id"),
    linked_id: localStorage.getItem("linked_id"),
    token: token
  };
}

export default function SupportTicket() {
  const user = getUserFromToken();

  const [categories, setCategories] = useState([]);
  const [issue, setIssue] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [showStatus, setShowStatus] = useState(false);

  // NEW STATES
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState(null);

  /* ---------- FETCH ISSUES ---------- */
  useEffect(() => {
    if (!user) return;

    fetch("http://127.0.0.1:5000/api/support/categories", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.categories);
      });
  }, []);

  /* ---------- CANCEL ---------- */
  const handleCancel = () => {
    setIssue("");
    setMessage("");
    setFile(null);
    setAgree(false);
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issue || !message || !agree) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("subject", issue);
    formData.append("message", message);
    if (file) formData.append("attachment", file);

    const res = await fetch("http://127.0.0.1:5000/api/support/ticket", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert("Ticket submitted successfully");
      handleCancel();
    } else {
      alert(data.error || "Error");
    }
  };

  /* ---------- TRACK STATUS ---------- */
  const handleTrackStatus = async () => {
    if (showStatus) {
      setShowStatus(false);
      setTickets([]);
      setSelectedTicket(null);
      return;
    }

    const res = await fetch("http://127.0.0.1:5000/api/support/my-tickets", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const data = await res.json();
    if (data.success) {
      setTickets(data.tickets);
      setShowStatus(true);
    }
  };

  /* ---------- LOAD TICKET DETAILS ---------- */
  const loadTicketDetails = async (ticketId) => {
    const res = await fetch(
      `http://127.0.0.1:5000/api/support/ticket/${ticketId}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    const data = await res.json();

    if (res.ok) {
      setSelectedTicket(data.ticket);
      setMessages(data.messages);
      setAttachments(data.attachments);
    }
  };

  /* ---------- REPLY ---------- */
  const handleReply = async () => {
    if (!replyText) return;

    const formData = new FormData();
    formData.append("message", replyText);
    if (replyFile) formData.append("attachment", replyFile);

    const res = await fetch(
      `http://127.0.0.1:5000/api/support/ticket/${selectedTicket.ticket_id}/reply`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      }
    );

    if (res.ok) {
      setReplyText("");
      setReplyFile(null);
      loadTicketDetails(selectedTicket.ticket_id);
    }
  };

  /* ---------- DOWNLOAD ATTACHMENT ---------- */
  const downloadFile = (id) => {
    window.open(
      `http://127.0.0.1:5000/api/support/attachment/${id}`,
      "_blank"
    );
  };

  /* ---------- AUTH GUARD ---------- */
  if (!user || !user.token) {
    window.location.href = "/login";
    return null;
  }

  return (
    <section className="cards-section">
      <div className="support-page">
        <div className="support-card">
          <h1>Customer Support</h1>

          <div className="support-layout">
            {/* LEFT */}
            <div className="support-left">
              <img
                src={customerSupport}
                alt="Support"
                className="support-image"
              />
            </div>

            {/* RIGHT */}
            <div className="support-right">
              {!selectedTicket && (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Email</label>
                    <input value={user.username} disabled />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <input value={user.role} disabled />
                  </div>

                  <div className="form-group">
                    <label>Issue</label>
                    <select
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                    >
                      <option value="">Select Issue</option>
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div className="attachments-row">
                    <label className="file-btn">
                      📎 Attach File
                      <input
                        type="file"
                        hidden
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </label>

                    <label className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                      />
                      I confirm the information is accurate
                    </label>
                  </div>

                  <div className="button-row">
                    <button type="button" onClick={handleCancel}>
                      Cancel
                    </button>

                    <button type="submit" disabled={loading}>
                      Submit
                    </button>

                    <button type="button" onClick={handleTrackStatus}>
                      {showStatus ? "Hide Status" : "Track Status"}
                    </button>
                  </div>
                </form>
              )}

              {/* TICKET LIST */}
              {showStatus && !selectedTicket && (
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Issue</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr
                        key={t.ticket_id}
                        onClick={() => loadTicketDetails(t.ticket_id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{t.ticket_id}</td>
                        <td>{t.subject}</td>
                        <td>{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* CHAT VIEW */}
              {selectedTicket && (
                <div>
                  <button onClick={() => setSelectedTicket(null)}>
                    ← Back
                  </button>

                  <h3>Ticket #{selectedTicket.ticket_id}</h3>

                  <div style={{ height: 200, overflow: "auto" }}>
                    {messages.map((m) => (
                      <div key={m.message_id}>
                        <b>{m.sender_role}</b>: {m.message}
                      </div>
                    ))}
                  </div>

                  {/* ATTACHMENTS */}
                  {attachments.map((a) => (
                    <div key={a.attachment_id}>
                      📎 {a.file_name}
                      <button onClick={() => downloadFile(a.attachment_id)}>
                        Download
                      </button>
                    </div>
                  ))}

                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />

                  <input
                    type="file"
                    onChange={(e) => setReplyFile(e.target.files[0])}
                  />

                  <button onClick={handleReply}>Reply</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}