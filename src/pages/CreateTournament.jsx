
import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../services/firebase";
import "./CreateTournament.css";

function CreateTournament({ user }) {
  const [form, setForm] = useState({
    title: "",
    mode: "Solo",
    map: "Bermuda",
    date: "",
    time: "",
    slots: "48",
    prizeDetails: "",
    description: "",
    rules: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

    if (Number(form.slots) < 2) {
      setMessage("Minimum 2 slots required.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "tournaments"), {
        ...form,
        slots: Number(form.slots),
        entryFee: 0,
        status: "published",
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });

      setMessage("Tournament published successfully!");

      setForm({
        title: "",
        mode: "Solo",
        map: "Bermuda",
        date: "",
        time: "",
        slots: "48",
        prizeDetails: "",
        description: "",
        rules: ""
      });
    } catch (error) {
      console.error("Tournament creation error:", error);
      setMessage("Unable to publish tournament: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="create-tournament-page">
      <div className="create-tournament-heading">
        <p className="dashboard-eyebrow">ADMIN CONTROL CENTER</p>
        <h1>Create <span>Tournament</span></h1>
        <p>Publish a new free community tournament.</p>
      </div>

      <form
        className="tournament-form"
        onSubmit={handleSubmit}
      >
        <div className="form-field">
          <label>Tournament Name</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter tournament name"
            required
            maxLength={60}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Match Type</label>
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
            >
              <option>Solo</option>
              <option>Duo</option>
              <option>Squad</option>
            </select>
          </div>

          <div className="form-field">
            <label>Map</label>
            <select
              name="map"
              value={form.map}
              onChange={handleChange}
            >
              <option>Bermuda</option>
              <option>Purgatory</option>
              <option>Kalahari</option>
              <option>Alpine</option>
              <option>Nexterra</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Total Slots</label>
            <input
              type="number"
              name="slots"
              min="2"
              max="1000"
              value={form.slots}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Entry Fee</label>
            <input value="FREE" disabled />
          </div>
        </div>

        <div className="form-field">
          <label>Non-Cash Prize Details</label>
          <input
            name="prizeDetails"
            value={form.prizeDetails}
            onChange={handleChange}
            placeholder="Example: Digital certificate"
            required
          />
        </div>

        <div className="form-field">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Tournament description..."
            rows="4"
          />
        </div>

        <div className="form-field">
          <label>Tournament Rules</label>
          <textarea
            name="rules"
            value={form.rules}
            onChange={handleChange}
            placeholder="Enter tournament rules..."
            rows="5"
            required
          />
        </div>

        {message && (
          <p className="create-tournament-message">
            {message}
          </p>
        )}

        <button
          className="create-tournament-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "PUBLISHING..." : "PUBLISH TOURNAMENT ↗"}
        </button>
      </form>
    </section>
  );
}

export default CreateTournament;
