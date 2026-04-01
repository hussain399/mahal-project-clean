import React, { useEffect, useMemo, useState } from "react";
import {
    FaPowerOff,
    FaSignOutAlt,
    FaTrash,
    FaSearch,
    FaUserShield,
    FaHistory,
    FaPlus,
    FaTimes,
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:5000/api/v1/admin/manage";



const ROLE_COLORS = {
    SUPER_ADMIN: "#d32f2f",
    ADMIN: "#1976d2",
    FINANCE_ADMIN: "#388e3c",
    OPS_ADMIN: "#f57c00",
    SUPPORT_ADMIN: "#db309aff"
};

// Common Orange Style for Action Buttons
const orangeButtonStyle = {
    background: "#f19914",
    color: "#fff",
    border: "none",
    padding: "6px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px"
};

// Clean style for the X button
const closeButtonStyle = {
    background: "#e7aa55",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#cc9595",
    width: "0px",
};

export default function AdminUserManagement() {
    const token = localStorage.getItem("admin_token");

    const [permissions, setPermissions] = useState([]);

    const ADMIN_ROLE = localStorage.getItem("admin_role");


    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [roles, setRoles] = useState([]);

    const [showProfile, setShowProfile] = useState(false);
    const [profileAdmin, setProfileAdmin] = useState(null);
    const [showRolePerm, setShowRolePerm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [showAudit, setShowAudit] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditAdmin, setAuditAdmin] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "", role: "" });

    const loadAdmins = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/admins`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                localStorage.removeItem("admin_token");
                window.location.href = "/admin/login";
                return;
            }
            const data = await res.json();
            setAdmins(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            const res = await fetch(`${API_BASE}/roles`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setRoles(data || []);
        } catch (err) {
            console.error("Roles fetch error:", err);
        }
    };

    const loadRolePermissions = async (roleName) => {
        const res = await fetch(`${API_BASE}/roles/${roleName}/permissions`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRolePermissions(data || []);
    };

    useEffect(() => {
        loadAdmins();
        loadRoles();
    }, []);
    useEffect(() => {
        const loadPermissions = async () => {
            try {
                const res = await fetch(
                    "http://127.0.0.1:5000/api/admin/auth/me",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!res.ok) {
                    localStorage.removeItem("admin_token");
                    window.location.href = "/admin/login";
                    return;
                }

                const data = await res.json();
                setPermissions(data.permissions || []);
            } catch (e) {
                console.error("Permission bootstrap failed", e);
            }
        };

        loadPermissions();
    }, []);



    const filteredAdmins = useMemo(() => {
        return admins.filter((a) => {
            const matchSearch =
                a.name.toLowerCase().includes(search.toLowerCase()) ||
                a.email.toLowerCase().includes(search.toLowerCase());
            const matchRole = roleFilter === "ALL" || a.role_name === roleFilter;
            const matchStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && a.is_active) ||
                (statusFilter === "INACTIVE" && !a.is_active);
            return matchSearch && matchRole && matchStatus;
        });
    }, [admins, search, roleFilter, statusFilter]);

    const toggleStatus = async (admin) => {
        await fetch(`${API_BASE}/admins/${admin.admin_id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ is_active: !admin.is_active }),
        });
        loadAdmins();
    };

    const forceLogout = async (admin) => {
        if (!window.confirm(`Force logout ${admin.email}?`)) return;
        await fetch(`${API_BASE}/admins/${admin.admin_id}/force-logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        alert("Admin logged out from all sessions");
    };

    const deleteAdmin = async (admin) => {
        const confirm = prompt(`Type DELETE to permanently remove ${admin.email}`);
        if (confirm !== "DELETE") return;
        await fetch(`${API_BASE}/admins/${admin.admin_id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        loadAdmins();
    };

    const loadAuditLogs = async (adminId) => {
        try {
            const res = await fetch(
                `${API_BASE.replace("/manage", "")}/audit?admin_id=${adminId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setAuditLogs(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const createAdmin = async () => {
        if (!newAdmin.name || !newAdmin.email || !newAdmin.role) {
            alert("All fields are required");
            return;
        }
        setCreating(true);
        try {
            const res = await fetch(`${API_BASE}/admins`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newAdmin),
            });
            if (res.ok) {
                setShowCreate(false);
                setNewAdmin({ name: "", email: "", role: "" });
                loadAdmins();
            } else {
                const data = await res.json();
                alert(data.error || "Failed");
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    marginBottom: 10,
                }}
            >
                {/* Left spacer */}
                <div />

                {/* Centered title */}
                <div style={{ textAlign: "center" }}>
                    <h3 style={{ margin: 0 }}>Admin User Management</h3>
                    <p style={{ color: "#777", fontSize: 13, marginTop: 4 }}>
                        Internal staff access control & security monitoring
                    </p>
                </div>

                {/* Right-aligned small button */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {ADMIN_ROLE === "SUPER_ADMIN" && (
                        <button
                            onClick={() => setShowCreate(true)}
                            style={{
                                background: "#f19914",
                                color: "#fff",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: "12px",
                                fontWeight: 600,
                                width: "10px",
                            }}
                        >
                            <FaPlus size={11} />
                            Create Admin
                        </button>
                    )}
                </div>
            </div>


            <div style={{ display: "flex", gap: 10, margin: "20px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #ccc", padding: "4px 10px", borderRadius: 4 }}>
                    <FaSearch color="#777" />
                    <input style={{ border: "none", outline: "none" }} placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select style={{ padding: "4px 8px" }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="ALL">All Roles</option>
                    {[...new Set(admins.map(a => a.role_name))].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select style={{ padding: "4px 8px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
            </div>

            {loading ? <div style={{ padding: 30 }}>Loading admins…</div> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                            <th style={{ paddingBottom: 10 }}>Name</th>
                            <th style={{ paddingBottom: 10 }}>Email</th>
                            <th style={{ paddingBottom: 10 }}>Role</th>
                            <th style={{ paddingBottom: 10 }}>Status</th>
                            <th style={{ paddingBottom: 10 }}>Last Login</th>
                            <th style={{ paddingBottom: 10 }}>Security Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdmins.map((a) => (
                            <tr key={a.admin_id} style={{ borderBottom: "1px solid #f1f1f1" }}>
                                <td style={{ padding: "12px 0" }}>{a.name}</td>
                                <td>{a.email}</td>
                                <td>
                                    <span style={{ background: ROLE_COLORS[a.role_name] || "#555", color: "#fff", padding: "3px 8px", borderRadius: 12, fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                        <FaUserShield size={10} /> {a.role_name}
                                    </span>
                                    {ADMIN_ROLE === "SUPER_ADMIN" &&
                                        a.role_name !== "SUPER_ADMIN" && (
                                            <button
                                                title="Edit Permissions"
                                                style={{
                                                    marginLeft: 6,
                                                    border: "none",
                                                    background: "none",
                                                    cursor: "pointer",
                                                    fontSize: "14px"
                                                }}
                                                onClick={() => {
                                                    setEditingRole(a.role_name);
                                                    loadRolePermissions(a.role_name);
                                                    setShowRolePerm(true);
                                                }}
                                            >
                                                ⚙️
                                            </button>
                                        )}




                                </td>
                                <td style={{ fontWeight: 600, color: a.is_active ? "#2e7d32" : "#c62828" }}>{a.is_active ? "ACTIVE" : "DISABLED"}</td>
                                <td>{a.last_login_at || "—"}</td>
                                <td>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        {/* View Profile */}
                                        <button
                                            style={orangeButtonStyle}
                                            title="View Profile"
                                            onClick={() => {
                                                setProfileAdmin(a);
                                                setShowProfile(true);
                                            }}
                                        >
                                            👤
                                        </button>

                                        {/* Enable / Disable */}
                                        {ADMIN_ROLE === "SUPER_ADMIN" && (
                                            <button
                                                style={orangeButtonStyle}
                                                title={a.is_active ? "Deactivate Admin" : "Activate Admin"}
                                                onClick={() => toggleStatus(a)}
                                            >
                                                <FaPowerOff />
                                            </button>
                                        )}

                                        {/* Force Logout */}
                                        {ADMIN_ROLE === "SUPER_ADMIN" && (
                                            <button
                                                style={orangeButtonStyle}
                                                title="Force Logout"
                                                onClick={() => forceLogout(a)}
                                            >
                                                <FaSignOutAlt />
                                            </button>
                                        )}

                                        {/* Hard Delete */}
                                        {permissions.includes("MANAGE_ADMIN_USERS") &&
                                            a.role_name !== "SUPER_ADMIN" && (
                                                <button
                                                    style={orangeButtonStyle}
                                                    title="Hard Delete"
                                                    onClick={() => deleteAdmin(a)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}

                                        {/* View Audit Logs */}
                                        <button
                                            style={orangeButtonStyle}
                                            title="View Audit Logs"
                                            onClick={() => {
                                                setShowCreate(false);
                                                setAuditAdmin(a);
                                                setShowAudit(true);
                                                loadAuditLogs(a.admin_id);
                                            }}
                                        >
                                            <FaHistory />
                                        </button>
                                    </div>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* 1. ADMIN PROFILE MODAL */}
            {showProfile && profileAdmin && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
                    <div style={{ background: "#fff", width: 500, padding: 24, borderRadius: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <h4 style={{ margin: 0 }}>Admin Profile</h4>
                            <button style={closeButtonStyle} onClick={() => setShowProfile(false)}><FaTimes /></button>
                        </div>
                        <table style={{ width: "100%", marginTop: 20 }}>
                            <tbody style={{ fontSize: "14px", lineHeight: "2" }}>
                                <tr><td><strong>Name:</strong></td><td>{profileAdmin.name}</td></tr>
                                <tr><td><strong>Email:</strong></td><td>{profileAdmin.email}</td></tr>
                                <tr><td><strong>Role:</strong></td><td>{profileAdmin.role_name}</td></tr>
                                <tr><td><strong>Status:</strong></td><td>{profileAdmin.is_active ? "ACTIVE" : "DISABLED"}</td></tr>
                                <tr><td><strong>Created At:</strong></td><td>{profileAdmin.created_at}</td></tr>
                                <tr><td><strong>Created By:</strong></td><td>{profileAdmin.created_by || "SYSTEM"}</td></tr>
                                <tr><td><strong>Last Login:</strong></td><td>{profileAdmin.last_login_at || "—"}</td></tr>
                                <tr><td><strong>Last IP:</strong></td><td>{profileAdmin.last_login_ip || "—"}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 2. ROLE PERMISSION MODAL */}
            {showRolePerm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1300 }}>
                    <div style={{ background: "#fff", width: 600, padding: 24, borderRadius: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <h4 style={{ margin: 0 }}>Role Permissions — {editingRole}</h4>
                            <button style={closeButtonStyle} onClick={() => setShowRolePerm(false)}><FaTimes /></button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: 15 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead><tr style={{ borderBottom: "1px solid #eee" }}><th align="left" style={{ padding: 8 }}>Permission Code</th><th style={{ padding: 8 }}>Enabled</th></tr></thead>
                                <tbody>
                                    {rolePermissions.map((p, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid #fafafa" }}>
                                            <td style={{ padding: 8 }}>{p.permission_code}</td>
                                            <td align="center">
                                                <input type="checkbox" checked={p.enabled} onChange={(e) => {
                                                    const updated = [...rolePermissions];
                                                    updated[idx].enabled = e.target.checked;
                                                    setRolePermissions(updated);
                                                }} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {ADMIN_ROLE === "SUPER_ADMIN" && (
                            <button
                                style={{ ...orangeButtonStyle, marginTop: 20, width: "100%" }}
                                onClick={async () => {
                                    const selected = rolePermissions
                                        .filter(p => p.enabled)
                                        .map(p => p.permission_code);

                                    await fetch(`${API_BASE}/roles/${editingRole}/permissions`, {
                                        method: "PATCH",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${token}`,
                                        },
                                        body: JSON.stringify({ permissions: selected }),
                                    });

                                    alert("Permissions updated");
                                    setShowRolePerm(false);
                                }}
                            >
                                Save Changes
                            </button>
                        )}

                    </div>
                </div>
            )}

            {/* 3. CREATE ADMIN MODAL */}
            {showCreate && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                    <div style={{ background: "#fff", padding: 24, width: 400, borderRadius: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                            <h4 style={{ margin: 0 }}>Create New Admin</h4>
                            <button style={closeButtonStyle} onClick={() => setShowCreate(false)}><FaTimes /></button>
                        </div>
                        <input placeholder="Full Name" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 4, border: "1px solid #ddd" }} />
                        <input placeholder="Email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 4, border: "1px solid #ddd" }} />
                        <select value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })} style={{ width: "100%", marginBottom: 20, padding: 10, borderRadius: 4, border: "1px solid #ddd" }}>
                            <option value="">Select Role</option>
                            {roles.map(r => <option key={r.role_name} value={r.role_name}>{r.role_name}</option>)}
                        </select>
                        <button onClick={createAdmin} disabled={creating} style={{ ...orangeButtonStyle, width: "100%", padding: 12 }}>
                            {creating ? "Processing..." : "Create Admin Account"}
                        </button>
                    </div>
                </div>
            )}

            {/* 4. AUDIT LOGS MODAL */}
            {showAudit && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
                    <div style={{ background: "#fff", width: 750, maxHeight: "85vh", overflowY: "auto", padding: 24, borderRadius: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <h4 style={{ margin: 0 }}>Audit Logs — {auditAdmin?.email}</h4>
                            <button style={closeButtonStyle} onClick={() => { setShowAudit(false); setAuditAdmin(null); setAuditLogs([]); }}><FaTimes /></button>
                        </div>
                        {auditLogs.length === 0 ? <p style={{ color: "#777", marginTop: 20 }}>No activity records found</p> : (
                            <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                                        <th style={{ padding: 8 }}>Action</th>
                                        <th style={{ padding: 8 }}>Performed By</th>
                                        <th style={{ padding: 8 }}>IP Address</th>
                                        <th style={{ padding: 8 }}>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map(log => (
                                        <tr key={log.audit_id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                                            <td style={{ padding: 10 }}>{log.action}</td>
                                            <td>{log.performed_by} {log.performed_by_role === "SUPER_ADMIN" && <strong style={{ color: "#d32f2f" }}>(SUPER)</strong>}</td>
                                            <td>{log.ip_address}</td>
                                            <td>{new Date(log.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}