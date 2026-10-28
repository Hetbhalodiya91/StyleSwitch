import { useState, useEffect } from "react";
import { ArrowUpRight, Menu, X, User as UserIcon, LogOut, ShieldCheck, Bell, Check, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { notificationService, type NotificationItem } from "../api/notificationService";

interface NavbarProps {
  page: string;
  onNavigate: (page: string) => void;
}

const Navbar = ({ page, onNavigate }: NavbarProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService
        .getNotifications()
        .then((res) => setNotifications(res.notifications || []))
        .catch(() => {});
    }
  }, [isAuthenticated, page]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {}
  };
  const links = [
    { label: "Archive Collection", page: "browse" },
    { label: "Atelier Process", page: "home", anchor: "#atelier-process" },
    { label: "List a Piece", page: "add" },
  ];

  const navigate = (nextPage: string, anchor?: string) => {
    onNavigate(nextPage);
    setIsOpen(false);
    if (anchor) window.setTimeout(() => document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const handleLogout = () => {
    logout();
    navigate("home");
  };

  return (
    <nav className="site-nav">
      <button className="brand-mark group" onClick={() => navigate("home")} aria-label="Go to Style Switch home">
        <span className="brand-dot" /> 
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "0.08em", fontSize: "16px" }}>
            STYLE / SWITCH
          </span>
          <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.18em", color: "#64748b", marginTop: "2px" }}>
            HAUTE ARCHIVE &middot; 2026
          </span>
        </div>
      </button>

      <div className="desktop-nav-links">
        {links.map((link) => (
          <button
            key={link.label}
            className={page === link.page ? "active" : ""}
            onClick={() => navigate(link.page, link.anchor)}
          >
            {link.label}
          </button>
        ))}
      </div>

      <div className="desktop-nav-actions">
        {isAuthenticated && user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                className="nav-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                  color: "#334155",
                }}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      background: "#e11d48",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 700,
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    top: "42px",
                    right: 0,
                    width: "320px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    boxShadow: "0 14px 28px rgba(0,0,0,0.12)",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#f8fafc",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.06em", color: "#0f172a" }}>
                      ATELIER ALERTS ({unreadCount} NEW)
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "13px" }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #f8fafc",
                            background: n.isRead ? "#ffffff" : "#fff1f2",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            position: "relative",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <strong style={{ fontSize: "12.5px", color: "#0f172a" }}>{n.title}</strong>
                            <div style={{ display: "flex", gap: "4px" }}>
                              {!n.isRead && (
                                <button
                                  onClick={(e) => handleMarkRead(n._id, e)}
                                  style={{ background: "none", border: "none", color: "#16a34a", cursor: "pointer", padding: "2px" }}
                                  title="Mark as read"
                                >
                                  <Check size={13} />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDeleteNotification(n._id, e)}
                                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px" }}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: 1.4 }}>
                            {n.message}
                          </p>
                          <span style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "28px 16px", textAlign: "center", color: "#94a3b8", fontSize: "12.5px" }}>
                        No alerts at this time.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <span style={{ fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", background: "#ffffff", padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", color: "#111215" }}>
              <UserIcon size={14} color="#e11d48" /> {user.name}
            </span>
            {user.role === "admin" ? (
              <button
                className="nav-login"
                onClick={() => navigate("admin")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#0f172a",
                  color: "#fff",
                  border: "1px solid #334155",
                }}
              >
                <ShieldCheck size={14} color="#e11d48" /> Admin Console
              </button>
            ) : (
              <button
                className="nav-login"
                onClick={() => navigate("dashboard")}
                style={{ display: "flex", alignItems: "center", gap: "4px", background: "#e11d48", color: "#fff", border: "none" }}
              >
                My Dashboard
              </button>
            )}
            <button
              className="nav-login"
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
              title="Log out"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        ) : (
          <>
            <button className="nav-login" onClick={() => navigate("login")}>Log in</button>
            <button className="nav-signup" onClick={() => navigate("signup")}>
              Join the club <ArrowUpRight size={15} />
            </button>
          </>
        )}
      </div>

      <button className="mobile-menu-button" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation">
        {isOpen ? <X /> : <Menu />}
      </button>

      {isOpen && (
        <div className="mobile-nav-links">
          {links.map((link) => (
            <button key={link.label} onClick={() => navigate(link.page, link.anchor)}>
              {link.label}
            </button>
          ))}
          {isAuthenticated && user ? (
            <>
              {user.role === "admin" ? (
                <button onClick={() => navigate("admin")}>Admin Console</button>
              ) : (
                <button onClick={() => navigate("dashboard")}>My Dashboard</button>
              )}
              <button onClick={handleLogout}>Log out ({user.name})</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("login")}>Log in</button>
              <button onClick={() => navigate("signup")}>Join the club</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
