// import React, { useEffect, useState, useRef } from "react";

// const API_BASE = "http://127.0.0.1:5000/api/v1/admin/support";

// export default function SupportAdminPanel() {

//     const ADMIN_TOKEN = localStorage.getItem("admin_token");


//     const headers = {
//         Authorization: `Bearer ${ADMIN_TOKEN}`,
//         "Content-Type": "application/json"
//     };

//     const pollingRef = useRef(null);
//     const selectedTicketRef = useRef(null);

//     /* ================= STATE ================= */

//     const [tickets, setTickets] = useState([]);
//     const [admins, setAdmins] = useState([]);
//     const [selectedTicket, setSelectedTicket] = useState(null);

//     const [messages, setMessages] = useState([]);
//     const [notes, setNotes] = useState([]);
//     const [history, setHistory] = useState([]);

//     const [replyText, setReplyText] = useState("");
//     const [noteText, setNoteText] = useState("");

//     const [dashboard, setDashboard] = useState({});
//     const [filterStatus, setFilterStatus] = useState("");
//     const [filterPriority, setFilterPriority] = useState("");

//     const ADMIN_ROLE = localStorage.getItem("admin_role");
//     const ADMIN_ID = parseInt(localStorage.getItem("admin_id"));

//     /* ================= LOADERS ================= */

//     const loadDashboard = async () => {

//         try {
//             const res = await fetch(`${API_BASE}/dashboard`, { headers });
//             if (!res.ok) return;
//             setDashboard(await res.json());
//         } catch { }
//     };

//     const loadAdmins = async () => {

//         try {
//             const res = await fetch(`${API_BASE}/admins`, { headers });
//             if (!res.ok) return;
//             setAdmins(await res.json());
//         } catch { }
//     };

//     const loadTickets = async () => {

//         try {

//             let url = `${API_BASE}/tickets?`;

//             if (filterStatus)
//                 url += `status=${filterStatus}&`;

//             if (filterPriority)
//                 url += `priority=${filterPriority}&`;

//             const res = await fetch(url, { headers });

//             if (!res.ok) return;

//             const data = await res.json();

//             setTickets(data);

//         } catch { }
//     };

// const loadTicketDetails = async (ticketId) => {
//     try {
//         selectedTicketRef.current = ticketId;

//         const res = await fetch(`${API_BASE}/ticket/${ticketId}`, { headers });

//         if (!res.ok) {
//             console.error("Ticket details failed:", await res.text());
//             return;
//         }

//         const data = await res.json();

//         setSelectedTicket({
//             ...data.ticket,
//             attachments: data.attachments
//         });

//         setMessages(data.messages);
//         setNotes(data.notes);
//         setHistory(data.history);

//     } catch (err) {
//         console.error("Ticket load error:", err);
//     }
// };



//     /* ================= ACTIONS ================= */

//     const assignTicket = async (ticketId, adminId) => {

//         await fetch(`${API_BASE}/ticket/${ticketId}/assign`, {
//             method: "POST",
//             headers,
//             body: JSON.stringify({ admin_id: adminId })
//         });

//         loadTickets();
//         loadTicketDetails(ticketId);
//     };

//     const autoAssign = async (ticketId) => {

//         await fetch(`${API_BASE}/ticket/${ticketId}/auto-assign`, {
//             method: "POST",
//             headers
//         });

//         loadTickets();
//         loadTicketDetails(ticketId);
//     };

//     const unassignTicket = async (ticketId) => {

//         await fetch(`${API_BASE}/ticket/${ticketId}/unassign`, {
//             method: "POST",
//             headers
//         });

//         loadTickets();
//         loadTicketDetails(ticketId);
//     };

//     const escalate = async (ticketId) => {

//         await fetch(`${API_BASE}/ticket/${ticketId}/escalate`, {
//             method: "POST",
//             headers
//         });

//         loadTickets();
//         loadTicketDetails(ticketId);
//     };

//     const deEscalate = async (ticketId) => {

//         await fetch(`${API_BASE}/ticket/${ticketId}/de-escalate`, {
//             method: "POST",
//             headers
//         });

