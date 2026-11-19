
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";

export default function ScreenshotReview({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadSubmissions() {
    try {
      const q = query(
        collection(db, "screenshotSubmissions"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      setSubmissions(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function reviewSubmission(id, status) {
    try {
      await updateDoc(doc(db, "screenshotSubmissions", id), {
        status,
        reviewedBy: user.uid,
        reviewedAt: serverTimestamp(),
      });

      setMessage(`Submission ${status}.`);
      await loadSubmissions();
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (loading) return <p>Loading submissions...</p>;

  return (
    <div>
      <h2>Screenshot Verification</h2>
      <p>{message}</p>

      {submissions.length === 0 && (
        <p>No screenshot submissions yet.</p>
      )}

      {submissions.map((item) => (
        <div key={item.id} style={{
          padding: 16,
          marginBottom: 16,
          border: "1px solid #555",
          borderRadius: 12
        }}>
          <h3>{item.tournamentTitle}</h3>
          <p>Player UID: {item.uid}</p>
          <p>Match: {item.matchLabel}</p>
          <p>Status: {item.status}</p>

          <img
            src={item.imageUrl}
            alt="Tournament result"
            style={{
              width: "100%",
              maxWidth: 350,
              borderRadius: 10
            }}
          />

          {item.status === "Pending" && (
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={() =>
                reviewSubmission(item.id, "Approved")
              }>
                Approve
              </button>

              <button onClick={() =>
                reviewSubmission(item.id, "Rejected")
              }>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
