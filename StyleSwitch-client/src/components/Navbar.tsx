import { useState } from "react";
import { ArrowUpRight, Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  page: string;
  onNavigate: (page: string) => void;
}

const Navbar = ({ page, onNavigate }: NavbarProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", background: "#ffffff", padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", color: "#111215" }}>
              <UserIcon size={14} color="#e11d48" /> {user.name}
            </span>
            <button
              className="nav-login"
              onClick={() => navigate("dashboard")}
              style={{ display: "flex", alignItems: "center", gap: "4px", background: "#e11d48", color: "#fff", border: "none" }}
            >
              My Dashboard
            </button>
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
              <button onClick={() => navigate("dashboard")}>My Dashboard</button>
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
