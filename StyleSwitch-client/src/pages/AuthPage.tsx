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

type AuthMode = "login" | "signup";

interface AuthPageProps {
  mode: AuthMode;
  onSwitch: () => void;
}

const AuthPage = ({ mode, onSwitch }: AuthPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const isSignup = mode === "signup";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
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
            Dress for the
            <br />
            <em>version of you</em>
            <br />
            that shows up.
          </h1>
          <p>Curated pieces. More possibilities. Less closet clutter.</p>
        </motion.div>
      </motion.div>
      <motion.section
        className="auth-panel"
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="auth-panel-inner">
          <div className="auth-kicker">
            STYLE/SWITCH <span>04</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <h2>{isSignup ? "Make room for more" : "Welcome back"}</h2>
              <p className="auth-intro">
                {isSignup
                  ? "Create an account and start your next rotation."
                  : "Your wardrobe has been waiting for you."}
              </p>
              {submitted ? (
                <div className="auth-success">
                  {isSignup
                    ? "Account ready for your first switch."
                    : "You are all set. Welcome back to your rotation."}
                </div>
              ) : (
                <form className="auth-form" onSubmit={handleSubmit}>
                  {isSignup && (
                    <label>
                      <span>Name</span>
                      <div className="input-wrap">
                        <UserRound size={17} />
                        <input required name="name" placeholder="Your name" />
                      </div>
                    </label>
                  )}
                  <label>
                    <span>Email address</span>
                    <div className="input-wrap">
                      <Mail size={17} />
                      <input
                        required
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                      />
                    </div>
                  </label>
                  <label>
                    <span>Password</span>
                    <div className="input-wrap">
                      <LockKeyhole size={17} />
                      <input
                        required
                        minLength={6}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="At least 6 characters"
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
                    {isSignup ? "Create my account" : "Enter Style Switch"}
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