//         loadTickets();
//         loadTicketDetails(ticketId);
//     };

//     const reopenTicket = async (ticketId) => {

//         await fetch(`${API_BASE}/ticket/${ticketId}/reopen`, {
//             method: "POST",
//             headers
//         });

//         loadTickets();
//         loadTicketDetails(ticketId);
//     };

//     const changeStatus = async (ticketId, status) => {

//         await fetch(`${API_BASE}/ticket/${ticketId}/status`, {
//             method: "POST",
//             headers,
//             body: JSON.stringify({ status })
//         });

//         loadTickets();
//         loadTicketDetails(ticketId);
//     };

// const reply = async () => {

//     if (!replyText || !selectedTicket) return;

//     await fetch(`${API_BASE}/ticket/${selectedTicket.ticket_id}/reply`, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({ message: replyText })
//     });

//     setReplyText("");

//     if (selectedTicket?.ticket_id) {
//         loadTicketDetails(selectedTicket.ticket_id);
//     }
// };

// const addNote = async () => {

//     if (!noteText || !selectedTicket) return;

//     await fetch(`${API_BASE}/ticket/${selectedTicket.ticket_id}/note`, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({ note: noteText })
//     });

//     setNoteText("");

//     if (selectedTicket?.ticket_id) {
//         loadTicketDetails(selectedTicket.ticket_id);
//     }
// };




//     /* ================= INIT ================= */

// useEffect(() => {

//     loadDashboard();
//     loadAdmins();
//     loadTickets();

//     // ✅ SLOW polling (tickets list)
//     const ticketInterval = setInterval(() => {
//         loadTickets();
//     }, 50000); // 15 sec

//     // ✅ FAST polling (selected ticket only)
//     const detailInterval = setInterval(() => {

//         if (
//             selectedTicketRef.current &&
//             selectedTicket &&
//             selectedTicket.ticket_id === selectedTicketRef.current &&
//             selectedTicket.status !== "closed"
//         ) {
//             loadTicketDetails(selectedTicketRef.current);
//         }

//     }, 60000); // keep 5 sec

//     return () => {
//         clearInterval(ticketInterval);
//         clearInterval(detailInterval);
//     };

// }, []);

//     useEffect(() => {

//         loadTickets();

//     }, [filterStatus, filterPriority]);

// const attachmentCache = new Map();

// function AttachmentPreview({ a }) {

//     const [url, setUrl] = useState(null);
//     const [error, setError] = useState(false);

//     useEffect(() => {

//         let objectUrl;

//         const load = async () => {

//             // ✅ CACHE HIT
//             if (attachmentCache.has(a.attachment_id)) {
//                 setUrl(attachmentCache.get(a.attachment_id));
//                 return;
//             }

//             try {
//                 const res = await fetch(
//                     `http://127.0.0.1:5000/api/v1/admin/support/attachment/${a.attachment_id}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${localStorage.getItem("admin_token")}`
//                         }
//                     }
//                 );

//                 if (!res.ok) {
//                     console.error("Attachment failed:", await res.text());
//                     setError(true);
//                     return;
//                 }

//                 const blob = await res.blob();
//                 objectUrl = URL.createObjectURL(blob);

//                 // ✅ STORE IN CACHE
//                 attachmentCache.set(a.attachment_id, objectUrl);

//                 setUrl(objectUrl);

//             } catch (err) {
//                 console.error("Attachment error:", err);
//                 setError(true);
//             }
//         };

//         load();

//         return () => {
//             // ❌ DO NOT revoke if cached (important)
//             // only revoke if not cached
//             if (objectUrl && !attachmentCache.has(a.attachment_id)) {
//                 URL.revokeObjectURL(objectUrl);
//             }
//         };

//     }, [a.attachment_id]);

//     if (error) return <div style={{ color: "red" }}>Failed</div>;
//     if (!url) return <div>Loading...</div>;

