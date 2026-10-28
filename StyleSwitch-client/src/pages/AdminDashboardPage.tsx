import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Shirt,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { adminService } from "../api/adminService";
import type {
  AdminMetrics,
  AdminUser,
  AdminCloth,
  AdminBooking,
  AdminReport,
} from "../api/adminService";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboardPage.css";

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
  onViewDetail?: (clothId: string) => void;
}

type TabType = "overview" | "users" | "clothes" | "bookings" | "reports";

export default function AdminDashboardPage({ onNavigate, onViewDetail }: AdminDashboardPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Data states
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentBookings, setRecentBookings] = useState<AdminBooking[]>([]);
  const [recentReports, setRecentReports] = useState<AdminReport[]>([]);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [clothesList, setClothesList] = useState<AdminCloth[]>([]);
  const [bookingsList, setBookingsList] = useState<AdminBooking[]>([]);
  const [reportsList, setReportsList] = useState<AdminReport[]>([]);

  // Search/Filters
  const [userSearch, setUserSearch] = useState("");
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [reportFilter, setReportFilter] = useState("ALL");

  // Selected report for notes modal/dialog
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [reportNote, setReportNote] = useState("");
  const [newReportStatus, setNewReportStatus] = useState<"PENDING" | "IN_REVIEW" | "RESOLVED" | "DISMISSED">("IN_REVIEW");

  const notify = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getOverview();
      setMetrics(res.metrics);
      setRecentBookings(res.recentBookings || []);
      setRecentReports(res.recentReports || []);
    } catch (err: unknown) {
      console.error("Failed to load admin overview:", err);
      setError(err instanceof Error ? err.message : "Failed to load admin metrics");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      setUsersList(res.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadClothes = async () => {
    try {
      setLoading(true);
      const res = await adminService.getClothes();
      setClothesList(res.clothes || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load clothes");
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBookings();
      setBookingsList(res.bookings || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReports();
      setReportsList(res.reports || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") loadOverview();
    else if (activeTab === "users") loadUsers();
    else if (activeTab === "clothes") loadClothes();
    else if (activeTab === "bookings") loadBookings();
    else if (activeTab === "reports") loadReports();
  }, [activeTab]);

  // Actions
  const handleToggleBlock = async (userId: string) => {
    try {
      const res = await adminService.toggleUserBlock(userId);
      notify(res.message);
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlock: !u.isBlock } : u))
      );
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to toggle block status");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      notify(res.message);
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole as AdminUser["role"] } : u))
      );
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleToggleCloth = async (clothId: string) => {
    try {
      const res = await adminService.toggleClothAvailability(clothId);
      notify(res.message);
      setClothesList((prev) =>
        prev.map((c) => (c._id === clothId ? { ...c, isAvailable: !c.isAvailable } : c))
      );
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to toggle garment status");
    }
  };

  const handleDeleteCloth = async (clothId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this garment listing?")) return;
    try {
      const res = await adminService.deleteCloth(clothId);
      notify(res.message);
      setClothesList((prev) => prev.filter((c) => c._id !== clothId));
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to delete garment");
    }
  };

  const handleBookingStatus = async (bookingId: string, status: string) => {
    try {
      const res = await adminService.updateBookingStatus(bookingId, status);
      notify(res.message);
      setBookingsList((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: status as AdminBooking["status"] } : b))
      );
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to update booking status");
    }
  };

  const handleSaveReport = async () => {
    if (!selectedReport) return;
    try {
      const res = await adminService.updateReport(selectedReport._id, {
        status: newReportStatus,
        adminNote: reportNote,
      });
      notify(res.message);
      setReportsList((prev) =>
        prev.map((r) =>
          r._id === selectedReport._id
            ? { ...r, status: newReportStatus, adminNote: reportNote }
            : r
        )
      );
      setSelectedReport(null);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed to update report");
    }
  };

  // Check admin authorization
  if (user?.role !== "admin") {
    return (
      <div className="admin-access-denied">
        <ShieldAlert size={56} color="#e11d48" />
        <h2>Restricted Atelier Clearance</h2>
        <p>This console is reserved strictly for designated StyleSwitch platform administrators.</p>
        <button onClick={() => onNavigate("home")} className="admin-btn-primary">
          Return to Atelier Showcase
        </button>
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredBookings = bookingsList.filter(
    (b) => bookingFilter === "ALL" || b.status === bookingFilter
  );

  const filteredReports = reportsList.filter(
    (r) => reportFilter === "ALL" || r.status === reportFilter
  );

  return (
    <div className="admin-container">
      {/* Top Banner & Title */}
      <header className="admin-header">
        <div className="admin-header-title">
          <div className="admin-seal">
            <ShieldCheck size={20} color="#e11d48" />
            <span>SOLE ATELIER ADMINISTRATOR CONSOLE</span>
          </div>
          <h1>Platform Administration</h1>
          <p>Global oversight, garment authentication, dispute resolution & transaction ledgers.</p>
        </div>

        <div className="admin-header-actions">
          <button
            className="admin-refresh-btn"
            onClick={() => {
              if (activeTab === "overview") loadOverview();
              else if (activeTab === "users") loadUsers();
              else if (activeTab === "clothes") loadClothes();
              else if (activeTab === "bookings") loadBookings();
              else if (activeTab === "reports") loadReports();
            }}
            title="Refresh current view"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <div className="admin-operator-badge">
            <span className="dot" />
            Sole Administrator: <strong>{user?.name}</strong>
          </div>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionMessage && <div className="admin-toast">{actionMessage}</div>}
      {error && <div className="admin-error-banner">{error}</div>}

      {/* Tab Navigation */}
      <nav className="admin-tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <TrendingUp size={16} /> Overview
        </button>
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          <Users size={16} /> Users Management
          {metrics && <span className="tab-pill">{metrics.totalUsers}</span>}
        </button>
        <button
          className={activeTab === "clothes" ? "active" : ""}
          onClick={() => setActiveTab("clothes")}
        >
          <Shirt size={16} /> Garment Catalog
          {metrics && <span className="tab-pill">{metrics.totalClothes}</span>}
        </button>
        <button
          className={activeTab === "bookings" ? "active" : ""}
          onClick={() => setActiveTab("bookings")}
        >
          <CalendarCheck size={16} /> All Bookings
          {metrics && <span className="tab-pill">{metrics.totalBookings}</span>}
        </button>
        <button
          className={activeTab === "reports" ? "active" : ""}
          onClick={() => setActiveTab("reports")}
        >
          <AlertTriangle size={16} /> Disputes & Reports
          {metrics && metrics.pendingReports > 0 && (
            <span className="tab-pill alert">{metrics.pendingReports}</span>
          )}
        </button>
      </nav>

      {/* TAB CONTENT */}
      <main className="admin-main">
        {loading && <div className="admin-loading">Synchronizing platform data...</div>}

        {/* 1. OVERVIEW TAB */}
        {!loading && activeTab === "overview" && metrics && (
          <div className="admin-overview-view">
            {/* KPI Cards Grid */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card highlight">
                <span className="kpi-label">Gross Platform Volume</span>
                <h3 className="kpi-value">₹{metrics.totalRevenue.toLocaleString()}</h3>
                <span className="kpi-foot">100% transacted on StyleSwitch</span>
              </div>

              <div className="admin-kpi-card highlight-gold">
                <span className="kpi-label">Platform Commission (15%)</span>
                <h3 className="kpi-value">₹{metrics.platformCommission.toLocaleString()}</h3>
                <span className="kpi-foot">Net revenue after lender disbursement</span>
              </div>

              <div className="admin-kpi-card">
                <span className="kpi-label">Total Registered Users</span>
                <h3 className="kpi-value">{metrics.totalUsers}</h3>
                <span className="kpi-foot">
                  {metrics.totalLenders} Lenders &middot; {metrics.totalRenters} Renters
                </span>
              </div>

              <div className="admin-kpi-card">
                <span className="kpi-label">Active Wardrobe Catalog</span>
                <h3 className="kpi-value">{metrics.availableClothes} / {metrics.totalClothes}</h3>
                <span className="kpi-foot">Pieces available for instant booking</span>
              </div>

              <div className="admin-kpi-card">
                <span className="kpi-label">Booking Flow Status</span>
                <h3 className="kpi-value">{metrics.totalBookings}</h3>
                <span className="kpi-foot">
                  {metrics.confirmedBookings} Confirmed &middot; {metrics.pendingBookings} Pending
                </span>
              </div>

              <div className="admin-kpi-card">
                <span className="kpi-label">Reported Disputes</span>
                <h3 className="kpi-value" style={{ color: metrics.pendingReports > 0 ? "#e11d48" : "inherit" }}>
                  {metrics.pendingReports} Open
                </h3>
                <span className="kpi-foot">{metrics.totalReports} Lifetime disputes filed</span>
              </div>
            </div>

            {/* Split Recent Tables */}
            <div className="admin-overview-split">
              {/* Recent Bookings */}
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <h3>Recent Reservations</h3>
                  <button onClick={() => setActiveTab("bookings")} className="panel-link">
                    View all <ArrowUpRight size={14} />
                  </button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Garment</th>
                        <th>Renter</th>
                        <th>Lender</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((b) => (
                        <tr key={b._id}>
                          <td>
                            <strong>{b.clothId?.brand || "Piece"}</strong>{" "}
                            <span className="sub">{b.clothId?.category}</span>
                          </td>
                          <td>{b.tenantId?.name || "Renter"}</td>
                          <td>{b.lenderId?.name || "Lender"}</td>
                          <td><strong>₹{b.totalAmount}</strong></td>
                          <td>
                            <span className={`status-badge ${b.status.toLowerCase()}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {recentBookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="empty-cell">No recent reservations recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Reports */}
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <h3>Recent Incident Reports</h3>
                  <button onClick={() => setActiveTab("reports")} className="panel-link">
                    View all <ArrowUpRight size={14} />
                  </button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Reason</th>
                        <th>Reporter</th>
                        <th>Reported User</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReports.map((r) => (
                        <tr key={r._id}>
                          <td>
                            <strong>{r.reason}</strong>
                          </td>
                          <td>{r.reporterId?.name || "Member"}</td>
                          <td>{r.reportedUserId?.name || "N/A"}</td>
                          <td>
                            <span className={`status-badge ${r.status.toLowerCase()}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {recentReports.length === 0 && (
                        <tr>
                          <td colSpan={4} className="empty-cell">No incident reports pending.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USERS MANAGEMENT TAB */}
        {!loading && activeTab === "users" && (
          <div className="admin-users-view">
            <div className="admin-filter-bar">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Filter users by name, email, or role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="count-tag">{filteredUsers.length} Users Found</div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User / Contact</th>
                    <th>Role</th>
                    <th>Account Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: "right" }}>Administrative Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className={u.isBlock ? "blocked-row" : ""}>
                      <td>
                        <div className="user-cell">
                          <strong>{u.name}</strong>
                          <span className="email">{u.email}</span>
                          {u.number && <span className="phone">{u.number}</span>}
                        </div>
                      </td>
                      <td>
                        {u.role === "admin" ? (
                          <span className="admin-sole-badge">
                            <ShieldCheck size={13} color="#e11d48" /> Sole Administrator
                          </span>
                        ) : (
                          <select
                            className="admin-select role-select"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          >
                            <option value="tenant">Renter (tenant)</option>
                            <option value="lender">Lender (owner)</option>
                          </select>
                        )}
                      </td>
                      <td>
                        {u.isBlock ? (
                          <span className="status-badge rejected">
                            <Lock size={12} /> Blocked
                          </span>
                        ) : (
                          <span className="status-badge confirmed">
                            <Unlock size={12} /> Active
                          </span>
                        )}
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: "right" }}>
                        {u.role === "admin" ? (
                          <span className="protected-tag">Protected Admin</span>
                        ) : (
                          <button
                            onClick={() => handleToggleBlock(u._id)}
                            className={`btn-action-sm ${u.isBlock ? "btn-unblock" : "btn-block"}`}
                          >
                            {u.isBlock ? "Unblock Account" : "Block User"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="empty-cell">No users matched search criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. CLOTHES MODERATION TAB */}
        {!loading && activeTab === "clothes" && (
          <div className="admin-clothes-view">
            <div className="admin-catalog-grid">
              {clothesList.map((cloth) => (
                <div key={cloth._id} className="admin-cloth-card">
                  <div className="admin-cloth-img">
                    <img
                      src={cloth.images?.[0] || "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=400&q=80"}
                      alt={cloth.brand}
                    />
                    <span className={`status-pill ${cloth.isAvailable ? "live" : "hidden"}`}>
                      {cloth.isAvailable ? "Live in Wardrobe" : "Archived / Hidden"}
                    </span>
                  </div>

                  <div className="admin-cloth-info">
                    <div className="cloth-brand-row">
                      <h4>{cloth.brand}</h4>
                      <span className="cloth-category">{cloth.category}</span>
                    </div>

                    <div className="cloth-meta-specs">
                      <span>Size: {cloth.size}</span>
                      <span>Color: {cloth.color}</span>
                      <span>City: {cloth.city}</span>
                    </div>

                    <div className="cloth-pricing">
                      <span>Rate: <strong>₹{cloth.rentalPricePerDay}/day</strong></span>
                      <span>Deposit: <strong>₹{cloth.securityDeposit}</strong></span>
                    </div>

                    <div className="cloth-lender-info">
                      Owner: <strong>{cloth.lenderId?.name || "Atelier Lender"}</strong>
                    </div>

                    <div className="admin-cloth-actions">
                      {onViewDetail && (
                        <button
                          className="btn-cloth-tool"
                          onClick={() => onViewDetail(cloth._id)}
                          title="View Spec Sheet"
                        >
                          <Eye size={14} /> Spec Sheet
                        </button>
                      )}
                      <button
                        className={`btn-cloth-tool ${cloth.isAvailable ? "btn-archive" : "btn-publish"}`}
                        onClick={() => handleToggleCloth(cloth._id)}
                      >
                        {cloth.isAvailable ? "Archive Piece" : "Publish Live"}
                      </button>
                      <button
                        className="btn-cloth-tool btn-delete"
                        onClick={() => handleDeleteCloth(cloth._id)}
                        title="Delete listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. BOOKINGS LEDGER TAB */}
        {!loading && activeTab === "bookings" && (
          <div className="admin-bookings-view">
            <div className="admin-filter-bar">
              <div className="filter-chips">
                {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    className={`filter-chip ${bookingFilter === st ? "active" : ""}`}
                    onClick={() => setBookingFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <div className="count-tag">{filteredBookings.length} Bookings</div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Garment</th>
                    <th>Renter Details</th>
                    <th>Lender Details</th>
                    <th>Dates</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Status Override</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b._id}>
                      <td><span className="mono-code">#{b._id.slice(-6).toUpperCase()}</span></td>
                      <td>
                        <strong>{b.clothId?.brand || "Designer Piece"}</strong>
                        <span className="sub">{b.clothId?.category}</span>
                      </td>
                      <td>
                        <strong>{b.tenantId?.name || "Renter"}</strong>
                        <span className="sub">{b.tenantId?.email}</span>
                      </td>
                      <td>
                        <strong>{b.lenderId?.name || "Lender"}</strong>
                        <span className="sub">{b.lenderId?.email}</span>
                      </td>
                      <td>
                        <span className="dates">
                          {new Date(b.startDate).toLocaleDateString()} &rarr; {new Date(b.endDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <strong>₹{b.totalAmount}</strong>
                        <span className="sub">Dep: ₹{b.securityDeposit}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${b.status.toLowerCase()}`}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="action-button-row">
                          {b.status !== "CONFIRMED" && (
                            <button
                              onClick={() => handleBookingStatus(b._id, "CONFIRMED")}
                              className="btn-action-icon approve"
                              title="Force Confirm"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          {b.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleBookingStatus(b._id, "COMPLETED")}
                              className="btn-action-icon complete"
                              title="Mark Returned & Completed"
                            >
                              <ShieldCheck size={16} />
                            </button>
                          )}
                          {b.status !== "REJECTED" && (
                            <button
                              onClick={() => handleBookingStatus(b._id, "REJECTED")}
                              className="btn-action-icon reject"
                              title="Cancel / Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="empty-cell">No bookings found for selected filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. REPORTS & DISPUTES TAB */}
        {!loading && activeTab === "reports" && (
          <div className="admin-reports-view">
            <div className="admin-filter-bar">
              <div className="filter-chips">
                {["ALL", "PENDING", "IN_REVIEW", "RESOLVED", "DISMISSED"].map((st) => (
                  <button
                    key={st}
                    className={`filter-chip ${reportFilter === st ? "active" : ""}`}
                    onClick={() => setReportFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <div className="count-tag">{filteredReports.length} Reports</div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Filing Date</th>
                    <th>Issue / Reason</th>
                    <th>Reporter</th>
                    <th>Reported Member</th>
                    <th>Garment</th>
                    <th>Status</th>
                    <th>Admin Note</th>
                    <th style={{ textAlign: "right" }}>Adjudication</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r) => (
                    <tr key={r._id}>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <strong>{r.reason}</strong>
                        {r.details && <p className="report-details-preview">{r.details}</p>}
                      </td>
                      <td>{r.reporterId?.name || "User"}</td>
                      <td>{r.reportedUserId?.name || "N/A"}</td>
                      <td>{r.clothId?.brand ? `${r.clothId.brand} (${r.clothId.category})` : "General"}</td>
                      <td>
                        <span className={`status-badge ${r.status.toLowerCase()}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <span className="admin-note-text">
                          {r.adminNote || <em style={{ color: "#94a3b8" }}>No notes added</em>}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn-action-sm btn-adjudicate"
                          onClick={() => {
                            setSelectedReport(r);
                            setReportNote(r.adminNote || "");
                            setNewReportStatus(r.status);
                          }}
                        >
                          Resolve & Note
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={8} className="empty-cell">No reports filed matching filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Report Resolution Modal */}
      {selectedReport && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Adjudicate Dispute #{selectedReport._id.slice(-6).toUpperCase()}</h3>
              <p>Reason: <strong>{selectedReport.reason}</strong></p>
            </header>

            <div className="modal-body">
              {selectedReport.details && (
                <div className="report-full-details">
                  <label>Complainant Statement:</label>
                  <blockquote>"{selectedReport.details}"</blockquote>
                </div>
              )}

              <div className="modal-field">
                <label>Resolution Status:</label>
                <select
                  className="admin-select"
                  value={newReportStatus}
                  onChange={(e) =>
                    setNewReportStatus(e.target.value as "PENDING" | "IN_REVIEW" | "RESOLVED" | "DISMISSED")
                  }
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_REVIEW">IN REVIEW</option>
                  <option value="RESOLVED">RESOLVED (Action taken)</option>
                  <option value="DISMISSED">DISMISSED (Invalid claim)</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Internal Administrator Note & Action Taken:</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  placeholder="Record dispute resolution, deposit adjustment, or communication with parties..."
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                />
              </div>
            </div>

            <footer className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setSelectedReport(null)}>
                Cancel
              </button>
              <button className="btn-modal-save" onClick={handleSaveReport}>
                Save Adjudication
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
