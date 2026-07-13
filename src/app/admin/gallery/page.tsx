"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";

type MediaItem = {
  id: string;
  url: string;
  caption: string | null;
};

type PendingFile = {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
};

export default function GalleryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async () => {
    const res = await fetch("/api/media?type=GALLERY");
    const data = await res.json();
    setItems(data);
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // clean up object URLs when pending files change or unmount
  useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [pending]);

  // lightbox: close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxItem(null);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPending: PendingFile[] = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      caption: "",
    }));

    setPending((prev) => [...prev, ...newPending]);
    setError(null);
    // reset input so selecting the same file again still fires onChange
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePending(id: string) {
    setPending((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  function updateCaption(id: string, caption: string) {
    setPending((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p)),
    );
  }

  async function handleUploadAll() {
    if (pending.length === 0) {
      setError("Choose at least one image first.");
      return;
    }

    setUploading(true);
    setError(null);

    for (const item of pending) {
      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("type", "GALLERY");
      formData.append("caption", item.caption);

      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (!res.ok) {
        setError(`Failed to upload "${item.file.name}". Try again.`);
        setUploading(false);
        return;
      }
    }

    pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPending([]);
    await loadMedia();
    setUploading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/media?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800">Gallery</h1>

        {/* Upload area */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <label
            htmlFor="file-input"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40"
          >
            <span className="text-sm font-medium text-gray-700">
              Click to choose images
            </span>
            <span className="mt-1 text-xs text-gray-400">
              PNG, JPG up to 5MB each — you can select multiple
            </span>
          </label>
          <input
            id="file-input"
            ref={fileInputRef}
            type="file"
            name="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Pending preview grid */}
          {pending.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-gray-700">
                {pending.length} image{pending.length > 1 ? "s" : ""} ready to
                upload
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {pending.map((p) => (
                  <div
                    key={p.id}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white"
                  >
                    <img
                      src={p.previewUrl}
                      alt="Selected preview"
                      className="h-28 w-full object-cover"
                    />
                    <button
                      onClick={() => removePending(p.id)}
                      aria-label="Remove image"
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                    >
                      ✕
                    </button>
                    <input
                      type="text"
                      placeholder="Caption (optional)"
                      value={p.caption}
                      onChange={(e) => updateCaption(p.id, e.target.value)}
                      className="w-full border-t border-gray-200 px-2 py-1 text-xs text-gray-700 placeholder-gray-400 outline-none focus:bg-emerald-50/40"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleUploadAll}
                  disabled={uploading}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {uploading
                    ? "Uploading…"
                    : `Upload ${pending.length} image${pending.length > 1 ? "s" : ""}`}
                </button>
                <button
                  onClick={() => {
                    pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
                    setPending([]);
                  }}
                  disabled={uploading}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        {/* Uploaded gallery grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <button
                onClick={() => setLightboxItem(item)}
                className="block w-full"
                aria-label="View full image"
              >
                <img
                  src={item.url}
                  alt={item.caption ?? ""}
                  className="h-32 w-full cursor-zoom-in object-cover transition group-hover:opacity-90"
                />
              </button>
              {item.caption && (
                <p className="truncate px-2 py-1 text-xs text-gray-500">
                  {item.caption}
                </p>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                title="Delete image"
                aria-label="Delete image"
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 opacity-0 shadow-sm transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-400">
            No images uploaded yet.
          </p>
        )}
      </div>

      {/* Lightbox modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxItem(null)}
        >
          <button
            onClick={() => setLightboxItem(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            ✕
          </button>
          <div
            className="max-h-[85vh] max-w-4xl overflow-hidden rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxItem.url}
              alt={lightboxItem.caption ?? ""}
              className="max-h-[85vh] w-auto object-contain"
            />
            {lightboxItem.caption && (
              <p className="bg-white px-4 py-2 text-sm text-gray-700">
                {lightboxItem.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
