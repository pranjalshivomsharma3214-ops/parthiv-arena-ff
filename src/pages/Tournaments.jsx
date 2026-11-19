
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../services/firebase";
import "./Tournaments.css";

function Tournaments({ user }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTournaments() {
      try {
        const q = query(
          collection(db, "tournaments"),
          where("status", "==", "published")
        );

        const snapshot = await getDocs(q);

        setTournaments(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
          }))
        );
      } catch (error) {
        console.error("Tournament loading error:", error);
        setMessage("Unable to load tournaments. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadTournaments();
  }, []);

  const joinTournament = async (tournament) => {
    setJoining(tournament.id);
    setMessage("");

    try {
      const profileRef = doc(db, "users", user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        throw new Error("Player profile not found.");
      }

      const profile = profileSnap.data();

      const registrationId = `${tournament.id}_${user.uid}`;
      const registrationRef = doc(
        db,
        "registrations",
        registrationId
      );

      const existingRegistration = await getDoc(registrationRef);

      if (existingRegistration.exists()) {
        throw new Error("You have already joined this tournament.");
      }

      await setDoc(registrationRef, {
        tournamentId: tournament.id,
        uid: user.uid,
        username: profile.username,
        createdAt: serverTimestamp()
      });

      setMessage("Tournament registration successful!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setJoining("");
    }
  };

  return (
    <section className="tournaments-page">

      <div className="tournament-heading">
        <div>
          <p className="dashboard-eyebrow">COMPETE WITH THE COMMUNITY</p>
          <h1>Discover <span>Tournaments</span></h1>
          <p>Explore upcoming free community tournaments.</p>
        </div>

        <div className="tournament-count">
          {tournaments.length} AVAILABLE
        </div>
      </div>

      {message && (
        <p className="tournament-message">{message}</p>
      )}

      {loading ? (
        <div className="tournament-empty">
          Loading tournaments...
        </div>
      ) : tournaments.length === 0 ? (
        <div className="tournament-empty">
          <div className="empty-icon">♜</div>
          <h2>No tournaments available</h2>
          <p>
            New tournaments will appear here when published
            by the PARTHIV ARENA admin.
          </p>
        </div>
      ) : (
        <div className="tournament-grid">
          {tournaments.map((tournament) => (
            <article
              className="tournament-card"
              key={tournament.id}
            >
              <div className="tournament-image">
                {tournament.thumbnailUrl ? (
                  <img
                    src={tournament.thumbnailUrl}
                    alt={tournament.title || "Tournament"}
                  />
                ) : (
                  <div className="tournament-image-placeholder">
                    PARTHIV ARENA
                  </div>
                )}

                <span className="tournament-status">
                  OPEN
                </span>
              </div>

              <div className="tournament-card-content">
                <p className="tournament-mode">
                  {tournament.mode || "COMMUNITY MATCH"}
                </p>

                <h2>{tournament.title || "Untitled Tournament"}</h2>

                <div className="tournament-details">
                  <p>MAP <strong>{tournament.map || "TBA"}</strong></p>
                  <p>DATE <strong>{tournament.date || "TBA"}</strong></p>
                  <p>TIME <strong>{tournament.time || "TBA"}</strong></p>
                  <p>SLOTS <strong>{tournament.slots ?? "TBA"}</strong></p>
                </div>

                <div className="tournament-prize">
                  <span>NON-CASH PRIZE</span>
                  <strong>{tournament.prizeDetails || "Details coming soon"}</strong>
                </div>

                <p className="tournament-description">
                  {tournament.description || "Join this free community tournament."}
                </p>

                <button
                  className="join-tournament-button"
                  disabled={joining === tournament.id}
                  onClick={() => joinTournament(tournament)}
                >
                  {joining === tournament.id
                    ? "PLEASE WAIT..."
                    : "JOIN FREE TOURNAMENT ↗"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

    </section>
  );
}

export default Tournaments;
