import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import "./login.css";

import { AuthControllerService } from "../../api/generated/services/AuthControllerService";
import { OpenAPI } from "../../api/generated/core/OpenAPI";

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState(""); // ✅ NEW
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ================= VALIDATION ================= */

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.(ro|com)$/.test(email);

  const isStrongPassword = (password: string) =>
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

  const normalizeError = (e: any): string => {
    const status = e?.status ?? e?.response?.status;

    if (status === 401 || status === 403) return "Invalid email or password";
    if (status === 409) return "Account already exists";
    if (status === 400) return "Invalid request";

    if (e?.body?.message) return String(e.body.message);
    if (e?.message) return String(e.message);

    return "Something went wrong";
  };

  const persistAuth = (auth: any) => {
    const token =
      auth?.accessToken ?? auth?.token ?? auth?.jwt ?? auth?.access_token ?? null;

    if (token) {
      localStorage.setItem("token", token);
      OpenAPI.TOKEN = token;
    }

    localStorage.setItem("isLoggedIn", "true");
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);

    if (newMode === "login") {
      setName("");
    }
  };

  /* ================= LOGIN ================= */

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Email must be valid (.ro or .com)");
      return;
    }

    setLoading(true);
    try {
      const res = await AuthControllerService.login({
        email,
        password,
      });

      persistAuth(res);
      onLogin();
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
  };

  /* ================= REGISTER ================= */

  const handleRegister = async () => {
    setError("");

    if (!name.trim() || !email || !password || !confirmPassword) {
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

    setLoading(true);
    try {
      const res = await AuthControllerService.register({
        name: name.trim(),
        email,
        password,
      });

      persistAuth(res);
      onLogin();
    } catch (e) {
      setError(normalizeError(e));
    } finally {
      setLoading(false);
    }
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
            {/* ✅ NAME (REGISTER ONLY) */}
            {mode === "register" && (
              <input
                type="text"
                placeholder="NAME"
                className="lux-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoComplete="name"
              />
            )}

            {/* EMAIL */}
            <input
              type="email"
              placeholder="EMAIL"
              className="lux-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />

            {/* PASSWORD */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                className="lux-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <span className="eye" onClick={() => setShowPassword((p) => !p)}>
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <span
                  className="eye"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                >
                  👁️
                </span>
              </div>
            )}

            {/* ERROR */}
            {error && <div className="lux-error">{error}</div>}

            {/* ACTION BUTTON */}
            {mode === "login" ? (
              <button
                className="lux-button"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "LOADING..." : "ACCESS"}
              </button>
            ) : (
              <button
                className="lux-button"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "LOADING..." : "CREATE ACCOUNT"}
              </button>
            )}

            {/* SWITCH */}
            <div className="lux-switch">
              {mode === "login" ? (
                <span onClick={() => !loading && switchMode("register")}>
                  Create an account
                </span>
              ) : (
                <span onClick={() => !loading && switchMode("login")}>
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