//     // IMAGE PREVIEW
//     if (a.file_type?.startsWith("image")) {
//         return (
//             <div style={{ marginBottom: "10px" }}>
//                 <img
//                     src={url}
//                     alt={a.file_name}
//                     style={{
//                         maxWidth: "200px",
//                         borderRadius: "8px"
//                     }}
//                 />
//             </div>
//         );
//     }

//     // FILE PREVIEW
//     return (
//         <a href={url} target="_blank" rel="noreferrer">
//             📎 {a.file_name}
//         </a>
//     );
// }

//     /* ================= HELPERS ================= */

//     const slaColor = (ticket) =>
//         ticket.sla_breached ? "red" : "green";

//     const priorityColor = (p) =>
//         p === "high" ? "red" :
//             p === "normal" ? "orange" : "green";

//     /* ================= UI ================= */

//     return (

//         <div style={{ display: "flex", height: "100vh" }}>

//             {/* LEFT PANEL */}

//             <div style={{ width: "40%", padding: 10 }}>

//                 <h3>Dashboard</h3>

//                 <div>
//                     Open: {dashboard.open || 0} |
//                     In Progress: {dashboard.in_progress || 0} |
//                     Closed: {dashboard.closed || 0}
//                 </div>

//                 <hr />

//                 <select onChange={e => setFilterStatus(e.target.value)}>
//                     <option value="">All Status</option>
//                     <option value="open">Open</option>
//                     <option value="in_progress">In Progress</option>
//                     <option value="resolved">Resolved</option>
//                 </select>

//                 <select onChange={e => setFilterPriority(e.target.value)}>
//                     <option value="">All Priority</option>
//                     <option value="high">High</option>
//                     <option value="normal">Normal</option>
//                     <option value="low">Low</option>
//                 </select>

//                 <table border="1" width="100%">
//                     <tbody>

//                         {tickets.map(t => (

//                             <tr key={t.ticket_id}
//                                 onClick={() => loadTicketDetails(t.ticket_id)}
//                                 style={{ cursor: "pointer" }}>

//                                 <td>{t.ticket_id}</td>

//                                 <td>
//                                     {t.source_role?.toUpperCase()}
//                                 </td>

//                                 <td>
//                                     {t.source_name || "Unknown"}
//                                 </td>

//                                 <td>{t.status}</td>

//                                 <td style={{ color: priorityColor(t.original_priority || t.priority) }}>
//                                     {t.original_priority || t.priority}
//                                 </td>


//                                 <td style={{ color: slaColor(t) }}>
//                                     {t.sla_breached ? "BREACHED" : "OK"}
//                                 </td>

//                             </tr>

//                         ))}

//                     </tbody>
//                 </table>

//             </div>

//             {/* RIGHT PANEL */}

//             <div style={{ width: "60%", padding: 10 }}>

//                 {!selectedTicket && "Select ticket"}

//                 {selectedTicket && (

//                     <>

//                         <h3>
//                             Ticket #{selectedTicket.ticket_id}
//                             — {selectedTicket.source_role?.toUpperCase()}
//                             — {selectedTicket.source_name}
//                             (Escalation: {selectedTicket.escalation_level || 0})
//                         </h3>

//                         <select onChange={e =>
//                             selectedTicket && assignTicket(selectedTicket.ticket_id, e.target.value)}>
//                             <option>Assign Admin</option>

//                             {admins.map(a => (
//                                 <option key={a.admin_id} value={a.admin_id}>
//                                     {a.name}
//                                 </option>
//                             ))}
//                         </select>

//                         <div style={{
//                             display: "flex",
//                             gap: "8px",
//                             flexWrap: "nowrap",
//                             alignItems: "center",
//                             marginTop: "10px"
//                         }}>

//                             {/* SUPER ADMIN ONLY */}
//                             {ADMIN_ROLE === "SUPER_ADMIN" && (
//                                 <>
//                                     <button
//                                         onClick={() => selectedTicket && autoAssign(selectedTicket.ticket_id)}
//                                         style={{
//                                             backgroundColor: "#2563eb",
//                                             color: "white",
//                                             padding: "6px 12px",
//                                             border: "none",
//                                             borderRadius: "4px",
//                                             cursor: "pointer",
//                                             fontSize: "13px"
//                                         }}
//                                     >
//                                         Auto Assign
//                                     </button>

