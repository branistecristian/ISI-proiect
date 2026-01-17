import { motion } from "framer-motion";
import "./HomePage.css";

import logo from "../../assets/JEF.jpg";
import island from "../../assets/maldive.jpg";
import jet from "../../assets/jett.webp";
import luxury from "../../assets/sapca.jpg";

export default function HomePage({
  onExploreDashboard,
  onStartExploring,
}: {
  onExploreDashboard: () => void;
  onStartExploring: () => void;
}) {

  return (
    <>
      <div className="home-wrapper">

        {/* ================= HERO ================= */}
        <motion.section
          className="home-hero"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          <motion.img
            src={logo}
            alt="Luxury Travel Logo"
            className="home-logo"
            variants={{
              hidden: { opacity: 0, y: -30 },
              visible: { opacity: 1, y: 0 },
            }}
          />

          <motion.h1 variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Luxury Travel Experience
          </motion.h1>

          <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Platformă premium dedicată experiențelor exclusiviste,
            destinațiilor rare și transportului privat de lux.
          </motion.p>

<motion.button
  className="hero-cta"
  whileHover={{ scale: 1.06 }}
  onClick={onExploreDashboard}
>
  Explore Experiences
</motion.button>


          <motion.span
            className="hero-trust"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            Trusted by a lot of luxury travelers worldwide
          </motion.span>
        </motion.section>

        {/* ================= FEATURES ================= */}
        <section className="home-features">
          <motion.div whileHover={{ y: -8 }} className="feature-card">
            <h3>🌍 Curated Destinations</h3>
            <p>Insule și locații atent selecționate, nu cataloage generice.</p>
          </motion.div>

          <motion.div whileHover={{ y: -8 }} className="feature-card">
            <h3>✈️ Private Aviation</h3>
            <p>Acces exclusiv la flote premium de avioane private.</p>
          </motion.div>

          <motion.div whileHover={{ y: -8 }} className="feature-card">
            <h3>🛎️ Concierge Level</h3>
            <p>Fiecare rezervare este tratată ca un serviciu bespoke.</p>
          </motion.div>
        </section>

        {/* ================= SECTION 1 ================= */}
        <motion.section
          className="home-section"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="home-text">
            <h2>Insule private & destinații exotice</h2>
            <p>
              Descoperă insule atent selectate din cele mai spectaculoase
              colțuri ale lumii. Locații izolate, resorturi de 5 stele și
              experiențe create pentru cei care caută perfecțiunea.
            </p>
          </div>
          <img src={island} alt="Luxury Islands" className="home-image" />
        </motion.section>

        {/* ================= SECTION 2 ================= */}
        <motion.section
          className="home-section reverse"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={jet} alt="Private Jet" className="home-image jet-image" />
          <div className="home-text">
            <h2>Avioane private & confort absolut</h2>
            <p>
              Zboară fără compromisuri. Avioane private, servicii personalizate
              și intimitate totală, de la decolare până la aterizare.
            </p>
          </div>
        </motion.section>

        {/* ================= SECTION 3 ================= */}
        <motion.section
          className="home-section"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="home-text">
            <h2>Standardele luxului modern</h2>
            <p>
              Fiecare experiență este gândită pentru cei care apreciază
              discreția, rafinamentul și atenția la detalii.
            </p>
          </div>
          <img src={luxury} alt="Luxury Lifestyle" className="home-image" />
        </motion.section>

        {/* ================= STATS ================= */}
        <section className="home-stats">
          <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}>
            <strong></strong>
            <span>Exclusive Islands</span>
          </motion.div>

          <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}>
            <strong> </strong>
            <span>Private Jets</span>
          </motion.div>

          <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}>
            <strong>98%</strong>
            <span>Client Satisfaction</span>
          </motion.div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="home-cta-final">
          <h2>Your next journey starts here</h2>
          <p>Explore private islands and bespoke flights tailored to you.</p>
          <button className="hero-cta" onClick={onStartExploring}>
            Start Exploring
          </button>

        </section>
      </div>

      {/* ================= FOOTER ================= */}
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
              <li>Telefon: +40 742 941 210</li>
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
