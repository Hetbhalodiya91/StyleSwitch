import { useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import BrowsePage from "./pages/BrowsePage";
import AddClothing from "./pages/AddClothing";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ClothDetailPage from "./pages/ClothDetailPage";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

function AppContent() {
  const [page, setPage] = useState("home");
  const [selectedClothId, setSelectedClothId] = useState<string | null>(null);

  const navigateToDetail = (clothId: string) => {
    setSelectedClothId(clothId);
    setPage("cloth-detail");
  };

  const renderPage = () => {
    if (page === "browse") return <BrowsePage onNavigate={setPage} onViewDetail={navigateToDetail} />;
    if (page === "add") return <AddClothing onNavigate={setPage} />;
    if (page === "login") return <AuthPage mode="login" onSwitch={() => setPage("signup")} onSuccess={() => setPage("browse")} />;
    if (page === "signup") return <AuthPage mode="signup" onSwitch={() => setPage("login")} onSuccess={() => setPage("login")} />;
    if (page === "dashboard") return <DashboardPage onNavigate={setPage} />;
    if (page === "cloth-detail" && selectedClothId) return <ClothDetailPage clothId={selectedClothId} onNavigate={setPage} />;
    return <LandingPage onBrowse={() => setPage("browse")} onSignup={() => setPage("signup")} onViewDetail={navigateToDetail} />;
  };

  return (
    <div className="app-shell">
      <Navbar page={page} onNavigate={setPage} />
      <main>{renderPage()}</main>
      <Footer onNavigate={setPage} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
