
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "../services/firebase";
import "./MatchRoom.css";

function MatchRoom({ user }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadRooms() {
      try {
        const registrationsQuery = query(
          collection(db, "registrations"),
          where("uid", "==", user.uid)
        );

        const registrations = await getDocs(registrationsQuery);
        const joinedIds = registrations.docs.map(
          (item) => item.data().tournamentId
        );

        const roomResults = await Promise.all(
          joinedIds.map(async (tournamentId) => {
            const roomRef = doc(db, "matchRooms", tournamentId);
            const roomSnap = await getDoc(roomRef);

            if (!roomSnap.exists()) return null;

            return {
              id: roomSnap.id,
              ...roomSnap.data()
            };
          })
        );

        setRooms(roomResults.filter(Boolean));
      } catch (error) {
        console.error(error);
        setMessage("Unable to load match rooms.");
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, [user.uid]);

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setMessage("Copied successfully!");
    } catch {
      setMessage("Copy failed. Please copy manually.");
    }
  };

  if (loading) return <p>Loading match rooms...</p>;

  return (
    <main className="match-room-page">
      <p className="dashboard-eyebrow">PARTHIV ARENA FF</p>
      <h1>Match <span>Rooms</span></h1>
      <p>Your registered tournament room details.</p>

      {message && <p className="room-message">{message}</p>}

      {rooms.length === 0 ? (
        <div className="room-empty">
          <h2>No Room Available</h2>
          <p>Room details will appear here when published by admin.</p>
        </div>
      ) : (
        rooms.map((room) => (
          
<article className="room-card" key={room.id}>
  <h2>{room.tournamentTitle || "Tournament Room"}</h2>
  <p>Status: {room.status || "Scheduled"}</p>

  {room.status !== "Published" ? (
    <p>Room details are not published yet.</p>
  ) : (
    <>
      <div className="room-detail">
        <span>ROOM ID</span>
        <strong>{room.roomId}</strong>
        <button onClick={() => copyText(room.roomId)}>
          COPY ID
        </button>
      </div>

      <div className="room-detail">
        <span>ROOM PASSWORD</span>
        <strong>{room.password}</strong>
        <button onClick={() => copyText(room.password)}>
          COPY PASSWORD
        </button>
      </div>
    </>
  )}
</article>

        ))
      )}
    </main>
  );
}

export default MatchRoom;
