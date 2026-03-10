import { useState, useEffect } from "react";
import { api } from "../../services/api";
import "./DeliveryBoys.css";

interface DeliveryBoy {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  father_name?: string;
  aadhaar_number?: string;
  profile_image?: string;
  is_active: boolean;
}

interface PaginatedResponse {
  data: DeliveryBoy[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

const initialForm = {
  name: "", phone: "", email: "", address: "",
  father_name: "", aadhaar_number: "", is_active: true,
};

export default function DeliveryBoys() {
  const [boys, setBoys] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<typeof initialForm>>({});
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ── Fetch delivery boys from API ──
  const fetchBoys = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`deliveryboy/getall?page=${page}`);
      const json: PaginatedResponse = await  res.data;
      setBoys(json.data);
      setCurrentPage(json.current_page);
      setLastPage(json.last_page);
      setTotal(json.total);
    } catch (err) {
      setError("Failed to load delivery agents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoys(1); }, []);

  // ── Client-side search filter ──
  const filtered = boys.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.phone.includes(search)
  );

  const validate = () => {
    const e: Partial<typeof initialForm> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{10,15}$/.test(form.phone)) e.phone = "Enter valid phone number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (form.aadhaar_number && !/^\d{12}$/.test(form.aadhaar_number)) e.aadhaar_number = "Aadhaar must be 12 digits";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
    //   const res = await api.get(`deliveryboy/create?page=${page}`);
    //   const res = await fetch(`${API_BASE}/deliveryboy/create`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(form),
    //   });
    //   if (!res.ok) throw new Error("Failed to create");
      setForm(initialForm);
      setErrors({});
      setShowForm(false);
      setSuccessMsg("Delivery agent added successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchBoys(currentPage); // ← refresh list
    } catch {
      setErrors({ name: "Failed to save. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: number, current: boolean) => {
    // optimistic update
    setBoys(prev => prev.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b));
    try {
    //   await fetch(`${API_BASE}/deliveryboy/${id}/toggle-status`, {
    //     method: "PATCH",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ is_active: !current }),
    //   });
    } catch {
      // revert on failure
      setBoys(prev => prev.map(b => b.id === id ? { ...b, is_active: current } : b));
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="db-root">
      <div className="db-orb db-orb-1" />
      <div className="db-orb db-orb-2" />
      <div className="db-orb db-orb-3" />

      <div className="db-container">
        {/* Header */}
        <header className="db-header">
          <div className="db-header-left">
            <div className="db-header-eyebrow">Fleet Management</div>
            <h1 className="db-title">Delivery <span className="db-title-accent">Agents</span></h1>
            <p className="db-subtitle">Manage your delivery workforce with precision</p>
          </div>
          <div className="db-header-right">
            <div className="db-stat-card">
              <span className="db-stat-num">{boys.filter(b => b.is_active).length}</span>
              <span className="db-stat-label">Active</span>
            </div>
            <div className="db-stat-card db-stat-total">
              <span className="db-stat-num">{total}</span>
              <span className="db-stat-label">Total</span>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div className="db-toolbar">
          <div className="db-search-wrap">
            <svg className="db-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="db-search"
              placeholder="Search by name or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="db-add-btn" onClick={() => { setShowForm(true); setErrors({}); setForm(initialForm); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Agent
          </button>
        </div>

        {successMsg && (
          <div className="db-success-toast">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            {successMsg}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="db-error-toast">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            {error}
            <button className="db-retry-btn" onClick={() => fetchBoys(currentPage)}>Retry</button>
          </div>
        )}

        {/* Table */}
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Father's Name</th>
                <th>Aadhaar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="db-empty">
                  <span className="db-spinner db-spinner-dark" /> Loading agents…
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="db-empty">No agents found</td></tr>
              ) : filtered.map((boy, i) => (
                <tr key={boy.id} className="db-row" style={{ animationDelay: `${i * 60}ms` }}>
                  <td>
                    <div className="db-agent-cell">
                      <div className="db-avatar" data-active={boy.is_active}>
                        {getInitials(boy.name)}
                      </div>
                      <div>
                        <div className="db-agent-name">{boy.name}</div>
                        <div className="db-agent-id">ID #{boy.id.toString().padStart(4, "0")}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="db-contact-cell">
                      <div className="db-phone">{boy.phone}</div>
                      {boy.email && <div className="db-email">{boy.email}</div>}
                    </div>
                  </td>
                  <td><span className="db-address">{boy.address || "—"}</span></td>
                  <td><span className="db-father">{boy.father_name || "—"}</span></td>
                  <td>
                    {boy.aadhaar_number
                      ? <span className="db-aadhaar">••••&nbsp;••••&nbsp;{boy.aadhaar_number.slice(-4)}</span>
                      : <span className="db-na">—</span>}
                  </td>
                  <td>
                    <button
                      className={`db-toggle ${boy.is_active ? "db-toggle-active" : "db-toggle-inactive"}`}
                      onClick={() => toggleStatus(boy.id, boy.is_active)}
                    >
                      <span className="db-toggle-dot" />
                      {boy.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && lastPage > 1 && (
          <div className="db-pagination">
            <button
              className="db-page-btn"
              disabled={currentPage === 1}
              onClick={() => fetchBoys(currentPage - 1)}
            >← Prev</button>
            <span className="db-page-info">Page {currentPage} of {lastPage}</span>
            <button
              className="db-page-btn"
              disabled={currentPage === lastPage}
              onClick={() => fetchBoys(currentPage + 1)}
            >Next →</button>
          </div>
        )}

        {/* Modal — unchanged from original */}
        {showForm && (
          <div className="db-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="db-modal">
              <div className="db-modal-header">
                <div>
                  <div className="db-modal-eyebrow">New Record</div>
                  <h2 className="db-modal-title">Add Delivery Agent</h2>
                </div>
                <button className="db-close-btn" onClick={() => setShowForm(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="db-modal-body">
                <div className="db-form-grid">
                  <div className="db-field">
                    <label className="db-label">Full Name <span className="db-req">*</span></label>
                    <input className={`db-input ${errors.name ? "db-input-err" : ""}`} placeholder="e.g. Arjun Sharma"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    {errors.name && <span className="db-err">{errors.name}</span>}
                  </div>
                  <div className="db-field">
                    <label className="db-label">Phone Number <span className="db-req">*</span></label>
                    <input className={`db-input ${errors.phone ? "db-input-err" : ""}`} placeholder="10-15 digit number"
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    {errors.phone && <span className="db-err">{errors.phone}</span>}
                  </div>
                  <div className="db-field">
                    <label className="db-label">Email Address</label>
                    <input className={`db-input ${errors.email ? "db-input-err" : ""}`} placeholder="Optional"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    {errors.email && <span className="db-err">{errors.email}</span>}
                  </div>
                  <div className="db-field">
                    <label className="db-label">Father's Name</label>
                    <input className="db-input" placeholder="Optional"
                      value={form.father_name} onChange={e => setForm(f => ({ ...f, father_name: e.target.value }))} />
                  </div>
                  <div className="db-field">
                    <label className="db-label">Aadhaar Number</label>
                    <input className={`db-input ${errors.aadhaar_number ? "db-input-err" : ""}`} placeholder="12-digit Aadhaar"
                      value={form.aadhaar_number} onChange={e => setForm(f => ({ ...f, aadhaar_number: e.target.value }))} maxLength={12} />
                    {errors.aadhaar_number && <span className="db-err">{errors.aadhaar_number}</span>}
                  </div>
                  <div className="db-field db-field-status">
                    <label className="db-label">Initial Status</label>
                    <div className="db-status-toggle-wrap">
                      <button className={`db-status-btn ${form.is_active ? "db-status-btn-on" : ""}`}
                        onClick={() => setForm(f => ({ ...f, is_active: true }))}>Active</button>
                      <button className={`db-status-btn ${!form.is_active ? "db-status-btn-off" : ""}`}
                        onClick={() => setForm(f => ({ ...f, is_active: false }))}>Inactive</button>
                    </div>
                  </div>
                  <div className="db-field db-field-full">
                    <label className="db-label">Address</label>
                    <textarea className="db-textarea" placeholder="Street, City, State…" rows={3}
                      value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="db-modal-footer">
                <button className="db-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="db-submit-btn" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <span className="db-spinner" /> : null}
                  {submitting ? "Saving…" : "Add Agent"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}