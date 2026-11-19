
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAQp5aK0RB7CJXt2_tRK4iggke4-CNQwU4",
  authDomain: "ff-arena-india-f9eab.firebaseapp.com",
  projectId: "ff-arena-india-f9eab",
  storageBucket: "ff-arena-india-f9eab.firebasestorage.app",
  messagingSenderId: "182427446640",
  appId: "1:182427446640:web:f5873c6bf4c7d2ac6773b5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
