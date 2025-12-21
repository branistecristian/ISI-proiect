import { useState } from "react";
import { motion } from "framer-motion";
import jet1 from "../../assets/jet1.webp";
import jet2 from "../../assets/jet2.jpeg";
import jet3 from "../../assets/jet3.webp";
import "./AvioanePage.css";

const jetsData = [
  {
    name: "Bombardier",
    img: jet1,
    description: "Confort suprem, scaune extensibile, entertainment premium și bar complet echipat."
  },
  {
    name: "CS-RRC",
    img: jet2,
    description: "Interior elegant, Wi-Fi de mare viteză, zone de relaxare și servicii personalizate la bord."
  },
  {
    name: "GulfStream",
    img: jet3,
    description: "Cabine spațioase, cinematograf privat, selecție gourmet de băuturi și mese fine."
  }
];

export default function AvioanePage() {
  const [search, setSearch] = useState("");

  const filteredJets = jetsData.filter(jet =>
    jet.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <motion.div
        className="page-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="title">Zboară în Stil First Class ✈️</h1>

        {/* BARA DE SEARCH */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Caută avionul dorit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
        </div>

        <div className="plane-section">
          {filteredJets.length > 0 ? (
            filteredJets.map((jet, i) => (
              <motion.div
                key={i}
                className="plane-box"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 150 }}
              >
                <img src={jet.img} alt={jet.name} className="plane-image" />
                <h2>{jet.name}</h2>
                <p>{jet.description}</p>
                <button className="reserve-btn">Rezervă Acum</button>
              </motion.div>
            ))
          ) : (
            <p className="no-results">Niciun avion găsit.</p>
          )}
        </div>
      </motion.div>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-col">
            <h4>Luxury Travel</h4>
            <p>
              Platformă premium dedicată experiențelor exclusiviste,
              insulelor private și avioanelor de lux.
            </p>
          </div>

          <div className="footer-col">
            <h4>Navigare</h4>
            <ul>
              <li>Home</li>
              <li>Insule</li>
              <li>Avioane</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>Email: contact@luxurytravel.com</li>
              <li>Telefon: +40 700 000 000</li>
              <li>București, România</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Luxury Travel. Toate drepturile rezervate.
        </div>
      </footer>
    </>
  );
}
