"use client";

import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Inbox,
  Loader2,
  Filter,
  Clock,
} from "lucide-react";

type Submission = {
  id: string;
  formSlug: string;
  data: Record<string, string>;
  createdAt: string;
};

const FORM_STYLES: Record<string, { label: string; bg: string; text: string }> =
  {
    general: { label: "General", bg: "bg-blue-50", text: "text-blue-700" },
    appointment: {
      label: "Appointment",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
  };

function FormBadge({ slug }: { slug: string }) {
  const style = FORM_STYLES[slug] ?? {
    label: slug,
    bg: "bg-gray-100",
    text: "text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [formSlug, setFormSlug] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = formSlug ? `?formSlug=${formSlug}` : "";
    fetch(`/api/contact/submissions${query}`)
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data);
        setLoading(false);
      });
  }, [formSlug]);

  const exportQuery = formSlug ? `?formSlug=${formSlug}` : "";

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Contact submissions
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "Loading…"
                : `${submissions.length} submission${submissions.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={`/api/contact/submissions/export/excel${exportQuery}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <FileSpreadsheet size={16} />
              Excel
            </a>

            <a
              href={`/api/contact/submissions/export/pdf${exportQuery}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <FileText size={16} />
              PDF
            </a>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4 flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <select
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          >
            <option value="">All forms</option>
            <option value="general">General</option>
            <option value="appointment">Appointment</option>
          </select>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
              <Loader2 size={22} className="animate-spin" />
              <p className="text-sm">Loading submissions…</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Inbox size={28} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-600">
                No submissions yet
              </p>
              <p className="text-xs text-gray-400">
                Submissions will appear here once visitors use the contact form.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/60">
                  <tr>
                    <th className="px-5 py-3 font-medium text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} />
                        Submitted
                      </span>
                    </th>
                    <th className="px-5 py-3 font-medium text-gray-500">
                      Form
                    </th>
                    <th className="px-5 py-3 font-medium text-gray-500">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-emerald-50/30"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 align-top text-gray-500">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <FormBadge slug={s.formSlug} />
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <dl className="space-y-1">
                          {Object.entries(s.data).map(([k, v]) => (
                            <div key={k} className="flex gap-1.5 text-gray-700">
                              <dt className="font-medium capitalize text-gray-400">
                                {k}:
                              </dt>
                              <dd>{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
