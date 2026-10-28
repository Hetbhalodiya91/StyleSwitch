import React, { useEffect, useState } from "react";
import {
  Plus,
  Clock,
  Tag,
  Inbox,
  AlertCircle,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Coins,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { clothService, type ClothItem } from "../api/clothService";
import { bookingService, type BookingItem } from "../api/bookingService";
import CheckoutModal from "../components/CheckoutModal";
import "./DashboardPage.css";

interface DashboardPageProps {
  onNavigate?: (page: string) => void;
}

type TabType = "rentals" | "wardrobe" | "incoming" | "earnings";

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("rentals");

  // State
  const [myRentals, setMyRentals] = useState<BookingItem[]>([]);
  const [myWardrobe, setMyWardrobe] = useState<ClothItem[]>([]);
  const [incomingBookings, setIncomingBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [checkoutBooking, setCheckoutBooking] = useState<BookingItem | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rentalsRes, wardrobeRes, incomingRes] = await Promise.allSettled([
        bookingService.getMyBookings(),
        clothService.getMyClothes(),
        bookingService.getLenderBookings(),
      ]);

      if (rentalsRes.status === "fulfilled") {
        setMyRentals(rentalsRes.value.bookings || []);
      }
      if (wardrobeRes.status === "fulfilled") {
        setMyWardrobe(wardrobeRes.value.clothes || []);
      }
      if (incomingRes.status === "fulfilled") {
        setIncomingBookings(incomingRes.value.bookings || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await bookingService.updateStatus(bookingId, newStatus);
      setActionMessage(`Booking status updated to ${newStatus}`);
      setTimeout(() => setActionMessage(null), 3000);
      loadDashboardData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getDaysBetween = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr).getTime();
      const e = new Date(endStr).getTime();
      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  // --- LENDER FINANCIAL METRICS COMPUTATION ---
  const realizedBookings = incomingBookings.filter(
    (b) => b.status === "COMPLETED" || (b.status === "CONFIRMED" && b.paymentStatus === "PAID")
  );
  const totalRealizedEarnings = realizedBookings.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0
  );

  const escrowBookings = incomingBookings.filter((b) => b.status === "CONFIRMED");
  const totalEscrowEarnings = escrowBookings.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0
  );

  const pendingBookings = incomingBookings.filter((b) => b.status === "PENDING");
  const totalPendingEarnings = pendingBookings.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0
  );

  const totalRentalDays = realizedBookings.reduce(
    (sum, b) => sum + getDaysBetween(b.startDate, b.endDate),
    0
  );

  const avgRentalPayout =
    realizedBookings.length > 0
      ? Math.round(totalRealizedEarnings / realizedBookings.length)
      : 0;

  const completedCount = incomingBookings.filter((b) => b.status === "COMPLETED").length;

  // Garment-by-garment earnings breakdown
  const garmentPerformance = myWardrobe.map((cloth) => {
    const clothBookings = incomingBookings.filter((b) => b.clothId?._id === cloth._id);
    const clothRealized = clothBookings.filter(
      (b) => b.status === "COMPLETED" || (b.status === "CONFIRMED" && b.paymentStatus === "PAID")
    );
    const clothEarned = clothRealized.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const clothPending = clothBookings
      .filter((b) => b.status === "PENDING")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const clothDays = clothRealized.reduce(
      (sum, b) => sum + getDaysBetween(b.startDate, b.endDate),
      0
    );

    return {
      cloth,
      totalBookings: clothBookings.length,
      realizedCount: clothRealized.length,
      clothEarned,
      clothPending,
      clothDays,
      avgPayout: clothRealized.length > 0 ? Math.round(clothEarned / clothRealized.length) : 0,
    };
  }).sort((a, b) => b.clothEarned - a.clothEarned);

  const monetizedPiecesCount = garmentPerformance.filter((g) => g.clothEarned > 0).length;

  if (!isAuthenticated) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">🔒</div>
          <h3>Authentication Required</h3>
          <p>Please log in to view your wardrobe and rentals.</p>
          <button onClick={() => onNavigate?.("login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* User Profile Banner */}
        <div className="dashboard-user-header">
          <div className="dashboard-user-info">
            <div className="user-avatar-circle">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="user-text">
              <h1>{user?.name}</h1>
              <p>{user?.email}</p>
              <span className="user-role-badge">{user?.role || "Member"}</span>
            </div>
          </div>
          <div className="dashboard-header-action">
            <button onClick={() => onNavigate?.("add")}>
              <Plus size={16} /> List a New Piece
            </button>
          </div>
        </div>

        {actionMessage && (
          <div
            style={{
              padding: "12px 18px",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#047857",
              borderRadius: "8px",
              marginBottom: "20px",
              fontWeight: 600,
            }}
          >
            ✓ {actionMessage}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "12px 18px",
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#b91c1c",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* LENDER EARNINGS SUMMARY KPI GRID (PROMINENT AT TOP) */}
        {(myWardrobe.length > 0 || incomingBookings.length > 0 || user?.role === "lender") && (
          <div className="lender-earnings-section">
            <div className="lender-section-header">
              <div>
                <span className="lender-section-tag">
                  <TrendingUp size={13} color="#e11d48" /> ATELIER LENDER REVENUE
                </span>
                <h2 className="lender-section-title">Total Earning &amp; Closet Financials</h2>
              </div>
              <button
                className="lender-view-earnings-btn"
                onClick={() => setActiveTab("earnings")}
              >
                Detailed Ledger &amp; Breakdown <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="lender-kpi-grid">
              {/* Card 1: Total Realized Earnings */}
              <div className="lender-kpi-card highlight-dark">
                <div className="kpi-top">
                  <span className="kpi-label">Total Realized Revenue</span>
                  <div className="kpi-icon-wrap dark">
                    <Wallet size={18} color="#e11d48" />
                  </div>
                </div>
                <h3 className="kpi-amount">₹{totalRealizedEarnings.toLocaleString("en-IN")}</h3>
                <div className="kpi-meta">
                  <span className="kpi-pill success">✓ Payout Eligible</span>
                  <span className="kpi-subtext">{realizedBookings.length} completed rentals</span>
                </div>
              </div>

              {/* Card 2: Active Escrow */}
              <div className="lender-kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">Active Escrow Secured</span>
                  <div className="kpi-icon-wrap green">
                    <ShieldCheck size={18} color="#15803d" />
                  </div>
                </div>
                <h3 className="kpi-amount" style={{ color: "#15803d" }}>
                  ₹{totalEscrowEarnings.toLocaleString("en-IN")}
                </h3>
                <div className="kpi-meta">
                  <span className="kpi-pill escrow">256-Bit Escrow</span>
                  <span className="kpi-subtext">{escrowBookings.length} active in-flight</span>
                </div>
              </div>

              {/* Card 3: Pending Approval Pipeline */}
              <div className="lender-kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">Pending Approval Pipeline</span>
                  <div className="kpi-icon-wrap amber">
                    <Clock size={18} color="#b45309" />
                  </div>
                </div>
                <h3 className="kpi-amount" style={{ color: "#b45309" }}>
                  ₹{totalPendingEarnings.toLocaleString("en-IN")}
                </h3>
                <div className="kpi-meta">
                  <span className="kpi-pill pending">{pendingBookings.length} Requests</span>
                  <span className="kpi-subtext">Awaiting your approval</span>
                </div>
              </div>

              {/* Card 4: Closet Monetization */}
              <div className="lender-kpi-card highlight-gold">
                <div className="kpi-top">
                  <span className="kpi-label">Closet Monetization</span>
                  <div className="kpi-icon-wrap gold">
                    <Sparkles size={18} color="#ca8a04" />
                  </div>
                </div>
                <h3 className="kpi-amount">
                  {monetizedPiecesCount} / {myWardrobe.length} Pieces
                </h3>
                <div className="kpi-meta">
                  <span className="kpi-subtext">
                    <strong>{totalRentalDays}</strong> total rental days logged
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="dashboard-tabs-bar">
          <button
            className={`dashboard-tab-btn ${activeTab === "rentals" ? "active" : ""}`}
            onClick={() => setActiveTab("rentals")}
          >
            <Clock size={16} /> My Rentals (As Renter)
            <span className="tab-count-pill">{myRentals.length}</span>
          </button>

          <button
            className={`dashboard-tab-btn ${activeTab === "wardrobe" ? "active" : ""}`}
            onClick={() => setActiveTab("wardrobe")}
          >
            <Tag size={16} /> My Wardrobe Listings
            <span className="tab-count-pill">{myWardrobe.length}</span>
          </button>

          <button
            className={`dashboard-tab-btn ${activeTab === "incoming" ? "active" : ""}`}
            onClick={() => setActiveTab("incoming")}
          >
            <Inbox size={16} /> Incoming Requests (As Lender)
            <span className="tab-count-pill">{incomingBookings.length}</span>
          </button>

          <button
            className={`dashboard-tab-btn ${activeTab === "earnings" ? "active" : ""}`}
            onClick={() => setActiveTab("earnings")}
          >
            <TrendingUp size={16} /> Lender Earnings &amp; Ledger
            <span className="tab-count-pill earning-pill">
              ₹{totalRealizedEarnings.toLocaleString("en-IN")}
            </span>
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            Loading your dashboard data...
          </div>
        ) : (
          <>
            {/* TAB 1: MY RENTALS */}
            {activeTab === "rentals" && (
              <div>
                {myRentals.length > 0 ? (
                  <div className="dashboard-grid">
                    {myRentals.map((b) => (
                      <div key={b._id} className="dashboard-card">
                        <div>
                          <div className="card-top-row">
                            <img
                              src={
                                b.clothId?.images?.[0] ||
                                "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80"
                              }
                              alt={b.clothId?.brand || "Outfit"}
                              className="card-cloth-img"
                            />
                            <div className="card-cloth-info">
                              <span className="card-brand">
                                {b.clothId?.brand || "Designer Wear"}
                              </span>
                              <h3 className="card-title">
                                {b.clothId?.category || "Occasion Wear"}
                              </h3>
                              <div className="card-meta">
                                <span>Size: {b.clothId?.size || "M"}</span>
                                <span>•</span>
                                <span>Lender: {b.lenderId?.name || "Verified Lender"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="card-details-box">
                            <div className="card-detail-line">
                              <span>Rental Period:</span>
                              <strong>
                                {formatDate(b.startDate)} → {formatDate(b.endDate)}
                              </strong>
                            </div>
                            <div className="card-detail-line">
                              <span>Daily Rate:</span>
                              <strong>₹{b.pricePerDay?.toLocaleString("en-IN")}/day</strong>
                            </div>
                            <div className="card-detail-line">
                              <span>Deposit:</span>
                              <strong>₹{b.securityDeposit?.toLocaleString("en-IN")}</strong>
                            </div>
                            <div className="card-detail-line" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "6px" }}>
                              <span>Total Amount:</span>
                              <strong style={{ color: "#e11d48", fontSize: "15px" }}>
                                ₹{b.totalAmount?.toLocaleString("en-IN")}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <span className={`status-badge ${b.status}`}>{b.status}</span>
                            {b.paymentStatus === "PAID" ? (
                              <span style={{ fontSize: "10.5px", background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "4px", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                                ✓ PAID &amp; ESCROW SECURED
                              </span>
                            ) : b.status !== "REJECTED" ? (
                              <button
                                onClick={() => setCheckoutBooking(b)}
                                style={{
                                  background: "#e11d48",
                                  color: "#fff",
                                  border: "none",
                                  padding: "4px 10px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  boxShadow: "0 2px 6px rgba(225,29,72,0.3)",
                                }}
                              >
                                Pay Deposit &amp; Confirm ↗
                              </button>
                            ) : null}
                          </div>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                            Placed {formatDate(b.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty">
                    <div className="dashboard-empty-icon">✦</div>
                    <h3>No Active Rentals</h3>
                    <p>You haven&apos;t reserved any designer outfits yet.</p>
                    <button onClick={() => onNavigate?.("browse")}>
                      Explore Wardrobe
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MY WARDROBE LISTINGS */}
            {activeTab === "wardrobe" && (
              <div>
                {myWardrobe.length > 0 ? (
                  <div className="dashboard-grid">
                    {myWardrobe.map((cloth) => (
                      <div key={cloth._id} className="dashboard-card">
                        <div>
                          <div className="card-top-row">
                            <img
                              src={
                                cloth.images?.[0] ||
                                "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80"
                              }
                              alt={cloth.brand}
                              className="card-cloth-img"
                            />
                            <div className="card-cloth-info">
                              <span className="card-brand">{cloth.brand}</span>
                              <h3 className="card-title">{cloth.category}</h3>
                              <div className="card-meta">
                                <span>Size: {cloth.size}</span>
                                <span>•</span>
                                <span>{cloth.gender}</span>
                                <span>•</span>
                                <span>{cloth.city}</span>
                              </div>
                            </div>
                          </div>

                          <div className="card-details-box">
                            <div className="card-detail-line">
                              <span>Daily Rent:</span>
                              <strong>₹{cloth.rentalPricePerDay?.toLocaleString("en-IN")} / day</strong>
                            </div>
                            <div className="card-detail-line">
                              <span>Security Deposit:</span>
                              <strong>₹{cloth.securityDeposit?.toLocaleString("en-IN")}</strong>
                            </div>
                            <div className="card-detail-line">
                              <span>Condition:</span>
                              <strong>{cloth.condition}</strong>
                            </div>
                            <div className="card-detail-line">
                              <span>Status:</span>
                              <strong style={{ color: cloth.isAvailable ? "#047857" : "#b91c1c" }}>
                                {cloth.isAvailable ? "Available for Rent" : "Rented / Unavailable"}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            {cloth.images?.length || 1} photo(s) uploaded
                          </span>
                          <span style={{ fontSize: "12px", color: "#e11d48", fontWeight: 700 }}>
                            Listed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty">
                    <div className="dashboard-empty-icon">✨</div>
                    <h3>Your Wardrobe is Empty</h3>
                    <p>Earn on what hangs in your closet by listing designer wear for rent.</p>
                    <button onClick={() => onNavigate?.("add")}>
                      List Your First Piece
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: INCOMING REQUESTS (AS LENDER) */}
            {activeTab === "incoming" && (
              <div>
                {incomingBookings.length > 0 ? (
                  <div className="dashboard-grid">
                    {incomingBookings.map((req) => (
                      <div key={req._id} className="dashboard-card">
                        <div>
                          <div className="card-top-row">
                            <img
                              src={
                                req.clothId?.images?.[0] ||
                                "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80"
                              }
                              alt={req.clothId?.brand || "Outfit"}
                              className="card-cloth-img"
                            />
                            <div className="card-cloth-info">
                              <span className="card-brand">
                                {req.clothId?.brand || "Your Item"}
                              </span>
                              <h3 className="card-title">
                                {req.clothId?.category || "Piece"}
                              </h3>
                              <div className="card-meta">
                                <span>Renter: {req.tenantId?.name || "Member"}</span>
                                <span>•</span>
                                <span>{req.tenantId?.email}</span>
                              </div>
                            </div>
                          </div>

                          <div className="card-details-box">
                            <div className="card-detail-line">
                              <span>Requested Dates:</span>
                              <strong>
                                {formatDate(req.startDate)} → {formatDate(req.endDate)}
                              </strong>
                            </div>
                            <div className="card-detail-line">
                              <span>Daily Rent:</span>
                              <strong>₹{req.pricePerDay?.toLocaleString("en-IN")}/day</strong>
                            </div>
                            <div className="card-detail-line">
                              <span>Total Payout:</span>
                              <strong style={{ color: "#e11d48", fontSize: "15px" }}>
                                ₹{req.totalAmount?.toLocaleString("en-IN")}
                              </strong>
                            </div>
                            <div className="card-detail-line">
                              <span>Current Status:</span>
                              <span className={`status-badge ${req.status}`}>{req.status}</span>
                            </div>
                          </div>
                        </div>

                        {req.status === "PENDING" && (
                          <div className="card-actions-row">
                            <button
                              className="action-btn-approve"
                              onClick={() => handleUpdateStatus(req._id, "CONFIRMED")}
                            >
                              Approve Request
                            </button>
                            <button
                              className="action-btn-reject"
                              onClick={() => handleUpdateStatus(req._id, "REJECTED")}
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {req.status === "CONFIRMED" && (
                          <div className="card-actions-row">
                            <button
                              className="action-btn-approve"
                              onClick={() => handleUpdateStatus(req._id, "COMPLETED")}
                            >
                              Mark Completed / Returned
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty">
                    <div className="dashboard-empty-icon">📬</div>
                    <h3>No Incoming Requests</h3>
                    <p>When renters request to book your clothing pieces, they will show up here for your approval.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: LENDER EARNINGS & DETAILED PERFORMANCE GRIDS */}
            {activeTab === "earnings" && (
              <div className="lender-earnings-tab-content">
                {/* Escrow Guarantee Header */}
                <div className="escrow-banner-card">
                  <div className="escrow-banner-seal">
                    <ShieldCheck size={22} color="#15803d" />
                  </div>
                  <div className="escrow-banner-body">
                    <h4>StyleSwitch Atelier Escrow Guarantee</h4>
                    <p>
                      Your earnings are collected upfront from the renter and held in our 256-bit automated escrow.
                      Disbursements are scheduled within 24 hours after the return inspection is completed.
                    </p>
                  </div>
                  <div className="escrow-banner-stats">
                    <div className="escrow-stat-col">
                      <span className="lbl">Average Payout</span>
                      <strong className="val">₹{avgRentalPayout.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="escrow-stat-col">
                      <span className="lbl">Completed Rentals</span>
                      <strong className="val">{completedCount}</strong>
                    </div>
                  </div>
                </div>

                {/* SECTION 1: PER-GARMENT EARNINGS BREAKDOWN GRID */}
                <div className="earnings-sub-section">
                  <div className="earnings-section-title-row">
                    <div>
                      <h3>Per-Garment Earning Breakdown</h3>
                      <p>Real-time revenue generated by each piece in your wardrobe</p>
                    </div>
                    <span className="earnings-count-pill">{myWardrobe.length} Pieces Listed</span>
                  </div>

                  {garmentPerformance.length > 0 ? (
                    <div className="garment-earnings-grid">
                      {garmentPerformance.map((item) => (
                        <div key={item.cloth._id} className="garment-earning-card">
                          <div className="garment-earning-top">
                            <img
                              src={
                                item.cloth.images?.[0] ||
                                "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80"
                              }
                              alt={item.cloth.brand}
                              className="garment-earning-thumb"
                            />
                            <div className="garment-earning-info">
                              <span className="g-brand">{item.cloth.brand}</span>
                              <h4 className="g-category">{item.cloth.category}</h4>
                              <div className="g-specs">
                                <span>Size {item.cloth.size}</span>
                                <span>&middot;</span>
                                <span>₹{item.cloth.rentalPricePerDay?.toLocaleString("en-IN")}/day</span>
                              </div>
                            </div>
                          </div>

                          <div className="garment-earning-body">
                            <div className="garment-revenue-row">
                              <span className="rev-label">Total Realized Revenue</span>
                              <strong className="rev-amount">
                                ₹{item.clothEarned.toLocaleString("en-IN")}
                              </strong>
                            </div>

                            {item.clothPending > 0 && (
                              <div className="garment-pending-row">
                                <span>Pipeline:</span>
                                <strong>₹{item.clothPending.toLocaleString("en-IN")} pending</strong>
                              </div>
                            )}

                            <div className="garment-stats-mini-grid">
                              <div className="mini-stat">
                                <span className="m-label">Bookings</span>
                                <strong className="m-val">{item.totalBookings}</strong>
                              </div>
                              <div className="mini-stat">
                                <span className="m-label">Days Rented</span>
                                <strong className="m-val">{item.clothDays} d</strong>
                              </div>
                              <div className="mini-stat">
                                <span className="m-label">Avg Payout</span>
                                <strong className="m-val">₹{item.avgPayout.toLocaleString("en-IN")}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="garment-earning-foot">
                            {item.clothEarned > 0 ? (
                              <span className="g-status-badge earned">
                                <Coins size={12} /> Generated ₹{item.clothEarned.toLocaleString("en-IN")}
                              </span>
                            ) : item.clothPending > 0 ? (
                              <span className="g-status-badge pending">
                                <Clock size={12} /> Pending Approval
                              </span>
                            ) : (
                              <span className="g-status-badge fresh">
                                <Sparkles size={12} /> Ready for First Booking
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dashboard-empty">
                      <div className="dashboard-empty-icon">👗</div>
                      <h3>No Wardrobe Pieces Listed</h3>
                      <p>List luxury apparel to start tracking per-garment revenue metrics.</p>
                      <button onClick={() => onNavigate?.("add")}>List a Garment</button>
                    </div>
                  )}
                </div>

                {/* SECTION 2: RECENT PAYOUTS & TRANSACTIONS LEDGER GRID */}
                <div className="earnings-sub-section" style={{ marginTop: "40px" }}>
                  <div className="earnings-section-title-row">
                    <div>
                      <h3>Rental Transactions &amp; Payouts Ledger</h3>
                      <p>Complete historical ledger of all booking payouts from renters</p>
                    </div>
                    <span className="earnings-count-pill">{incomingBookings.length} Total Records</span>
                  </div>

                  {incomingBookings.length > 0 ? (
                    <div className="ledger-table-wrap">
                      <table className="ledger-table">
                        <thead>
                          <tr>
                            <th>Garment &amp; Specimen</th>
                            <th>Renter</th>
                            <th>Rental Span</th>
                            <th>Daily Rate</th>
                            <th>Lender Payout</th>
                            <th>Escrow / Payment Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {incomingBookings.map((b) => (
                            <tr key={b._id}>
                              <td>
                                <div className="ledger-cloth-cell">
                                  <img
                                    src={
                                      b.clothId?.images?.[0] ||
                                      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&q=80"
                                    }
                                    alt={b.clothId?.brand || "Outfit"}
                                    className="ledger-thumb"
                                  />
                                  <div>
                                    <strong>{b.clothId?.brand || "Designer Piece"}</strong>
                                    <span className="ledger-sub">{b.clothId?.category} &middot; Ref #{b._id.slice(-6).toUpperCase()}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="ledger-user-cell">
                                  <strong>{b.tenantId?.name || "Renter"}</strong>
                                  <span className="ledger-sub">{b.tenantId?.email}</span>
                                </div>
                              </td>
                              <td>
                                <div className="ledger-date-cell">
                                  <span>{formatDate(b.startDate)} &rarr; {formatDate(b.endDate)}</span>
                                  <span className="ledger-sub">{getDaysBetween(b.startDate, b.endDate)} Days</span>
                                </div>
                              </td>
                              <td>₹{b.pricePerDay?.toLocaleString("en-IN")}/d</td>
                              <td>
                                <strong className="ledger-amount">
                                  ₹{b.totalAmount?.toLocaleString("en-IN")}
                                </strong>
                              </td>
                              <td>
                                {b.status === "COMPLETED" ? (
                                  <span className="ledger-pill completed">
                                    <CheckCircle2 size={12} /> Payout Released
                                  </span>
                                ) : b.status === "CONFIRMED" && b.paymentStatus === "PAID" ? (
                                  <span className="ledger-pill escrow">
                                    <ShieldCheck size={12} /> Escrow Secured
                                  </span>
                                ) : b.status === "PENDING" ? (
                                  <span className="ledger-pill pending">
                                    <Clock size={12} /> Pending Approval
                                  </span>
                                ) : (
                                  <span className="ledger-pill other">
                                    {b.status}
                                  </span>
                                )}
                              </td>
                              <td>
                                {b.status === "PENDING" && (
                                  <button
                                    className="ledger-btn-action approve"
                                    onClick={() => handleUpdateStatus(b._id, "CONFIRMED")}
                                  >
                                    Approve
                                  </button>
                                )}
                                {b.status === "CONFIRMED" && (
                                  <button
                                    className="ledger-btn-action complete"
                                    onClick={() => handleUpdateStatus(b._id, "COMPLETED")}
                                  >
                                    Mark Complete
                                  </button>
                                )}
                                {b.status === "COMPLETED" && (
                                  <span className="ledger-settled-text">Settled ✓</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="dashboard-empty">
                      <div className="dashboard-empty-icon">💳</div>
                      <h3>No Transaction History</h3>
                      <p>Approved and completed rental bookings will appear here in your payout ledger.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {checkoutBooking && checkoutBooking.clothId && (
        <CheckoutModal
          booking={{
            _id: checkoutBooking._id,
            clothId: {
              _id: checkoutBooking.clothId._id,
              brand: checkoutBooking.clothId.brand,
              category: checkoutBooking.clothId.category,
              images: checkoutBooking.clothId.images,
            },
            startDate: checkoutBooking.startDate,
            endDate: checkoutBooking.endDate,
            totalAmount: checkoutBooking.totalAmount,
            securityDeposit: checkoutBooking.securityDeposit,
          }}
          onClose={() => setCheckoutBooking(null)}
          onSuccess={() => {
            setCheckoutBooking(null);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
