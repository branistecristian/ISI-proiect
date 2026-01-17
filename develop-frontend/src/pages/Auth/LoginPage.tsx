import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import "./login.css";

interface User {
  email: string;
  password: string;
}

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ================= STORAGE HELPERS ================= */

  const getUsers = (): User[] =>
    JSON.parse(localStorage.getItem("users") || "[]");

  const saveUsers = (users: User[]) =>
    localStorage.setItem("users", JSON.stringify(users));

  /* ================= VALIDATION ================= */

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.(ro|com)$/.test(email);
  };

  const isStrongPassword = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  };

  /* ================= LOGIN ================= */

  const handleLogin = () => {
    const users = getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError("Invalid credentials");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    onLogin();
  };

  /* ================= REGISTER ================= */

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Email must be valid (.ro or .com)");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        "Password must be at least 8 characters and include upper & lower case letters and a number"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      setError("Account already exists");
      return;
    }

    users.push({ email, password });
    saveUsers(users);

    setMode("login");
    setError("");
  };

  /* ================= UI ================= */

  return (
    <div className="lux-auth-bg">
      <motion.div
        className="lux-auth-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="lux-auth-title">
          {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
        </h1>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="lux-auth-form"
          >
            {/* EMAIL */}
            <input
              type="email"
              placeholder="EMAIL"
              className="lux-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* PASSWORD */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                className="lux-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="eye"
                onClick={() => setShowPassword((p) => !p)}
              >
                👁️
              </span>
            </div>

            {/* CONFIRM PASSWORD */}
            {mode === "register" && (
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="CONFIRM PASSWORD"
                  className="lux-input"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />
                <span
                  className="eye"
                  onClick={() =>
                    setShowConfirmPassword((p) => !p)
                  }
                >
                  👁️
                </span>
              </div>
            )}

            {/* ERROR */}
            {error && <div className="lux-error">{error}</div>}

            {/* ACTION BUTTON */}
            {mode === "login" ? (
              <button className="lux-button" onClick={handleLogin}>
                ACCESS
              </button>
            ) : (
              <button className="lux-button" onClick={handleRegister}>
                CREATE ACCOUNT
              </button>
            )}

            {/* SWITCH */}
            <div className="lux-switch">
              {mode === "login" ? (
                <span onClick={() => setMode("register")}>
                  Create an account
                </span>
              ) : (
                <span onClick={() => setMode("login")}>
                  Back to login
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
