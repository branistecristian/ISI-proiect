import { motion } from "framer-motion";
import "./HomePage.css";

import logo from "../../assets/JEF.jpg";
import island from "../../assets/maldive.jpg";
import jet from "../../assets/jett.webp";
import luxury from "../../assets/sapca.jpg";

export default function HomePage() {
  return (
    <>
      <div className="home-wrapper">
        {/* HERO */}
        <motion.section
          className="home-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={logo} alt="Logo" className="home-logo" />
          <h1>Luxury Travel Experience</h1>
          <p>
            Platformă premium dedicată experiențelor exclusiviste,
            destinațiilor rare și transportului privat de lux.
          </p>
        </motion.section>

        {/* SECTION 1 */}
        <section className="home-section">
          <div className="home-text">
            <h2>Insule private & destinații exotice</h2>
            <p>
              Descoperă insule atent selectate din cele mai spectaculoase
              colțuri ale lumii. Locații izolate, resorturi de 5 stele și
              experiențe create pentru cei care caută perfecțiunea.
            </p>
          </div>
          <img src={island} alt="Insule de lux" className="home-image" />
        </section>

        {/* SECTION 2 */}
        <section className="home-section reverse">
          <img src={jet} alt="Avion privat" className="home-image jet-image" />
          <div className="home-text">
            <h2>Avioane private & confort absolut</h2>
            <p>
              Zboară fără compromisuri. Avioane private, servicii personalizate
              și intimitate totală, de la decolare până la aterizare.
            </p>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="home-section">
          <div className="home-text">
            <h2>Standardele luxului modern</h2>
            <p>
              Fiecare experiență este gândită pentru cei care apreciază
              discreția, rafinamentul și atenția la detalii.
            </p>
          </div>
          <img src={luxury} alt="Luxury lifestyle" className="home-image" />
        </section>
      </div>

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
