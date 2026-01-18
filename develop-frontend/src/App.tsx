import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

import LoginPage from "./pages/Auth/LoginSignUpPage";
import HomePage from "./pages/Home/HomePage";
import InsulePage from "./pages/Insule/InsulePage";
import IslandDetailsPage from "./pages/Insule/IslandDetailsPage";
import AvioanePage from "./pages/Avioane/AvioanePage";
import QuotePage from "./pages/Quote/QuotePage";
import MapPage from "./pages/Map/MapPage";
import BookingPage from "./pages/Booking/BookingPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";

import type { IslandResponse } from "./api/generated/models/IslandResponse";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [page, setPage] = useState<
    | "home"
    | "insule"
    | "island-details"
    | "avioane"
    | "map"
    | "booking"
    | "quote"
    | "dashboard"
  >("home");

  const [selectedIsland, setSelectedIsland] =
    useState<IslandResponse | null>(null);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("token");

  setIsLoggedIn(false);
};

const handleBookingSuccess = () => {
  setPage("booking");
};


  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="luxury-container">
      {/* Navigation Bar */}
      <nav className="luxury-nav">
        <LuxuryButton active={page === "home"} onClick={() => setPage("home")}>
          🏖️ Home
        </LuxuryButton>

        <LuxuryButton active={page === "insule"} onClick={() => setPage("insule")}>
          🏝️ Insule
        </LuxuryButton>

        <LuxuryButton active={page === "avioane"} onClick={() => setPage("avioane")}>
          ✈️ Avioane
        </LuxuryButton>

        <LuxuryButton active={page === "map"} onClick={() => setPage("map")}>
          🗺️ Map
        </LuxuryButton>

        <LuxuryButton active={page === "booking"} onClick={() => setPage("booking")}>
          📘 Booking
        </LuxuryButton>

        <LuxuryButton active={page === "quote"} onClick={() => setPage("quote")}>
          💬 Quote
        </LuxuryButton>

        <LuxuryButton
          active={page === "dashboard"}
          onClick={() => setPage("dashboard")}
        >
          📊 Dashboard
        </LuxuryButton>
        

        <button className="luxury-button" onClick={handleLogout}>
          🚪 Logout
        </button>
      </nav>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="luxury-content"
        >
          {page === "home" && (
            <HomePage
              onExploreDashboard={() => setPage("dashboard")}
              onStartExploring={() => setPage("insule")}
            />
          )}

          {page === "insule" && (
            <InsulePage
              onSelectIsland={(island) => {
                setSelectedIsland(island);
                setPage("island-details");
              }}
            />
          )}

          {page === "island-details" && selectedIsland && (
            <IslandDetailsPage
  island={selectedIsland}
  onBack={() => setPage("insule")}
  onConfirmBooking={handleBookingSuccess}
/>

          )}

          {page === "avioane" && <AvioanePage />}
          {page === "map" && <MapPage />}
          {page === "booking" && <BookingPage />}
          {page === "quote" && <QuotePage />}
          {page === "dashboard" && <DashboardPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ================= BUTTON ================= */

interface ButtonProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

function LuxuryButton({ active, onClick, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`luxury-button ${active ? "active" : ""}`}
    >
      {children}
    </button>
  );
}
