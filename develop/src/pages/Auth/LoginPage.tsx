import { motion } from "framer-motion";

export default function LoginPage({ onSwitch }: { onSwitch: () => void }) {
  return (
    <motion.div
      className="auth-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="title">Autentificare 🔐</h1>

      <div className="auth-box">
        <input type="email" placeholder="Email" className="auth-input" />
        <input type="password" placeholder="Parola" className="auth-input" />

        <button className="auth-button">Login</button>

        <p className="auth-switch">
          Nu ai cont? <span onClick={onSwitch}>Creeaza cont</span>
        </p>
      </div>
    </motion.div>
  );
}
