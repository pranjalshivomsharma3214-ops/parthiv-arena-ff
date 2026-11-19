
import { adminAuth } from "../server/firebaseAdmin.js";
import { v2 as cloudinary } from "cloudinary";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({ error: "Login required" });
    }

    const user = await adminAuth.verifyIdToken(token);

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `parthiv_arena/screenshots/${user.uid}`;

    const params = {
      timestamp,
      folder,
      upload_preset: "parthiv_arena_screenshots",
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      signature,
      timestamp,
      folder,
      upload_preset: "parthiv_arena_screenshots",
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error("Secure upload error:", error.message);
    return res.status(401).json({ error: "Authentication failed" });
  }
}