//                                     <button
//                                         onClick={() => selectedTicket && unassignTicket(selectedTicket.ticket_id)}
//                                         style={{
//                                             backgroundColor: "#6b7280",
//                                             color: "white",
//                                             padding: "6px 12px",
//                                             border: "none",
//                                             borderRadius: "4px",
//                                             cursor: "pointer",
//                                             fontSize: "13px"
//                                         }}
//                                     >
//                                         Unassign
//                                     </button>
//                                 </>
//                             )}

//                             {/* ESCALATE — Assigned admin OR supervisors */}
//                             {(selectedTicket.assigned_admin_id === ADMIN_ID ||
//                                 ADMIN_ROLE === "OPS_ADMIN" ||
//                                 ADMIN_ROLE === "SUPER_ADMIN") && (

//                                     <button
//                                         onClick={() => selectedTicket && escalate(selectedTicket.ticket_id)}
//                                         style={{
//                                             backgroundColor: "#dc2626",
//                                             color: "white",
//                                             padding: "6px 12px",
//                                             border: "none",
//                                             borderRadius: "4px",
//                                             cursor: "pointer",
//                                             fontSize: "13px"
//                                         }}
//                                     >
//                                         Escalate
//                                     </button>
//                                 )}

//                             {/* DE-ESCALATE — OPS_ADMIN + SUPER_ADMIN only */}
//                             {(selectedTicket.escalation_level > 0 &&
//                                 (ADMIN_ROLE === "OPS_ADMIN" ||
//                                     ADMIN_ROLE === "SUPER_ADMIN")) && (

//                                     <button
//                                         onClick={() => deEscalate(selectedTicket.ticket_id)}
//                                         style={{
//                                             backgroundColor: "#ea580c",
//                                             color: "white",
//                                             padding: "6px 12px",
//                                             border: "none",
//                                             borderRadius: "4px",
//                                             cursor: "pointer",
//                                             fontSize: "13px"
//                                         }}
//                                     >
//                                         De-Escalate
//                                     </button>
//                                 )}

//                             {/* RESOLVE — Assigned admin OR supervisors */}
//                             {(selectedTicket.assigned_admin_id === ADMIN_ID ||
//                                 ADMIN_ROLE === "OPS_ADMIN" ||
//                                 ADMIN_ROLE === "SUPER_ADMIN") && (

//                                     <button
//                                         onClick={() =>
//                                             changeStatus(selectedTicket.ticket_id, "resolved")
//                                         }
//                                         style={{
//                                             backgroundColor: "#16a34a",
//                                             color: "white",
//                                             padding: "6px 12px",
//                                             border: "none",
//                                             borderRadius: "4px",
//                                             cursor: "pointer",
//                                             fontSize: "13px"
//                                         }}
//                                     >
//                                         Resolve
//                                     </button>
//                                 )}

//                             {/* REOPEN — supervisors only */}
//                             {(ADMIN_ROLE === "OPS_ADMIN" ||
//                                 ADMIN_ROLE === "SUPER_ADMIN") && (

//                                     <button
//                                         onClick={() => reopenTicket(selectedTicket.ticket_id)}
//                                         style={{
//                                             backgroundColor: "#0891b2",
//                                             color: "white",
//                                             padding: "6px 12px",
//                                             border: "none",
//                                             borderRadius: "4px",
//                                             cursor: "pointer",
//                                             fontSize: "13px"
//                                         }}
//                                     >
//                                         Reopen
//                                     </button>
//                                 )}

//                             {/* CLOSE — supervisors only */}
//                             {(ADMIN_ROLE === "OPS_ADMIN" ||
//                                 ADMIN_ROLE === "SUPER_ADMIN") && (

