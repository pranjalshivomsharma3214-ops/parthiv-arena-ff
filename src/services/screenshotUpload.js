
import { auth } from "./firebase";

export async function uploadScreenshot(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please select a valid image.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be under 5 MB.");
  }

  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  const token = await user.getIdToken();

  const signResponse = await fetch("/api/sign-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const signData = await signResponse.json();

  if (!signResponse.ok) {
    throw new Error(signData.error || "Upload authorization failed.");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", signData.api_key);
  formData.append("timestamp", signData.timestamp);
  formData.append("folder", signData.folder);
  formData.append("upload_preset", signData.upload_preset);
  formData.append("signature", signData.signature);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const uploadData = await uploadResponse.json();

  if (!uploadResponse.ok) {
    throw new Error(uploadData.error?.message || "Image upload failed.");
  }

  return {
    imageUrl: uploadData.secure_url,
    publicId: uploadData.public_id,
  };
}
