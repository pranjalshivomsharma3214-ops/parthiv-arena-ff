
import { useEffect, useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import { auth } from "./services/firebase";
import { createPlayerProfile } from "./services/profileService";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const cleanUsername = username.trim().toLowerCase();

        if (!/^[a-z0-9_]{3,16}$/.test(cleanUsername)) {
          throw new Error(
            "Username must be 3-16 characters. Use letters, numbers or underscores."
          );
        }

        const result = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        try {
          await createPlayerProfile(result.user, cleanUsername);
          setMessage("Account and player profile created successfully!");
        } catch (profileError) {
          await signOut(auth);
          throw profileError;
        }

      } else {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        setMessage("Login successful!");
      }

    } catch (error) {
      const errors = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Please enter a valid email.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/network-request-failed": "Check your internet connection.",
        "permission-denied": "Database permission error. Check Firestore Rules."
      };

      setMessage(errors[error.code] || error.message);

    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setMessage("Enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  
 
if (user) {
  return <Dashboard user={user} />;
}


  return (
    <main className="app-shell">

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <span>PARTHIV <b>ARENA</b></span>
        </div>

        <span className="community-label">
          COMMUNITY ARENA
        </span>
      </header>

      <section className="auth-layout">

        <div className="intro">
          <p className="eyebrow">YOUR GAME. YOUR ARENA.</p>

          <h1>
            PLAY. COMPETE.
            <br />
            <span>MAKE YOUR MARK.</span>
          </h1>

          <p className="intro-text">
            Enter the arena, join free tournaments and
            build your competitive journey.
          </p>

          <div className="feature-list">
            <p>✦ Free community tournaments</p>
            <p>✦ Verified tournament results</p>
            <p>✦ Your player profile and history</p>
          </div>
        </div>

        <section className="auth-card">

          <div className="card-heading">
            <p className="eyebrow">PLAYER ACCOUNT</p>

            <h2>
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>

            <p>
              {mode === "login"
                ? "Login to continue your journey."
                : "Join the PARTHIV ARENA community."}
            </p>
          </div>

          <div className="mode-switch">

            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              LOGIN
            </button>

            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
            >
              SIGN UP
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            {mode === "signup" && (
              <>
                <label>Unique Username</label>

                <input
                  type="text"
                  placeholder="e.g. parthiv_123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  minLength={3}
                  maxLength={16}
                  pattern="[a-zA-Z0-9_]{3,16}"
                  title="Use 3-16 letters, numbers or underscores."
                  required
                />
              </>
            )}

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            {mode === "login" && (
              <button
                type="button"
                className="forgot-button"
                onClick={handleReset}
              >
                Forgot password?
              </button>
            )}

            {message && (
              <p className="status-message">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="main-button"
              disabled={loading}
            >
              {loading
                ? "PLEASE WAIT..."
                : mode === "login"
                  ? "LOGIN TO ARENA ↗"
                  : "CREATE ACCOUNT ↗"}
            </button>

          </form>

          <p className="secure-note">
            Secure account authentication powered by Firebase.
          </p>

        </section>

      </section>

      <footer className="footer">
        © 2026 PARTHIV ARENA FF · COMMUNITY PLATFORM
      </footer>

    </main>
  );
}

export default App;
