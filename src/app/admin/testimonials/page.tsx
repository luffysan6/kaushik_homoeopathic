"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Star,
  Plus,
  Trash2,
  Pencil,
  X,
  Loader2,
  MessageSquareQuote,
  User,
} from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number | null;
  published: boolean;
  media: { url: string } | null;
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          title={`${n} star${n > 1 ? "s" : ""}`}
          aria-label={`Rate ${n} stars`}
        >
          <Star
            size={20}
            className={n <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"}
          />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/testimonials");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setRole("");
    setContent("");
    setRating(0);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setFormOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditing(t);
    setName(t.name);
    setRole(t.role ?? "");
    setContent(t.content);
    setRating(t.rating ?? 0);
    setFile(null);
    setPreviewUrl(t.media?.url ?? null);
    setError(null);
    setFormOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleSave() {
    if (!name.trim() || !content.trim()) {
      setError("Name and testimonial text are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("content", content);
    formData.append("rating", rating ? String(rating) : "");
    if (file) formData.append("file", file);

    const res = await fetch(
      editing ? `/api/testimonials/${editing.id}` : "/api/testimonials",
      { method: editing ? "PATCH" : "POST", body: formData }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Try again.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setFormOpen(false);
    await load();
  }

  async function togglePublished(t: Testimonial) {
    const formData = new FormData();
    formData.append("published", String(!t.published));
    await fetch(`/api/testimonials/${t.id}`, { method: "PATCH", body: formData });
    setItems((prev) =>
      prev.map((item) => (item.id === t.id ? { ...item, published: !item.published } : item))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Testimonials</h1>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? "Loading…" : `${items.length} testimonial${items.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add testimonial
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-16 text-gray-400">
            <Loader2 size={22} className="animate-spin" />
            <p className="text-sm">Loading testimonials…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-16 text-center">
            <MessageSquareQuote size={28} className="text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No testimonials yet</p>
            <p className="text-xs text-gray-400">Add your first testimonial to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((t) => (
              <div
                key={t.id}
                className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start gap-3">
                  {t.media ? (
                    <img
                      src={t.media.url}
                      alt={t.name}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <User size={18} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{t.name}</p>
                    {t.role && <p className="truncate text-xs text-gray-400">{t.role}</p>}
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      t.published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {t.published ? "Published" : "Hidden"}
                  </span>
                </div>

                {t.rating && (
                  <div className="mb-2 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={13}
                        className={n <= t.rating! ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                      />
                    ))}
                  </div>
                )}

                <p className="mb-4 text-sm text-gray-600">{t.content}</p>

                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => togglePublished(t)}
                    className="text-xs font-medium text-gray-500 hover:text-emerald-600"
                  >
                    {t.published ? "Hide" : "Publish"}
                  </button>
                  <span className="text-gray-200">•</span>
                  <button
                    onClick={() => openEdit(t)}
                    title="Edit"
                    aria-label="Edit testimonial"
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <span className="text-gray-200">•</span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    title="Delete"
                    aria-label="Delete testimonial"
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/edit modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !saving && setFormOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {editing ? "Edit testimonial" : "Add testimonial"}
              </h2>
              <button
                onClick={() => setFormOpen(false)}
                title="Close"
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <User size={22} />
                  </div>
                )}
                <label className="cursor-pointer text-sm font-medium text-emerald-600 hover:text-emerald-700">
                  {previewUrl ? "Change photo" : "Add photo (optional)"}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Patient name"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Role (optional)</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Patient since 2022"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Testimonial</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="What the patient said…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Rating (optional)</label>
                <StarRating value={rating} onChange={setRating} />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? "Saving…" : editing ? "Save changes" : "Add testimonial"}
              </button>
              <button
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}