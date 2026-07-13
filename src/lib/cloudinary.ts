import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function uploadImage(
  file: File,
  folder: "gallery" | "testimonial",
  labelForPath: string
): Promise<{ url: string; publicId: string }> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("File exceeds 5MB limit.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const publicId = `clinic/${folder}/${slugify(labelForPath) || "image"}-${Date.now().toString(36)}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        transformation: [
          { quality: "auto", fetch_format: "auto" },
          { width: 1600, crop: "limit" },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;