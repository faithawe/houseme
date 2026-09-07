/**
 * Upload an image to Cloudinary when configured; otherwise return a data URL.
 */
export async function uploadImageFile(
  file: File,
  options?: { preferDataUrl?: boolean },
): Promise<string> {
  if (options?.preferDataUrl) {
    return fileToCompressedDataUrl(file);
  }

  try {
    const signResponse = await fetch(
      `/api/upload/sign?filename=${encodeURIComponent(file.name || "photo.jpg")}`,
    );
    if (!signResponse.ok) {
      return fileToCompressedDataUrl(file);
    }

    const json = (await signResponse.json()) as {
      data?: {
        configured?: boolean;
        uploadUrl?: string;
        apiKey?: string;
        timestamp?: number;
        signature?: string;
        folder?: string;
        publicId?: string;
      };
    };

    if (!json.data?.configured || !json.data.uploadUrl) {
      return fileToCompressedDataUrl(file);
    }

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", json.data.apiKey!);
    form.append("timestamp", String(json.data.timestamp));
    form.append("signature", json.data.signature!);
    form.append("folder", json.data.folder!);
    form.append("public_id", json.data.publicId!);

    const uploadResponse = await fetch(json.data.uploadUrl, {
      method: "POST",
      body: form,
    });

    if (!uploadResponse.ok) {
      return fileToCompressedDataUrl(file);
    }

    const uploaded = (await uploadResponse.json()) as {
      secure_url?: string;
      url?: string;
    };
    return uploaded.secure_url || uploaded.url || (await fileToCompressedDataUrl(file));
  } catch {
    return fileToCompressedDataUrl(file);
  }
}

async function fileToCompressedDataUrl(
  file: File,
  maxEdge = 1280,
  quality = 0.72,
): Promise<string> {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Invalid image"));
    el.src = source;
  });

  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}
