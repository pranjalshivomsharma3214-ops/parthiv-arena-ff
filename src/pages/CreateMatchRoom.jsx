
import { useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../services/firebase";

function CreateMatchRoom({ user }) {
  const [form, setForm] = useState({
    tournamentId: "",
    roomId: "",
    password: "",
    status: "Published"
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!user?.uid) {
      setMessage("Admin account not found.");
      return;
    }

    setLoading(true);

    try {
      const tournamentRef = doc(
        db,
        "tournaments",
        form.tournamentId.trim()
      );

      const tournamentSnap = await getDoc(tournamentRef);

      if (!tournamentSnap.exists()) {
        throw new Error("Tournament not found. Enter its document ID.");
      }

      const tournament = tournamentSnap.data();

      await setDoc(
        doc(db, "matchRooms", form.tournamentId.trim()),
        {
          tournamentId: form.tournamentId.trim(),
          tournamentTitle: tournament.title,
          roomId: form.roomId.trim(),
          password: form.password.trim(),
          status: form.status,
          updatedBy: user.uid,
          updatedAt: serverTimestamp()
        }
      );

      setMessage("Room details saved successfully!");
    } catch (error) {
      console.error("Room publishing error:", error);
      setMessage("Unable to save room: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{
      marginTop: 30,
      padding: 25,
      background: "#111019",
      border: "1px solid #30223e",
      borderRadius: 16
    }}>
      <h2>Publish Match Room</h2>
      <p>Enter the tournament and room details.</p>

      <form onSubmit={handleSubmit}>
        <input
          name="tournamentId"
          value={form.tournamentId}
          onChange={handleChange}
          placeholder="Tournament Document ID"
          required
        />

        <input
          name="roomId"
          value={form.roomId}
          onChange={handleChange}
          placeholder="Room ID"
          required
        />

        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Room Password"
          required
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option>Published</option>
          <option>Scheduled</option>
          <option>Completed</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "SAVING..." : "SAVE ROOM DETAILS"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </section>
  );
}

export default CreateMatchRoom;
