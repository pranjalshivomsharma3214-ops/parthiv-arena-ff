
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { uploadScreenshot } from "../services/screenshotUpload";

export default function ScreenshotWall({ user }) {
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState("");
  const [matchLabel, setMatchLabel] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTournaments() {
      try {
        const registrationQuery = query(
          collection(db, "registrations"),
          where("uid", "==", user.uid)
        );

        const registrationSnapshot = await getDocs(registrationQuery);
        const registered = [];

        for (const registration of registrationSnapshot.docs) {
          const tournamentId = registration.data().tournamentId;
          const tournamentSnapshot = await getDoc(
            doc(db, "tournaments", tournamentId)
          );

          if (tournamentSnapshot.exists()) {
            registered.push({
              id: tournamentId,
              ...tournamentSnapshot.data(),
            });
          }
        }

        setTournaments(registered);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadTournaments();
  }, [user.uid]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!tournamentId || !matchLabel.trim() || !file) {
      setMessage("Please complete all fields.");
      return;
    }

    try {
      setUploading(true);

      const tournament = tournaments.find(
        (item) => item.id === tournamentId
      );

      const result = await uploadScreenshot(file);

      await addDoc(collection(db, "screenshotSubmissions"), {
        uid: user.uid,
        
        tournamentId,
        tournamentTitle: tournament.title,
        matchLabel: matchLabel.trim(),
        imageUrl: result.imageUrl,
        publicId: result.publicId,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      setFile(null);
      setMatchLabel("");
      setTournamentId("");
      setMessage("Screenshot submitted successfully!");
    } catch (error) {
      setMessage(error.message || "Submission failed.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <p>Loading your tournaments...</p>;

  return (
    <div className="screenshot-wall">
      <h2>Screenshot Wall</h2>
      <p>Submit your tournament result screenshot for verification.</p>

      {tournaments.length === 0 ? (
        <p>You have not joined any tournaments yet.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>Select Tournament</label>
          <select
            value={tournamentId}
            onChange={(event) => setTournamentId(event.target.value)}
          >
            <option value="">Choose tournament</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.title}
              </option>
            ))}
          </select>

          <label>Match Name / Number</label>
          <input
            value={matchLabel}
            onChange={(event) => setMatchLabel(event.target.value)}
            placeholder="Example: Match 1"
            maxLength={40}
          />

          <label>Result Screenshot (Max 5 MB)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              setFile(event.target.files?.[0] || null)
            }
          />

          {file && <p>Selected: {file.name}</p>}

          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Submit Screenshot"}
          </button>
        </form>
      )}

      {message && <p role="status">{message}</p>}
    </div>
  );
}
