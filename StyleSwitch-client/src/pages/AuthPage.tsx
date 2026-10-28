import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import "./AuthPage.css";
import { useAuth } from "../context/AuthContext";

type AuthMode = "login" | "signup";

interface AuthPageProps {
  mode: AuthMode;
  onSwitch: () => void;
  onSuccess?: () => void;
}

const AuthPage = ({ mode, onSwitch, onSuccess }: AuthPageProps) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSignup = mode === "signup";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
    const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
    const body = isSignup
      ? {
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          role: "tenant",
        }
      : {
          email: formData.get("email"),
          password: formData.get("password"),
        };

    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to complete this request");
      }

      if (data.token && data.user) {
        login(data.token, data.user);
      }

      setSubmitted(true);
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to connect to the server",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-art"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85"
          alt="A styled fashion look"
        />
        <div className="auth-art-overlay" />
        <motion.div
          className="auth-art-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span>
            <Sparkles size={14} /> STYLE, ON ROTATION
          </span>
          <h1>
            Dress for the moments.
            <br />
            Return when you&apos;re done.
          </h1>
          <p>
            Access luxury designer wardrobes across the country, reduce fashion
            waste, and earn on what hangs in your closet.
          </p>
        </motion.div>
      </motion.div>

      <motion.section
        className="auth-form-wrap"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-card">
          <header className="auth-header">
            <span className="auth-badge">Style Switch Access</span>
            <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
            <p>
              {isSignup
                ? "Join the community of mindful collectors and lenders."
                : "Enter your credentials to manage your pieces and rentals."}
            </p>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignup ? -20 : 20 }}
              transition={{ duration: 0.25 }}
            >
              {submitted ? (
                <div className="auth-success">
                  <h3>
                    {isSignup
                      ? "Account created successfully!"
                      : "Welcome back!"}
                  </h3>
                  <p>
                    {isSignup
                      ? "You can now log in and explore the full wardrobe collection."
                      : "Redirecting you to the marketplace..."}
                  </p>
                  <button
                    className="auth-submit"
                    onClick={() => {
                      setSubmitted(false);
                      if (isSignup) onSwitch();
                      else if (onSuccess) onSuccess();
                    }}
                  >
                    {isSignup ? "Proceed to Login" : "Continue to Wardrobe"}
                  </button>
                </div>
              ) : (
                <form className="auth-form" onSubmit={handleSubmit}>
                  {errorMessage && (
                    <div className="auth-error">{errorMessage}</div>
                  )}

                  {isSignup && (
                    <label className="form-field">
                      <span>Full Name</span>
                      <div className="input-wrap">
                        <UserRound size={17} />
                        <input
                          required
                          type="text"
                          name="name"
                          placeholder="e.g. Maya Chen"
                        />
                      </div>
                    </label>
                  )}

                  {!isSignup && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Instant Demo Credentials
                      </span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail("admin.demo@styleswitch.com");
                            setPassword("AdminSwitch@123");
                          }}
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            background: "#0f172a",
                            color: "#fff",
                            border: "1px solid #334155",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          🛡️ Demo Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail("lender.demo@styleswitch.com");
                            setPassword("StyleSwitch@123");
                          }}
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            background: "#f1f5f9",
                            color: "#0f172a",
                            border: "1px solid #cbd5e1",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          👗 Demo Lender
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail("testrenter@styleswitch.com");
                            setPassword("Pass1234!");
                          }}
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            background: "#f1f5f9",
                            color: "#0f172a",
                            border: "1px solid #cbd5e1",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          🛍️ Demo Renter
                        </button>
                      </div>
                    </div>
                  )}

                  <label className="form-field">
                    <span>Email Address</span>
                    <div className="input-wrap">
                      <Mail size={17} />
                      <input
                        required
                        type="email"
                        name="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </label>

                  <label className="form-field">
                    <span>Password</span>
                    <div className="input-wrap">
                      <LockKeyhole size={17} />
                      <input
                        required
                        pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </label>
                  {isSignup && (
                    <label className="checkbox-row">
                      <input required type="checkbox" />{" "}
                      <span>I agree to the community guidelines.</span>
                    </label>
                  )}
                  {!isSignup && (
                    <button type="button" className="forgot-link">
                      Forgot password?
                    </button>
                  )}
                  <button className="auth-submit" type="submit">
                    {isSubmitting
                      ? "Connecting..."
                      : isSignup
                        ? "Create my account"
                        : "Enter Style Switch"}
                    <ArrowRight size={17} />
                  </button>
                </form>
              )}
              <p className="auth-switch">
                {isSignup ? "Already a member?" : "New to the rotation?"}{" "}
                <button onClick={onSwitch}>
                  {isSignup ? "Log in" : "Create an account"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.section>
    </div>
  );
};

export default AuthPage;
