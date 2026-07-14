"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Loader2,
  ClipboardList,
  GripVertical,
} from "lucide-react";

type FieldType = "text" | "email" | "tel" | "textarea" | "date";

type Field = {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
};

type ContactForm = {
  id: string;
  slug: string;
  name: string;
  fields: Field[];
};

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "textarea", label: "Long text" },
  { value: "date", label: "Date" },
];

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function FormsPage() {
  const [forms, setForms] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContactForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [fields, setFields] = useState<Field[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/contact-forms");
    setForms(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName("");
    setSlug("");
    setFields([{ name: "name", label: "Name", type: "text", required: true }]);
    setError(null);
    setFormOpen(true);
  }

  function openEdit(f: ContactForm) {
    setEditing(f);
    setName(f.name);
    setSlug(f.slug);
    setFields(f.fields);
    setError(null);
    setFormOpen(true);
  }

  function addField() {
    setFields((prev) => [...prev, { name: "", label: "", type: "text", required: false }]);
  }

  function updateField(index: number, patch: Partial<Field>) {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== index) return f;
        const updated = { ...f, ...patch };
        // auto-derive the internal field name from the label as they type
        if (patch.label !== undefined) {
          updated.name = slugify(patch.label).replace(/-/g, "_");
        }
        return updated;
      })
    );
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Form name is required.");
      return;
    }
    if (fields.length === 0) {
      setError("Add at least one field.");
      return;
    }
    if (fields.some((f) => !f.label.trim())) {
      setError("Every field needs a label.");
      return;
    }

    setSaving(true);
    setError(null);

    const res = await fetch(
      editing ? `/api/contact-forms/${editing.id}` : "/api/contact-forms",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editing ? { name, fields } : { slug: slugify(name), name, fields }
        ),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setFormOpen(false);
    await load();
  }

  async function handleDelete(f: ContactForm) {
    if (!confirm(`Delete "${f.name}"?`)) return;
    const res = await fetch(`/api/contact-forms/${f.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Couldn't delete this form.");
      return;
    }
    setForms((prev) => prev.filter((form) => form.id !== f.id));
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Contact forms</h1>
            <p className="mt-1 text-sm text-gray-500">Manage which fields each form collects</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            New form
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-16 text-gray-400">
            <Loader2 size={22} className="animate-spin" />
            <p className="text-sm">Loading forms…</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-16 text-center">
            <ClipboardList size={28} className="text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No forms yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {forms.map((f) => (
              <div
                key={f.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{f.name}</p>
                    <p className="text-xs text-gray-400">slug: {f.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(f)}
                      title="Edit"
                      aria-label="Edit form"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(f)}
                      title="Delete"
                      aria-label="Delete form"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {f.fields.map((field) => (
                    <span
                      key={field.name}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                    >
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Builder modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !saving && setFormOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {editing ? "Edit form" : "New form"}
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
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Form name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Book Appointment"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
                {!editing && name && (
                  <p className="mt-1 text-xs text-gray-400">slug: {slugify(name)}</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="mb-2 text-sm font-medium text-gray-700">Fields</p>
                <div className="space-y-2">
                  {fields.map((field, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 p-2"
                    >
                      <GripVertical size={14} className="shrink-0 text-gray-300" />
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(i, { label: e.target.value })}
                        placeholder="Field label"
                        className="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(i, { type: e.target.value as FieldType })}
                        className="rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-600 outline-none focus:border-emerald-400"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <label className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(i, { required: e.target.checked })}
                        />
                        Required
                      </label>
                      <button
                        onClick={() => removeField(i)}
                        title="Remove field"
                        aria-label="Remove field"
                        className="shrink-0 text-gray-300 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addField}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  <Plus size={14} />
                  Add field
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? "Saving…" : editing ? "Save changes" : "Create form"}
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