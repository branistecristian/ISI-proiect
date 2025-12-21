import AvioanePage from "./pages/Avioane/AvioanePage";
import InsulePage from "./pages/Insule/InsulePage";
import HomePage from "./pages/Home/HomePage";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function App() {
  const [page, setPage] = useState<"home" | "insule" | "avioane">("home");

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
          {page === "home" && <HomePage />}
          {page === "insule" && <InsulePage />}
          {page === "avioane" && <AvioanePage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

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
