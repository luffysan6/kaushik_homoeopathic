"use client";

import { useEffect, useState, useCallback } from "react";

type MediaItem = {
  id: string;
  url: string;
  caption: string | null;
};

export default function GalleryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    const res = await fetch("/api/media?type=GALLERY");
    const data = await res.json();
    setItems(data);
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const captionInput = form.elements.namedItem("caption") as HTMLInputElement;

    if (!fileInput.files?.[0]) {
      setError("Please choose an image.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("type", "GALLERY");
    formData.append("caption", captionInput.value);

    const res = await fetch("/api/media", { method: "POST", body: formData });

    if (!res.ok) {
      setError("Upload failed. Try again.");
    } else {
      form.reset();
      await loadMedia();
    }
    setUploading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/media?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-semibold">Gallery</h1>

        <form
          onSubmit={handleUpload}
          className="mb-8 flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Image</label>
            <input type="file" name="file" accept="image/*" required className="text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Caption (optional)</label>
            <input
              type="text"
              name="caption"
              className="rounded border px-3 py-2 text-sm"
              placeholder="e.g. Reception area"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg border bg-white">
              <img src={item.url} alt={item.caption ?? ""} className="h-32 w-full object-cover" />
              {item.caption && (
                <p className="truncate px-2 py-1 text-xs text-gray-500">{item.caption}</p>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute right-1 top-1 rounded bg-red-600 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-400">No images uploaded yet.</p>
        )}
      </div>
    </div>
  );
}