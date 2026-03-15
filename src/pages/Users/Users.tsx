import { useState, useEffect } from "react";
import {
  Edit2, Filter, Mail, MapPin, Phone,
  Plus, Search, Trash2, UserCheck, UserX, Users as UsersIcon,
  ChevronLeft, ChevronRight, Eye, TrendingUp, TrendingDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./Users.css";
import { api } from "../../services/api";

type UserStatus = "active" | "inactive" | "pending";

interface User {
  id: number;
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  home_address: string | null;
  status: string;
  office_address: string | null;
  active_address: string | null;
}

interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface Stat {
  label: string;
  value: string;
  change: string;
  Icon: LucideIcon;
  accent: string;
  bg: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | UserStatus>("all");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0, per_page: 10, current_page: 1, last_page: 1,
  });

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`users/getall?page=${page}&per_page=${pagination.per_page}`);
      const result = response.data;
      const pagData = result?.data;
      const usersArray: User[] = Array.isArray(pagData?.data)
        ? pagData.data : Array.isArray(pagData) ? pagData
        : Array.isArray(result) ? result : [];
      setUsers(usersArray);
      setPagination({
        total:        pagData?.total        ?? usersArray.length,
        per_page:     pagData?.per_page     ?? 10,
        current_page: pagData?.current_page ?? page,
        last_page:    pagData?.last_page    ?? 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(1); }, []);

  const getStatusLabel = (status: string): string => {
    if (status === "1" || status === "active") return "active";
    if (status === "0" || status === "inactive") return "inactive";
    return status;
  };

  const getAvatarUrl = (user: User) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&bold=true&size=128`;

  const stats: Stat[] = [
    { label: "Total Users",    value: pagination.total.toString(), change: "+12%", Icon: UsersIcon,  accent: "#6366f1", bg: "rgba(99,102,241,0.08)"  },
    { label: "Active Users",   value: users.filter(u => getStatusLabel(u.status) === "active").length.toString(),   change: "+8%",  Icon: UserCheck, accent: "#10b981", bg: "rgba(16,185,129,0.08)"  },
    { label: "New This Month", value: "—",                         change: "+23%", Icon: Plus,       accent: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
    { label: "Inactive",       value: users.filter(u => getStatusLabel(u.status) === "inactive").length.toString(), change: "-5%",  Icon: UserX,     accent: "#ef4444", bg: "rgba(239,68,68,0.08)"   },
  ];

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.last_page) return;
    setSelectedUsers([]);
    fetchUsers(page);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.home_address ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || getStatusLabel(user.status) === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pageNumbers = Array.from({ length: pagination.last_page }, (_, i) => i + 1);
  const rowOffset = (pagination.current_page - 1) * pagination.per_page;

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerEyebrow}>Dashboard / Users</div>
          <h1 style={styles.headerTitle}>User Management</h1>
          <p style={styles.headerSub}>Monitor, manage and control your user base</p>
        </div>
        <button style={styles.addBtn} type="button"
          onMouseEnter={e => Object.assign(e.currentTarget.style, styles.addBtnHover)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { background: "linear-gradient(135deg,#6366f1,#818cf8)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)", transform: "translateY(0)" })}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span style={{ fontWeight: 600, letterSpacing: "0.02em" }}>Add New User</span>
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={{ ...styles.statCard, borderTop: `3px solid ${stat.accent}` }}>
            <div style={{ ...styles.statIconWrap, background: stat.bg, color: stat.accent }}>
              <stat.Icon size={18} strokeWidth={2} />
            </div>
            <div style={styles.statBody}>
              <span style={styles.statLabel}>{stat.label}</span>
              <span style={styles.statValue}>{stat.value}</span>
            </div>
            <div style={{ ...styles.statChange, color: stat.change.startsWith("+") ? "#10b981" : "#ef4444", background: stat.change.startsWith("+") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
              {stat.change.startsWith("+") ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div style={styles.card}>

        {/* Card Header */}
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>All Users</h2>
            <p style={styles.cardSub}>{pagination.total} total records</p>
          </div>
          <div style={styles.toolbarRight}>
            {/* Search */}
            <div style={styles.searchBox}>
              <Search size={15} style={{ color: "#9ca3af", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            {/* Filter */}
            <div style={styles.selectWrap}>
              <Filter size={14} style={{ color: "#9ca3af", flexShrink: 0 }} />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as "all" | UserStatus)}
                style={styles.select}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedUsers.length > 0 && (
          <div style={styles.bulk}>
            <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 600 }}>{selectedUsers.length} selected</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={styles.bulkBtn} type="button"><UserCheck size={14} /> Activate</button>
              <button style={styles.bulkBtn} type="button"><UserX size={14} /> Deactivate</button>
              <button style={{ ...styles.bulkBtn, color: "#ef4444", borderColor: "#fca5a5" }} type="button"><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={styles.centered}>
            <div style={styles.spinnerRing} />
            <span style={{ color: "#9ca3af", fontSize: 14, marginTop: 12 }}>Loading users...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={styles.centered}>
            <div style={{ fontSize: 32 }}>⚠️</div>
            <p style={{ color: "#ef4444", fontSize: 14, margin: "8px 0 16px" }}>{error}</p>
            <button onClick={() => fetchUsers(1)} style={styles.retryBtn} type="button">Retry</button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <colgroup>
                  <col style={{ width: 44 }} />
                  <col style={{ width: 52 }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 116 }} />
                </colgroup>
                <thead>
                  <tr style={{ background: "#f8f9ff" }}>
                    {["#", "IMAGE", "NAME", "EMAIL", "PHONE", "ADDRESS", "STATUS", "ACTIONS"].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={8} style={styles.empty}>No users found</td></tr>
                  ) : filteredUsers.map((user, idx) => {
                    const label = getStatusLabel(user.status);
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <tr key={user.id} style={{ ...styles.tr, background: isSelected ? "#f5f3ff" : "white" }}
                        onMouseEnter={e => (e.currentTarget.style.background = isSelected ? "#f5f3ff" : "#fafbff")}
                        onMouseLeave={e => (e.currentTarget.style.background = isSelected ? "#f5f3ff" : "white")}
                      >
                        {/* # */}
                        <td style={styles.td}>
                          <span style={styles.rowNum}>{rowOffset + idx + 1}</span>
                        </td>

                        {/* Avatar */}
                        <td style={styles.td}>
                          <div style={styles.avatarWrap}>
                            <img src={getAvatarUrl(user)} alt={user.name} style={styles.avatar} />
                            <div style={{ ...styles.avatarDot, background: label === "active" ? "#10b981" : "#d1d5db" }} />
                          </div>
                        </td>

                        {/* Name */}
                        <td style={{ ...styles.td, ...styles.ellipsis, fontWeight: 600, color: "#111827", fontSize: 14 }}>
                          {user.name}
                        </td>

                        {/* Email */}
                        <td style={{ ...styles.td, ...styles.ellipsis }}>
                          <div style={styles.iconCell}>
                            <Mail size={13} style={{ color: "#6366f1", flexShrink: 0 }} />
                            <span style={{ ...styles.ellipsis, color: "#4b5563", fontSize: 13 }}>{user.email}</span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td style={styles.td}>
                          {user.phone
                            ? <div style={styles.iconCell}>
                                <Phone size={13} style={{ color: "#10b981", flexShrink: 0 }} />
                                <span style={{ color: "#4b5563", fontSize: 13 }}>{user.phone}</span>
                              </div>
                            : <span style={styles.dash}>—</span>}
                        </td>

                        {/* Address */}
                        <td style={{ ...styles.td, ...styles.ellipsis }}>
                          {user.home_address
                            ? <div style={styles.iconCell}>
                                <MapPin size={13} style={{ color: "#f59e0b", flexShrink: 0 }} />
                                <span style={{ ...styles.ellipsis, color: "#4b5563", fontSize: 13 }}>{user.home_address}</span>
                              </div>
                            : <span style={styles.dash}>—</span>}
                        </td>

                        {/* Status */}
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            ...(label === "active"   ? styles.badgeActive   : {}),
                            ...(label === "inactive" ? styles.badgeInactive : {}),
                            ...(label === "pending"  ? styles.badgePending  : {}),
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block", marginRight: 5 }} />
                            {label.charAt(0).toUpperCase() + label.slice(1)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {[
                              { Icon: Eye,   bg: "#eff6ff", color: "#3b82f6", hbg: "#dbeafe", title: "View"   },
                              { Icon: Edit2, bg: "#fffbeb", color: "#f59e0b", hbg: "#fef3c7", title: "Edit"   },
                              { Icon: Trash2,bg: "#fef2f2", color: "#ef4444", hbg: "#fee2e2", title: "Delete" },
                            ].map(({ Icon, bg, color, hbg, title }) => (
                              <button key={title} title={title} type="button"
                                style={{ ...styles.actionBtn, background: bg, color }}
                                onMouseEnter={e => Object.assign(e.currentTarget.style, { background: hbg, transform: "translateY(-1px)", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" })}
                                onMouseLeave={e => Object.assign(e.currentTarget.style, { background: bg, transform: "translateY(0)", boxShadow: "none" })}
                              >
                                <Icon size={14} strokeWidth={2} />
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={styles.pagination}>
              <span style={styles.paginfoText}>
                Showing <strong>{rowOffset + 1}</strong>–<strong>{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</strong> of <strong>{pagination.total}</strong> users
              </span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button style={styles.pageBtn} disabled={pagination.current_page === 1}
                  onClick={() => handlePageChange(pagination.current_page - 1)} type="button">
                  <ChevronLeft size={15} />
                </button>
                {pageNumbers.map(p => (
                  <button key={p} type="button"
                    style={{ ...styles.pageBtn, ...(p === pagination.current_page ? styles.pageBtnActive : {}) }}
                    onClick={() => handlePageChange(p)}
                  >{p}</button>
                ))}
                <button style={styles.pageBtn} disabled={pagination.current_page === pagination.last_page}
                  onClick={() => handlePageChange(pagination.current_page + 1)} type="button">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

/* ─── Style Objects ─── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: "#f5f6fa",
    minHeight: "100vh",
    padding: "28px 32px",
    color: "#111827",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    marginBottom: 28,
  },
  headerEyebrow: {
    fontSize: 11, fontWeight: 600, color: "#6366f1", letterSpacing: "0.1em",
    textTransform: "uppercase", marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26, fontWeight: 700, color: "#0f172a", margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  headerSub: { fontSize: 13, color: "#9ca3af", margin: 0 },
  addBtn: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
    background: "linear-gradient(135deg,#6366f1,#818cf8)",
    color: "white", border: "none", borderRadius: 10, cursor: "pointer",
    fontSize: 14, boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
    transition: "all 0.2s",
  },
  addBtnHover: {
    background: "linear-gradient(135deg,#4f46e5,#6366f1)",
    boxShadow: "0 6px 24px rgba(99,102,241,0.5)",
    transform: "translateY(-1px)",
  },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24,
  },
  statCard: {
    background: "white", borderRadius: 14, padding: "18px 20px",
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    position: "relative", overflow: "hidden",
  },
  statIconWrap: {
    width: 42, height: 42, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  statBody: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 },
  statLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500 },
  statValue: { fontSize: 22, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 },
  statChange: {
    display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600,
    padding: "3px 7px", borderRadius: 20, whiteSpace: "nowrap",
  },
  card: {
    background: "white", borderRadius: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" },
  cardSub: { fontSize: 12, color: "#9ca3af", margin: 0 },
  toolbarRight: { display: "flex", gap: 10, alignItems: "center" },
  searchBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#f8fafc", border: "1.5px solid #e2e8f0",
    borderRadius: 8, padding: "7px 12px", width: 220,
  },
  searchInput: {
    border: "none", outline: "none", background: "transparent",
    fontSize: 13, color: "#374151", width: "100%",
  },
  selectWrap: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#f8fafc", border: "1.5px solid #e2e8f0",
    borderRadius: 8, padding: "7px 12px",
  },
  select: {
    border: "none", outline: "none", background: "transparent",
    fontSize: 13, color: "#374151", cursor: "pointer",
  },
  bulk: {
    display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between",
    padding: "10px 24px", background: "#faf5ff", borderBottom: "1px solid #e9d5ff",
  },
  bulkBtn: {
    display: "flex", alignItems: "center", gap: 5, padding: "5px 12px",
    background: "white", border: "1.5px solid #e2e8f0", borderRadius: 6,
    fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer",
  },
  centered: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "64px 24px",
  },
  spinnerRing: {
    width: 36, height: 36, border: "3px solid #e2e8f0",
    borderTopColor: "#6366f1", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  retryBtn: {
    padding: "8px 20px", background: "#6366f1", color: "white",
    border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
  },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  th: {
    padding: "11px 16px", textAlign: "left" as const,
    fontSize: 10.5, fontWeight: 700, color: "#94a3b8",
    letterSpacing: "0.07em", textTransform: "uppercase" as const,
    borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" as const,
    background: "#f8f9ff",
  },
  tr: { borderBottom: "1px solid #f8fafc", transition: "background 0.12s" },
  td: { padding: "13px 16px", verticalAlign: "middle" as const, overflow: "hidden" },
  rowNum: {
    width: 24, height: 24, borderRadius: 6,
    background: "#f1f5f9", color: "#64748b",
    fontSize: 12, fontWeight: 600,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },
  avatarWrap: { position: "relative", width: 36, height: 36, display: "inline-block" },
  avatar: { width: 36, height: 36, borderRadius: 9, objectFit: "cover", display: "block" },
  avatarDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 9, height: 9, borderRadius: "50%", border: "2px solid white",
  },
  ellipsis: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  iconCell: { display: "flex", alignItems: "center", gap: 6, overflow: "hidden" },
  dash: { color: "#d1d5db", fontSize: 14 },
  badge: {
    display: "inline-flex", alignItems: "center",
    padding: "4px 10px", borderRadius: 20,
    fontSize: 11.5, fontWeight: 600, letterSpacing: "0.02em",
    whiteSpace: "nowrap",
  },
  badgeActive:   { background: "#d1fae5", color: "#059669" },
  badgeInactive: { background: "#fee2e2", color: "#dc2626" },
  badgePending:  { background: "#fef3c7", color: "#d97706" },
  actionBtn: {
    width: 28, height: 28, border: "none", borderRadius: 7,
    cursor: "pointer", display: "inline-flex",
    alignItems: "center", justifyContent: "center",
    transition: "all 0.15s", flexShrink: 0,
  },
  pagination: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 24px", borderTop: "1px solid #f1f5f9",
  },
  paginfoText: { fontSize: 13, color: "#6b7280" },
  pageBtn: {
    minWidth: 32, height: 32, padding: "0 8px",
    border: "1.5px solid #e2e8f0", borderRadius: 7,
    background: "white", color: "#374151",
    fontSize: 13, fontWeight: 500, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s",
  },
  pageBtnActive: {
    background: "linear-gradient(135deg,#6366f1,#818cf8)",
    borderColor: "#6366f1", color: "white",
    boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
  },
  empty: {
    textAlign: "center" as const, padding: "64px 24px",
    color: "#9ca3af", fontSize: 14,
  },
};

export default Users;