//                                     <button
//                                         onClick={() =>
//                                             changeStatus(selectedTicket.ticket_id, "closed")
//                                         }
//                                         style={{
//                                             backgroundColor: "#111827",
//                                             color: "white",
//                                             padding: "6px 12px",
//                                             border: "none",
//                                             borderRadius: "4px",
//                                             cursor: "pointer",
//                                             fontSize: "13px"
//                                         }}
//                                     >
//                                         Close
//                                     </button>
//                                 )}

//                         </div>



//                         <hr />

//                         <div style={{
//                             height: 250,
//                             overflow: "auto",
//                             border: "1px solid #ccc"
//                         }}>
//                             {messages.map(m => (
//                                 <div key={m.message_id}>
//                                     <b>{m.sender_role}</b>: {m.message}
//                                 </div>
//                             ))}
//                         </div>
//                         {selectedTicket.attachments?.length > 0 && (
//                             <div style={{ marginTop: "10px" }}>
//                                 <b>Attachments:</b>

//                                 {selectedTicket.attachments.map(a => (
//                                     <AttachmentPreview key={a.attachment_id} a={a} />
//                                 ))}
//                             </div>
//                         )}

//                         <textarea value={replyText}
//                             onChange={e => setReplyText(e.target.value)} />

//                         <button onClick={reply}>Reply</button>

//                         <hr />

//                         <textarea value={noteText}
//                             onChange={e => setNoteText(e.target.value)} />

//                         <button onClick={addNote}>Add Note</button>

//                     </>
//                 )}

//             </div>

//         </div>
//     );
// }



import React, { useEffect, useState, useRef } from "react";

const API_BASE = "http://127.0.0.1:5000/api/v1/admin/support";

