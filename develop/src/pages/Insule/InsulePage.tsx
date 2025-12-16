import { useState } from "react";
import { motion } from "framer-motion";
import dorna from "../../assets/drona.webp";
import insula from "../../assets/insul.jpeg";
import maldive from "../../assets/maldive2.webp";
import "./InsulePage.css";

const islandsData = [
  { 
    name: "Seychelles", 
    emoji: "🏔️", 
    description: "Seychelles oferă un mix unic de plaje virgine cu nisip alb, ape turcoaz și păduri tropicale dense. Insulele principale, precum Mahé, Praslin și La Digue, sunt ideale pentru explorări exclusiviste, drumeții în natură și relaxare la resorturi de lux. Este o destinație pentru cei care caută rafinament, discreție și frumusețea naturală nealterată.", 
    img: dorna 
  },
  { 
    name: "Bora Bora", 
    emoji: "🌴", 
    description: "Bora Bora, cunoscută drept perla Polineziei Franceze, impresionează prin lagunele sale de un albastru intens și peisajele montane spectaculoase. Este destinația perfectă pentru cupluri și iubitorii de lux, cu bungalow-uri suspendate deasupra apei, snorkeling printre recifuri colorate și excursii private cu iahtul.", 
    img: insula 
  },
  { 
    name: "Maldive", 
    emoji: "🐚", 
    description: "Maldive sunt un adevărat paradis tropical. Plaje cu nisip fin și alb, ape cristaline de culoarea turcoazului și resorturi luxoase pe apă fac din această destinație locul perfect pentru relaxare absolută. Fiecare vilă este izolată, oferind intimitate totală și servicii personalizate, de la gastronomie rafinată la spa-uri de top.", 
    img: maldive 
  }
];

export default function InsulePage() {
  const [search, setSearch] = useState("");

  const filteredIslands = islandsData.filter(island =>
    island.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <motion.div
        className="page-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="title">Insule Exclusive 🏝️</h1>

        {/* SEARCH */}
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Caută insula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
        </div>

        {/* GRID INSULE */}
        <div className="island-grid">
          {filteredIslands.map((island, i) => (
            <motion.div
              key={i}
              className="island-card"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 150 }}
            >
              <img src={island.img} alt={island.name} className="island-image" />
              <h2>{island.emoji} {island.name}</h2>
              <p>{island.description}</p>
              <button className="reserve-button">Rezervă acum</button>
            </motion.div>
          ))}

          {filteredIslands.length === 0 && (
            <p className="no-results">Nicio insulă găsită.</p>
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
