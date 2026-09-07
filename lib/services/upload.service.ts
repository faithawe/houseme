/**
 * Cloudinary signed uploads (free tier). Falls back to unavailable when unset.
 */
import { createHash } from "node:crypto";
import { ExternalServiceError } from "@/lib/errors";

export type UploadSignResult = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  uploadUrl: string;
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) return null;
  return value;
}

export const uploadService = {
  isConfigured() {
    return Boolean(
      requiredEnv("CLOUDINARY_CLOUD_NAME") &&
        requiredEnv("CLOUDINARY_API_KEY") &&
        requiredEnv("CLOUDINARY_API_SECRET"),
    );
  },

  async sign(filename: string): Promise<UploadSignResult> {
    const cloudName = requiredEnv("CLOUDINARY_CLOUD_NAME");
    const apiKey = requiredEnv("CLOUDINARY_API_KEY");
    const apiSecret = requiredEnv("CLOUDINARY_API_SECRET");

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ExternalServiceError(
        "Cloudinary is not configured. Add CLOUDINARY_* env vars.",
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "houseme";
    const safeName = filename
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 40);
    const publicId = `${folder}/${Date.now()}-${safeName || "photo"}`;

    const toSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(toSign).digest("hex");

    return {
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      publicId,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    };
  },

  async delete(publicId: string): Promise<{ ok: true }> {
    const cloudName = requiredEnv("CLOUDINARY_CLOUD_NAME");
    const apiKey = requiredEnv("CLOUDINARY_API_KEY");
    const apiSecret = requiredEnv("CLOUDINARY_API_SECRET");

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ExternalServiceError("Cloudinary is not configured.");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(toSign).digest("hex");

    const body = new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      api_key: apiKey,
      signature,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      { method: "POST", body },
    );

    if (!response.ok) {
      throw new ExternalServiceError("Could not delete Cloudinary image.");
    }

    return { ok: true };
  },
};