export default function SupportAdminPanel() {

    const ADMIN_TOKEN = localStorage.getItem("admin_token");


    const headers = {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json"
    };

    const pollingRef = useRef(null);
    const selectedTicketRef = useRef(null);

    /* ================= STATE ================= */

    const [tickets, setTickets] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [messages, setMessages] = useState([]);
    const [notes, setNotes] = useState([]);
    const [history, setHistory] = useState([]);

    const [replyText, setReplyText] = useState("");
    const [noteText, setNoteText] = useState("");

    const [dashboard, setDashboard] = useState({});
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPriority, setFilterPriority] = useState("");

    const ADMIN_ROLE = localStorage.getItem("admin_role");
    const ADMIN_ID = parseInt(localStorage.getItem("admin_id"));

    /* ================= LOADERS ================= */

    const loadDashboard = async () => {

        try {
            const res = await fetch(`${API_BASE}/dashboard`, { headers });
            if (!res.ok) return;
            setDashboard(await res.json());
        } catch { }
    };

    const loadAdmins = async () => {

        try {
            const res = await fetch(`${API_BASE}/admins`, { headers });
            if (!res.ok) return;
            setAdmins(await res.json());
        } catch { }
    };

    const loadTickets = async () => {

        try {

            let url = `${API_BASE}/tickets?`;

            if (filterStatus)
                url += `status=${filterStatus}&`;

            if (filterPriority)
                url += `priority=${filterPriority}&`;

            const res = await fetch(url, { headers });

            if (!res.ok) return;

            const data = await res.json();

            setTickets(data);

        } catch { }
    };

    const loadTicketDetails = async (ticketId) => {
        try {
            selectedTicketRef.current = ticketId;

            const res = await fetch(`${API_BASE}/ticket/${ticketId}`, { headers });

            if (!res.ok) {
                console.error("Ticket details failed:", await res.text());
                return;
            }

            const data = await res.json();

            setSelectedTicket({
                ...data.ticket,
                attachments: data.attachments
            });

            setMessages(data.messages);
            setNotes(data.notes);
            setHistory(data.history);

        } catch (err) {
            console.error("Ticket load error:", err);
        }
    };



    /* ================= ACTIONS ================= */

    const assignTicket = async (ticketId, adminId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/assign`, {
            method: "POST",
            headers,
            body: JSON.stringify({ admin_id: adminId })
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const autoAssign = async (ticketId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/auto-assign`, {
            method: "POST",
            headers
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const unassignTicket = async (ticketId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/unassign`, {
            method: "POST",
            headers
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const escalate = async (ticketId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/escalate`, {
            method: "POST",
            headers
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const deEscalate = async (ticketId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/de-escalate`, {
            method: "POST",
            headers
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const reopenTicket = async (ticketId) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/reopen`, {
            method: "POST",
            headers
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const changeStatus = async (ticketId, status) => {

        await fetch(`${API_BASE}/ticket/${ticketId}/status`, {
            method: "POST",
            headers,
            body: JSON.stringify({ status })
        });

        loadTickets();
        loadTicketDetails(ticketId);
    };

    const reply = async () => {

        if (!replyText || !selectedTicket) return;

        await fetch(`${API_BASE}/ticket/${selectedTicket.ticket_id}/reply`, {
            method: "POST",
            headers,
            body: JSON.stringify({ message: replyText })
        });

        setReplyText("");

        if (selectedTicket?.ticket_id) {
            loadTicketDetails(selectedTicket.ticket_id);
        }
    };

    const addNote = async () => {

        if (!noteText || !selectedTicket) return;

        await fetch(`${API_BASE}/ticket/${selectedTicket.ticket_id}/note`, {
            method: "POST",
            headers,
            body: JSON.stringify({ note: noteText })
        });

        setNoteText("");

        if (selectedTicket?.ticket_id) {
            loadTicketDetails(selectedTicket.ticket_id);
        }
    };




    /* ================= INIT ================= */

    useEffect(() => {

        loadDashboard();
        loadAdmins();
        loadTickets();

        // ✅ SLOW polling (tickets list)
        const ticketInterval = setInterval(() => {
            loadTickets();
        }, 50000); // 15 sec

        // ✅ FAST polling (selected ticket only)
        const detailInterval = setInterval(() => {

            if (
                selectedTicketRef.current &&
                selectedTicket &&
                selectedTicket.ticket_id === selectedTicketRef.current &&
                selectedTicket.status !== "closed"
            ) {
                loadTicketDetails(selectedTicketRef.current);
            }

        }, 60000); // keep 5 sec

        return () => {
            clearInterval(ticketInterval);
            clearInterval(detailInterval);
        };

    }, []);

    useEffect(() => {

        loadTickets();

    }, [filterStatus, filterPriority]);

    const attachmentCache = new Map();

    function AttachmentPreview({ a }) {

        const [url, setUrl] = useState(null);
        const [error, setError] = useState(false);

        useEffect(() => {

            let objectUrl;

            const load = async () => {

                // ✅ CACHE HIT
                if (attachmentCache.has(a.attachment_id)) {
                    setUrl(attachmentCache.get(a.attachment_id));
                    return;
                }

                try {
                    const res = await fetch(
                        `http://127.0.0.1:5000/api/v1/admin/support/attachment/${a.attachment_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("admin_token")}`
                            }
                        }
                    );

                    if (!res.ok) {
                        console.error("Attachment failed:", await res.text());
                        setError(true);
                        return;
                    }

                    const blob = await res.blob();
                    objectUrl = URL.createObjectURL(blob);

                    // ✅ STORE IN CACHE
                    attachmentCache.set(a.attachment_id, objectUrl);

                    setUrl(objectUrl);

                } catch (err) {
                    console.error("Attachment error:", err);
                    setError(true);
                }
            };

            load();

            return () => {
                // ❌ DO NOT revoke if cached (important)
                // only revoke if not cached
                if (objectUrl && !attachmentCache.has(a.attachment_id)) {
                    URL.revokeObjectURL(objectUrl);
                }
            };

        }, [a.attachment_id]);

        if (error) return <div style={{ color: "red" }}>Failed</div>;
        if (!url) return <div>Loading...</div>;

        // IMAGE PREVIEW
        if (a.file_type?.startsWith("image")) {
            return (
                <div style={{ marginBottom: "10px" }}>
                    <img
                        src={url}
                        alt={a.file_name}
                        style={{
                            maxWidth: "200px",
                            borderRadius: "8px"
                        }}
                    />
                </div>
            );
        }

        // FILE PREVIEW
        return (
            <a href={url} target="_blank" rel="noreferrer">
                📎 {a.file_name}
            </a>
        );
    }

    /* ================= HELPERS ================= */

    const slaColor = (ticket) =>
        ticket.sla_breached ? "red" : "green";

    const priorityColor = (p) =>
        p === "high" ? "red" :
            p === "normal" ? "orange" : "green";

    /* ================= UI ================= */

    return (

        <div style={{ display: "flex", height: "200vh" }}>

            {/* LEFT PANEL */}

                        <div style={{ width: "70%", padding: 10 }}>

                <h3>Dashboard</h3>

                <div>
                    Open: {dashboard.open || 0} |
                    In Progress: {dashboard.in_progress || 0} |
                    Closed: {dashboard.closed || 0}
                </div>

                <hr />

                <select onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>

                <select onChange={e => setFilterPriority(e.target.value)}>
                    <option value="">All Priority</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                </select>

               <table border="1" width="100%" style={{ textAlign: "center", marginTop: "10px" }}>

    <thead style={{ background: "#f5f5f5" }}>
        <tr>
            <th style={{ padding: "12px", fontSize: "14px" }}>ID</th>
            <th style={{ padding: "12px", fontSize: "14px" }}>Type</th>
            <th style={{ padding: "12px", fontSize: "14px" }}>Name</th>
            <th style={{ padding: "12px", fontSize: "14px" }}>Subject</th>
            <th style={{ padding: "12px", fontSize: "14px" }}>Status</th>
            <th style={{ padding: "12px", fontSize: "14px" }}>Priority</th>
            <th style={{ padding: "12px", fontSize: "14px" }}>Created At</th>
            <th style={{ padding: "12px", fontSize: "14px" }}>Service Level (SLA)</th>
        </tr>
    </thead>

    <tbody>
        {tickets.map(t => (

            <tr key={t.ticket_id}
                onClick={() => loadTicketDetails(t.ticket_id)}
                style={{ cursor: "pointer" }}>

                <td style={{ padding: "12px", fontSize: "14px" }}>
                    {t.ticket_id}
                </td>

                <td style={{ padding: "12px", fontSize: "14px" }}>
                    {t.source_role?.toUpperCase()}
                </td>

                <td style={{ padding: "12px", fontSize: "14px" }}>
                    {t.source_name || "Unknown"}
                </td>

                <td style={{ padding: "12px", fontSize: "14px" }}>
                    {t.subject || "-"}
                </td>

                <td style={{ padding: "12px", fontSize: "14px" }}>
                    {t.status}
                </td>

                <td style={{
                    padding: "12px",
                    fontSize: "14px",
                    color: priorityColor(t.original_priority || t.priority)
                }}>
                    {t.original_priority || t.priority}
                </td>

                <td style={{ padding: "12px", fontSize: "14px" }}>
                    {t.created_at
                        ? new Date(t.created_at).toLocaleString()
                        : "-"}
                </td>

                <td style={{
                    padding: "12px",
                    fontSize: "14px",
                    color: slaColor(t)
                }}>
                    {t.sla_breached ? "SLA Breached" : "Within SLA"}
                </td>

            </tr>

        ))}
    </tbody>

    </table>
            </div>
            {/* RIGHT PANEL */}

            <div style={{ width: "90%", padding: 10 }}>

                {!selectedTicket && "Select ticket"}

                {selectedTicket && (

                    <>

                        <h3>
                            Ticket #{selectedTicket.ticket_id}
                            — {selectedTicket.source_role?.toUpperCase()}
                            — {selectedTicket.source_name}
                            (Escalation: {selectedTicket.escalation_level || 0})
                        </h3>

                        <select onChange={e =>
                            selectedTicket && assignTicket(selectedTicket.ticket_id, e.target.value)}>
                            <option>Assign Admin</option>

                            {admins.map(a => (
                                <option key={a.admin_id} value={a.admin_id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>

                        <div style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "nowrap",
                            alignItems: "center",
                            marginTop: "10px"
                        }}>

                            {/* SUPER ADMIN ONLY */}
                            {ADMIN_ROLE === "SUPER_ADMIN" && (
                                <>
                                    <button
                                        onClick={() => selectedTicket && autoAssign(selectedTicket.ticket_id)}
                                        style={{
                                            backgroundColor: "#2563eb",
                                            color: "white",
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Auto Assign
                                    </button>

                                    <button
                                        onClick={() => selectedTicket && unassignTicket(selectedTicket.ticket_id)}
                                        style={{
                                            backgroundColor: "#6b7280",
                                            color: "white",
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Unassign
                                    </button>
                                </>
                            )}

                            {/* ESCALATE — Assigned admin OR supervisors */}
                            {(selectedTicket.assigned_admin_id === ADMIN_ID ||
                                ADMIN_ROLE === "OPS_ADMIN" ||
                                ADMIN_ROLE === "SUPER_ADMIN") && (

                                    <button
                                        onClick={() => selectedTicket && escalate(selectedTicket.ticket_id)}
                                        style={{
                                            backgroundColor: "#dc2626",
                                            color: "white",
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Escalate
                                    </button>
                                )}

                            {/* DE-ESCALATE — OPS_ADMIN + SUPER_ADMIN only */}
                            {(selectedTicket.escalation_level > 0 &&
                                (ADMIN_ROLE === "OPS_ADMIN" ||
                                    ADMIN_ROLE === "SUPER_ADMIN")) && (

                                    <button
                                        onClick={() => deEscalate(selectedTicket.ticket_id)}
                                        style={{
                                            backgroundColor: "#ea580c",
                                            color: "white",
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        De-Escalate
                                    </button>
                                )}

                            {/* RESOLVE — Assigned admin OR supervisors */}
                            {(selectedTicket.assigned_admin_id === ADMIN_ID ||
                                ADMIN_ROLE === "OPS_ADMIN" ||
                                ADMIN_ROLE === "SUPER_ADMIN") && (

                                    <button
                                        onClick={() =>
                                            changeStatus(selectedTicket.ticket_id, "resolved")
                                        }
                                        style={{
                                            backgroundColor: "#16a34a",
                                            color: "white",
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Resolve
                                    </button>
                                )}

                            {/* REOPEN — supervisors only */}
                            {(ADMIN_ROLE === "OPS_ADMIN" ||
                                ADMIN_ROLE === "SUPER_ADMIN") && (

                                    <button
                                        onClick={() => reopenTicket(selectedTicket.ticket_id)}
                                        style={{
                                            backgroundColor: "#0891b2",
                                            color: "white",
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Reopen
                                    </button>
                                )}

                            {/* CLOSE — supervisors only */}
                            {(ADMIN_ROLE === "OPS_ADMIN" ||
                                ADMIN_ROLE === "SUPER_ADMIN") && (

                                    <button
                                        onClick={() =>
                                            changeStatus(selectedTicket.ticket_id, "closed")
                                        }
                                        style={{
                                            backgroundColor: "#111827",
                                            color: "white",
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Close
                                    </button>
                                )}

                        </div>



                        <hr />

                        <div style={{
                            height: 250,
                            overflow: "auto",
                            border: "1px solid #ccc"
                        }}>
                            {messages.map(m => (
                                <div key={m.message_id}>
                                    <b>{m.sender_role}</b>: {m.message}
                                </div>
                            ))}
                        </div>
                        {selectedTicket.attachments?.length > 0 && (
                            <div style={{ marginTop: "10px" }}>
                                <b>Attachments:</b>

                                {selectedTicket.attachments.map(a => (
                                    <AttachmentPreview key={a.attachment_id} a={a} />
                                ))}
                            </div>
                        )}

                        <textarea value={replyText}
                            onChange={e => setReplyText(e.target.value)} />

                        <button onClick={reply}>Reply</button>

                        <hr />

                        <textarea value={noteText}
                            onChange={e => setNoteText(e.target.value)} />

                        <button onClick={addNote}>Add Note</button>

                    </>
                )}

            </div>

        </div>
    );
}