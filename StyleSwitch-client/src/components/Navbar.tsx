import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

interface NavbarProps {
  page: string;
  onNavigate: (page: string) => void;
}

const Navbar = ({ page, onNavigate }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const links = [
    { label: "Discover", page: "browse" },
    { label: "How it works", page: "home", anchor: "#how-it-works" },
    { label: "List a piece", page: "add" },
  ];

  const navigate = (nextPage: string, anchor?: string) => {
    onNavigate(nextPage);
    setIsOpen(false);
    if (anchor) window.setTimeout(() => document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  return (
    <nav className="site-nav">
      <button className="brand-mark" onClick={() => navigate("home")} aria-label="Go to Style Switch home">
        <span className="brand-dot" /> STYLE/SWITCH
      </button>
      <div className="desktop-nav-links">
        {links.map((link) => <button key={link.label} className={page === link.page ? "active" : ""} onClick={() => navigate(link.page, link.anchor)}>{link.label}</button>)}
      </div>
      <div className="desktop-nav-actions">
        <button className="nav-login" onClick={() => navigate("login")}>Log in</button>
        <button className="nav-signup" onClick={() => navigate("signup")}>Join the club <ArrowUpRight size={15} /></button>
      </div>
      <button className="mobile-menu-button" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation">{isOpen ? <X /> : <Menu />}</button>
      {isOpen && <div className="mobile-nav-links">{links.map((link) => <button key={link.label} onClick={() => navigate(link.page, link.anchor)}>{link.label}</button>)}<button onClick={() => navigate("login")}>Log in</button><button onClick={() => navigate("signup")}>Join the club</button></div>}
    </nav>
  );
};

export default Navbar;
