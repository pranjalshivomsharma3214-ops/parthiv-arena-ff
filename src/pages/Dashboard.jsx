
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

import { auth, db } from "../services/firebase";
import Tournaments from "./Tournaments";
import Admin from "./Admin";
import MatchRoom from "./MatchRoom";
import ScreenshotWall from "./screenshotWall";
import "./Dashboard.css";

function Dashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const menuItems = [
    "Overview",
    "Tournaments",
    "My Matches",
    "Screenshot Wall",
    "Leaderboard",
    "Announcements",
    "Settings",
    ...(isAdmin ? ["Admin"] : [])
  ];

  useEffect(() => {
    async function loadProfile() {
      try {
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }
      } catch (error) {
        console.error("Profile loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user.uid]);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const adminRef = doc(db, "adminUsers", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          const adminData = adminSnap.data();

          setIsAdmin(
            adminData.role === "owner" &&
            adminData.active === true
          );
        }
      } catch (error) {
        console.error("Admin verification error:", error);
        setIsAdmin(false);
      }
    }

    checkAdmin();
  }, [user.uid]);

  const username = profile?.username || "Player";

  return (
    <main className="dashboard-shell">

      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="brand-mark">P</div>
          <span>PARTHIV <b>ARENA</b></span>
        </div>

        <p className="sidebar-label">MAIN MENU</p>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item}
              className={
                activeTab === item
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActiveTab(item)}
            >
              {item === "Overview" ? "⌂" :
               item === "Tournaments" ? "♜" :
               item === "My Matches" ? "⚔" :
               item === "Screenshot Wall" ? "▣" :
               item === "Leaderboard" ? "♛" :
               item === "Announcements" ? "◈" :
               item === "Admin" ? "♙" : "⚙"}

              <span>{item}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-player">
            <div className="player-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{username}</strong>
              <small>PLAYER ACCOUNT</small>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={() => signOut(auth)}
          >
            ↪ LOG OUT
          </button>
        </div>
      </aside>

      <section className="dashboard-main">

        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-eyebrow">
              PLAYER CONTROL CENTER
            </p>
            <h2>{activeTab}</h2>
          </div>

          <div className="topbar-user">
            <div className="player-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <span>{username}</span>
          </div>
        </header>

        {loading ? (
          <div className="dashboard-loading">
            Loading your player profile...
          </div>
        ) : (
          <div className="dashboard-content">

            {activeTab === "Overview" ? (
              <>
                <section className="dashboard-hero">
                  <div>
                    <p className="dashboard-eyebrow">
                      WELCOME BACK, PLAYER
                    </p>

                    <h1>
                      Welcome to your <span>ARENA.</span>
                    </h1>

                    <p>
                      Your competitive journey starts here.
                      Explore free tournaments and track your progress.
                    </p>

                    <button
                      className="dashboard-primary"
                      onClick={() => setActiveTab("Tournaments")}
                    >
                      EXPLORE TOURNAMENTS ↗
                    </button>
                  </div>

                  <div className="hero-symbol">P</div>
                </section>

                <div className="dashboard-section-heading">
                  <div>
                    <p className="dashboard-eyebrow">
                      YOUR PERFORMANCE
                    </p>
                    <h2>Player Statistics</h2>
                  </div>
                </div>

                <section className="stats-grid">
                  <article className="stat-card">
                    <span>TOURNAMENTS JOINED</span>
                    <strong>
                      {profile?.tournamentsJoined ?? 0}
                    </strong>
                    <small>Your participation record</small>
                  </article>

                  <article className="stat-card">
                    <span>VERIFIED WINS</span>
                    <strong>
                      {profile?.verifiedWins ?? 0}
                    </strong>
                    <small>Admin-verified results</small>
                  </article>

                  <article className="stat-card">
                    <span>PLAYER STATUS</span>
                    <strong className="status-active">
                      ACTIVE
                    </strong>
                    <small>Account status</small>
                  </article>
                </section>

                <section className="dashboard-lower-grid">
                  <article className="dashboard-panel">
                    <p className="dashboard-eyebrow">COMPETE</p>
                    <h3>Upcoming Tournaments</h3>

                    <p className="panel-description">
                      New community tournaments will appear here
                      when published by the admin.
                    </p>

                    <button
                      className="text-action"
                      onClick={() => setActiveTab("Tournaments")}
                    >
                      VIEW TOURNAMENTS →
                    </button>
                  </article>

                  <article className="dashboard-panel">
                    <p className="dashboard-eyebrow">
                      STAY UPDATED
                    </p>

                    <h3>Latest Announcements</h3>

                    <p className="panel-description">
                      Tournament updates and important notices
                      will appear here.
                    </p>

                    <button
                      className="text-action"
                      onClick={() => setActiveTab("Announcements")}
                    >
                      VIEW ANNOUNCEMENTS →
                    </button>
                  </article>
                </section>
              </>
            ) : activeTab === "Tournaments" ? (
              <Tournaments user={user} />

            ) : activeTab === "My Matches" ? (
              <MatchRoom user={user} />

            ) : activeTab === "Screenshot Wall" ? (
              <ScreenshotWall user={user} />

            ) : activeTab === "Admin" && isAdmin ? (
              <Admin user={user} />

            ) : (
              <section className="dashboard-panel section-placeholder">

                <p className="dashboard-eyebrow">
                  PARTHIV ARENA FF
                </p>

                <h2>{activeTab}</h2>

                <p className="panel-description">
                  This section is being prepared. Its features
                  will be connected in the upcoming development steps.
                </p>

                <button
                  className="dashboard-primary"
                  onClick={() => setActiveTab("Overview")}
                >
                  BACK TO OVERVIEW
                </button>

              </section>
            )}

          </div>
        )}

      </section>

      <nav className="mobile-nav">
        {["Overview", "Tournaments", "Leaderboard", "Settings"].map((item) => (
          <button
            key={item}
            className={
              activeTab === item ? "mobile-nav-active" : ""
            }
            onClick={() => setActiveTab(item)}
          >
            <span>
              {item === "Overview" ? "⌂" :
               item === "Tournaments" ? "♜" :
               item === "Leaderboard" ? "♛" : "⚙"}
            </span>

            <small>{item}</small>
          </button>
        ))}
      </nav>

    </main>
  );
}

export default Dashboard;
