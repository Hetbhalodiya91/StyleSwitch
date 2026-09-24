import { useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import BrowsePage from "./pages/BrowsePage";
import AddClothing from "./pages/AddClothing";
import AuthPage from "./pages/AuthPage";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    if (page === "browse") return <BrowsePage />;
    if (page === "add") return <AddClothing />;
    if (page === "login") return <AuthPage mode="login" onSwitch={() => setPage("signup")} />;
    if (page === "signup") return <AuthPage mode="signup" onSwitch={() => setPage("login")} />;
    return <LandingPage onBrowse={() => setPage("browse")} onSignup={() => setPage("signup")} />;
  };

  return (
    <div className="app-shell">
      <Navbar page={page} onNavigate={setPage} />
      <main>{renderPage()}</main>
      <Footer onNavigate={setPage} />
    </div>
  );
}

export default App;
