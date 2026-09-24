import { ArrowUpRight } from "lucide-react";

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer = ({ onNavigate }: FooterProps) => (
  <footer className="site-footer">
    <div className="footer-brand">
      <button className="footer-logo" onClick={() => onNavigate("home")}>STYLE/SWITCH</button>
      <p>Wear more. Own less. Keep moving.</p>
    </div>
    <div className="footer-links">
      
    </div>
    <div className="footer-meta">
      <span>© 2026 Style/Switch</span>
      <span>Made for changing plans.</span>
    </div>
  </footer>
);

export default Footer;
