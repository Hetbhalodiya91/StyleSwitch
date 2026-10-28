import React, { useEffect, useState } from "react";
import { Plus, Clock, Tag, Inbox, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { clothService, type ClothItem } from "../api/clothService";
import { bookingService, type BookingItem } from "../api/bookingService";
import CheckoutModal from "../components/CheckoutModal";
import "./DashboardPage.css";

interface DashboardPageProps {
  onNavigate?: (page: string) => void;
}

type TabType = "rentals" | "wardrobe" | "incoming";

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
