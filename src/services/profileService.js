
import {
  doc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export async function createPlayerProfile(user, username) {
  const cleanUsername = username.trim().toLowerCase();

  if (!/^[a-z0-9_]{3,16}$/.test(cleanUsername)) {
    throw new Error(
      "Username must be 3-16 characters. Use letters, numbers or underscores."
    );
  }

  const usernameRef = doc(
    db,
    "usernameReservations",
    cleanUsername
  );

  const userRef = doc(db, "users", user.uid);

  await runTransaction(db, async (transaction) => {
    const usernameDoc = await transaction.get(usernameRef);
    const userDoc = await transaction.get(userRef);

    if (usernameDoc.exists()) {
      throw new Error("This username is already taken.");
    }

    if (userDoc.exists()) {
      throw new Error("Your player profile already exists.");
    }

    transaction.set(usernameRef, {
      uid: user.uid,
      createdAt: serverTimestamp()
    });

    transaction.set(userRef, {
      uid: user.uid,
      email: user.email,
      username: cleanUsername,
      displayName: username.trim(),
      createdAt: serverTimestamp(),
      tournamentsJoined: 0,
      verifiedWins: 0
    });
  });
}
